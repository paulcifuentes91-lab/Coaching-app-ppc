/* Recordatorios push - corre por GitHub Actions (cron cada hora, ver
   .github/workflows/recordatorios.yml), no por Cloud Functions (evita
   depender del plan Blaze de Firebase - ver conversacion sobre
   notificaciones push).

   Un solo fetch de todos los atletas por corrida; para cada uno se evalua
   cada regla de REGLAS y se envia la que coincida con su hora local
   (contacto.zonaHoraria). La regla "entreno" ademas exige que hoy sea dia
   de entrenamiento segun plan.weeklyOrder - reutiliza el MISMO mapeo
   dia-de-semana que el cliente (localWeekday() en cada plan-*.html), asi
   que coincide exactamente con lo que el atleta ve en su app. Las demas
   reglas (agua, comidas, motivacion) son genericas, sin leer datos del
   plan - se disparan solo por hora.

   Prototipo original (solo "entreno"): probado primero con Francisca antes
   de replicar a los 13 restantes y de agregar agua/comidas/motivacion. */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

const DRY_RUN = process.env.DRY_RUN === 'true';
// Solo para pruebas manuales (workflow_dispatch) - salta el filtro de
// hora/dia y envia de inmediato TODO lo que aplique a quien tenga token.
// El cron programado NUNCA pasa esta variable, asi que en produccion no
// tiene efecto.
const TEST_SEND = process.env.TEST_SEND === 'true';

const key = JSON.parse(process.env.FIREBASE_KEY);
initializeApp({ credential: cert(key) });
const db = getFirestore();
const messaging = getMessaging();

// Mismo mapeo que localWeekday() en el cliente: Dom=0..Sab=6
function localWeekday(tz, date) {
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(date);
  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[wd];
}

function localHour(tz, date) {
  return +new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(date);
}

// Dia de entrenamiento de hoy segun plan.weeklyOrder, o null si es descanso
// o no hay plan configurado.
function diaDeEntrenoHoy(data, tz, ahora) {
  const weeklyOrder = data.plan && data.plan.weeklyOrder;
  if (!Array.isArray(weeklyOrder) || !weeklyOrder.length) return null;
  const jsDay = localWeekday(tz, ahora);
  const mondayIdx = (jsDay + 6) % 7;
  const dayId = weeklyOrder[mondayIdx];
  if (!dayId) return null;
  const days = (data.plan && data.plan.days) || [];
  const dayInfo = days.find(d => d.id === dayId);
  return dayInfo ? dayInfo.name : '';
}

const REGLAS = [
  {
    id: 'entreno',
    horas: [8],
    requiereDiaEntreno: true,
    armar: (dayName) => ({
      title: 'Hoy toca entrenar 💪',
      body: dayName ? `Día: ${dayName}` : 'Tu plan te espera'
    })
  },
  {
    id: 'agua',
    horas: [10, 14, 18],
    requiereDiaEntreno: false,
    armar: () => ({ title: '💧 Hidratación', body: 'Es buen momento para tomar agua' })
  },
  {
    id: 'comidas',
    horas: [8, 13, 19],
    requiereDiaEntreno: false,
    armar: () => ({ title: '🍽️ Hora de comer', body: 'No olvides tu próxima comida según tu plan' })
  },
  {
    id: 'motivacion',
    horas: [20],
    requiereDiaEntreno: false,
    armar: () => ({ title: '🎯 Reflexión del día', body: '¿Qué hiciste hoy que te acercó a tu meta?' })
  }
];

(async () => {
  const ahora = new Date();
  const snap = await db.collection('athletes').get();
  let conToken = 0, enviados = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const tokens = data.fcmTokens;
    if (!Array.isArray(tokens) || !tokens.length) continue;
    conToken++;

    const tz = (data.contacto && data.contacto.zonaHoraria) || 'America/Santiago';
    const nombre = (data.contacto && data.contacto.nombre) || doc.id;
    const hora = localHour(tz, ahora);
    const dayName = diaDeEntrenoHoy(data, tz, ahora); // '' si descansa/no hay plan

    for (const regla of REGLAS) {
      const coincideHora = TEST_SEND || regla.horas.includes(hora);
      if (!coincideHora) continue;
      if (regla.requiereDiaEntreno && !dayName && !TEST_SEND) {
        console.log(`${nombre} [${regla.id}]: hoy es dia de descanso - se salta`);
        continue;
      }

      const { title, body } = regla.armar(dayName);

      if (DRY_RUN) {
        console.log(`[DRY RUN] ${nombre} [${regla.id}] (${tz}, ${hora}h): "${title}" / "${body}" a ${tokens.length} token(s)`);
        continue;
      }

      try {
        const resp = await messaging.sendEachForMulticast({ tokens, notification: { title, body } });
        enviados++;
        const malos = [];
        resp.responses.forEach((r, i) => { if (!r.success) malos.push(tokens[i]); });
        if (malos.length) {
          await doc.ref.update({ fcmTokens: FieldValue.arrayRemove(...malos) });
        }
        console.log(`${nombre} [${regla.id}]: enviado a ${resp.successCount}/${tokens.length} dispositivo(s)${malos.length ? `, ${malos.length} token(s) invalido(s) removido(s)` : ''}`);
      } catch (e) {
        console.error(`${nombre} [${regla.id}]: ERROR al enviar -`, e.message);
      }
    }
  }

  console.log(`\nResumen: ${snap.size} atleta(s) totales, ${conToken} con notificaciones activadas, ${enviados} envio(s) realizados.`);
  process.exit(0);
})().catch(e => { console.error('ERROR FATAL:', e.message); process.exit(1); });
