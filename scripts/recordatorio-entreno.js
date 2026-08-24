/* Recordatorio push "hoy toca entrenar" - corre por GitHub Actions (cron
   cada hora, ver .github/workflows/recordatorio-entreno.yml), no por Cloud
   Functions (evita depender del plan Blaze de Firebase - ver conversacion
   sobre notificaciones push).

   Logica: para cada atleta con al menos un fcmToken registrado, calcula su
   hora local (contacto.zonaHoraria) y solo actua si son las HORA_RECORDATORIO
   en punto ahi. Si hoy es dia de entrenamiento segun plan.weeklyOrder, envia
   el push. Reutiliza el MISMO mapeo de dia-de-semana que usa el cliente
   (ver todayTrainingDayId()/localWeekday() en cada plan-*.html) para que
   coincida exactamente con lo que el atleta ve en su app.

   Prototipo: probado primero solo con Francisca antes de que el coach active
   notificaciones para los otros 13 atletas. */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

const HORA_RECORDATORIO = 8; // 8am hora local del atleta - fijo para v1
const DRY_RUN = process.env.DRY_RUN === 'true';
// Solo para pruebas manuales (workflow_dispatch) - salta el filtro de
// hora/dia y envia de inmediato a quien tenga token. El cron programado
// NUNCA pasa esta variable, asi que en produccion no tiene efecto.
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

(async () => {
  const ahora = new Date();
  const snap = await db.collection('athletes').get();
  let conToken = 0, enHoraDeEntreno = 0, enviados = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const tokens = data.fcmTokens;
    if (!Array.isArray(tokens) || !tokens.length) continue;
    conToken++;

    const tz = (data.contacto && data.contacto.zonaHoraria) || 'America/Santiago';
    const nombre = (data.contacto && data.contacto.nombre) || doc.id;

    const hora = localHour(tz, ahora);
    if (!TEST_SEND && hora !== HORA_RECORDATORIO) {
      console.log(`${nombre} (${tz}): son las ${hora}h local, no las ${HORA_RECORDATORIO}h - se salta`);
      continue;
    }

    const weeklyOrder = data.plan && data.plan.weeklyOrder;
    let dayId = null;
    if (Array.isArray(weeklyOrder) && weeklyOrder.length) {
      const jsDay = localWeekday(tz, ahora);
      const mondayIdx = (jsDay + 6) % 7;
      dayId = weeklyOrder[mondayIdx];
    }
    if (!dayId && !TEST_SEND) {
      console.log(`${nombre}: hoy es dia de descanso o sin weeklyOrder - se salta`);
      continue;
    }

    enHoraDeEntreno++;
    const days = (data.plan && data.plan.days) || [];
    const dayInfo = days.find(d => d.id === dayId);
    const dayName = dayInfo ? dayInfo.name : '';
    const body = dayName ? `Día: ${dayName}` : 'Tu plan te espera';

    if (DRY_RUN) {
      console.log(`[DRY RUN] ${nombre}: se enviaria "Hoy toca entrenar 💪" / "${body}" a ${tokens.length} token(s)`);
      continue;
    }

    try {
      const resp = await messaging.sendEachForMulticast({
        tokens,
        notification: { title: 'Hoy toca entrenar 💪', body }
      });
      enviados++;
      const malos = [];
      resp.responses.forEach((r, i) => { if (!r.success) malos.push(tokens[i]); });
      if (malos.length) {
        await doc.ref.update({ fcmTokens: FieldValue.arrayRemove(...malos) });
      }
      console.log(`${nombre}: enviado a ${resp.successCount}/${tokens.length} dispositivo(s)${malos.length ? `, ${malos.length} token(s) invalido(s) removido(s)` : ''}`);
    } catch (e) {
      console.error(`${nombre}: ERROR al enviar -`, e.message);
    }
  }

  console.log(`\nResumen: ${snap.size} atleta(s) totales, ${conToken} con notificaciones activadas, ${enHoraDeEntreno} en su hora de recordatorio con entreno hoy, ${enviados} envio(s) realizados.`);
  process.exit(0);
})().catch(e => { console.error('ERROR FATAL:', e.message); process.exit(1); });
