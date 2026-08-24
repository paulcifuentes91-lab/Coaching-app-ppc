/* Recordatorios push - corre por GitHub Actions (cron cada 30 min, ver
   .github/workflows/recordatorios.yml), no por Cloud Functions (evita
   depender del plan Blaze de Firebase - ver conversacion sobre
   notificaciones push).

   UN SOLO fetch de todos los atletas por corrida (db.collection('athletes')
   .get() una vez); para cada uno se evaluan las 6 reglas de REGLAS sobre
   los mismos datos ya traidos - ninguna regla hace lecturas adicionales a
   Firestore, así que agregar reglas no multiplica las consultas.

   VENTANA DE TIEMPO, no hora exacta: diagnostico confirmado con datos
   reales (24-ago) - GitHub Actions NO respeta el cron "0,30 * * * *" con
   precision de minuto (corrio a las 02:49, 04:00, 05:20, 06:05... casi
   nunca en :00/:30, con huecos de 45 a 95 min). Exigir hora exacta daba
   CERO envios reales en 11 corridas seguidas, con hasta 5 atletas ya
   activados. Ahora cada regla dispara si la hora local del atleta cae
   dentro de VENTANA_MIN minutos de cualquiera de sus horas objetivo.

   Como la ventana puede coincidir en mas de una corrida del cron (ej. el
   cron pasa dos veces dentro de la misma ventana de ±20 min), se guarda
   en athletes/{id}.recordatoriosEnviados un registro de que YA se envio
   esa regla+hora+fecha, para no duplicar. La key incluye la fecha local
   del atleta, asi que se resetea sola al dia siguiente sin necesitar
   limpieza (mismo patron que otros campos de este proyecto, ej. checks).

   Cada regla define:
   - horas: horarios "HH:MM" objetivo (hora local del atleta,
     contacto.zonaHoraria) - VENTANA_MIN minutos de tolerancia alrededor.
   - condicion(data, tz, ahora): opcional. Si la regla depende de datos del
     atleta (ej. si hoy es dia de entreno), devuelve el contexto a pasar a
     armar(), o un valor falsy para saltarse esa regla. Sin condicion, la
     regla se dispara siempre que coincida la ventana.
   - armar(ctx): arma {title, body} del push.

   Reutiliza el MISMO mapeo dia-de-semana que usa el cliente
   (localWeekday() en cada plan-*.html) para la regla de entreno, asi
   coincide exactamente con lo que el atleta ve en su app. */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

const DRY_RUN = process.env.DRY_RUN === 'true';
// Solo para pruebas manuales (workflow_dispatch) - salta el filtro de
// hora/condicion y envia de inmediato TODO lo que aplique a quien tenga
// token. El cron programado NUNCA pasa esta variable, asi que en
// produccion no tiene efecto.
const TEST_SEND = process.env.TEST_SEND === 'true';
// Opcional, solo junto con TEST_SEND: limita la prueba a un unico
// documento de Firestore (ej. "sandy-gaete-julio-2026") en vez de a
// todos los que tengan token.
const TEST_ATHLETE = process.env.TEST_ATHLETE || '';

const key = JSON.parse(process.env.FIREBASE_KEY);
initializeApp({ credential: cert(key) });
const db = getFirestore();
const messaging = getMessaging();

// Tolerancia alrededor de cada hora objetivo, para absorber el drift real
// del cron de GitHub Actions (ver diagnostico arriba).
const VENTANA_MIN = 20;

function minutosDelDia(horaStr) {
  const [h, m] = horaStr.split(':').map(Number);
  return h * 60 + m;
}

// Hora objetivo (de regla.horas) mas cercana a la hora actual, si esta
// dentro de VENTANA_MIN minutos - null si ninguna cae en rango.
function horaObjetivoEnVentana(horaActualStr, horasObjetivo) {
  const actual = minutosDelDia(horaActualStr);
  return horasObjetivo.find(h => Math.abs(actual - minutosDelDia(h)) <= VENTANA_MIN) || null;
}

// Mismo mapeo que localWeekday() en el cliente: Dom=0..Sab=6
function localWeekday(tz, date) {
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(date);
  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[wd];
}

function localTimeStr(tz, date) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date);
  return `${p.find(x => x.type === 'hour').value}:${p.find(x => x.type === 'minute').value}`;
}

// Mismo formato que localDateStr() en el cliente (en-CA da YYYY-MM-DD)
function localDateStr(tz, date) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return `${p.find(x => x.type === 'year').value}-${p.find(x => x.type === 'month').value}-${p.find(x => x.type === 'day').value}`;
}

// Nombre del dia de entrenamiento de hoy segun plan.weeklyOrder, '' si hoy
// es descanso o no hay plan configurado (para distinguir de null = no aplica).
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

const FRASES_MOTIVACION_GENERICAS = [
  'Cada día cuenta.',
  'El progreso no es lineal, pero es real si eres constante.',
  'Un paso más cerca de la meta.',
  'Tu esfuerzo de hoy es tu resultado de mañana.',
  'Pequeñas acciones, grandes cambios.'
];
function fraseMotivacionDelDia() {
  return FRASES_MOTIVACION_GENERICAS[new Date().getUTCDate() % FRASES_MOTIVACION_GENERICAS.length];
}

const REGLAS = [
  {
    id: 'entreno',
    horas: ['08:00'],
    condicion: (data, tz, ahora) => diaDeEntrenoHoy(data, tz, ahora),
    armar: (dayName) => ({
      title: 'Hoy toca entrenar 💪',
      body: dayName ? `Día: ${dayName}` : 'Tu plan te espera'
    })
  },
  {
    id: 'agua_comida',
    horas: ['13:00', '19:00'],
    armar: () => ({
      title: 'Recordatorio 💧🍽️',
      body: 'Hidrátate y no olvides tu próxima comida'
    })
  },
  {
    id: 'motivacion',
    horas: ['20:00'],
    condicion: (data) => (data.contacto && data.contacto.objetivoHeader) || true, // nunca se salta - true si no hay meta propia
    armar: (objetivoHeader) => ({
      title: '🎯 Tu meta',
      body: (typeof objetivoHeader === 'string' && objetivoHeader)
        ? `Recuerda tu meta: ${objetivoHeader}. Cada día cuenta.`
        : fraseMotivacionDelDia()
    })
  },
  {
    id: 'como_te_sientes',
    horas: ['21:30'],
    armar: () => ({
      title: '🧠 ¿Cómo te sientes hoy?',
      body: 'Registra tu ánimo, energía y estrés del día en tu app'
    })
  },
  {
    id: 'descanso',
    horas: ['22:30'],
    armar: () => ({
      title: '😴 Hora de descansar',
      body: 'Prepárate para dormir bien - tu recuperación también es entrenamiento'
    })
  },
  {
    id: 'chequeo_proximo',
    horas: ['18:00'],
    condicion: (data, tz, ahora) => {
      const checkDate = data.plan && data.plan.checkDate;
      if (!checkDate) return false;
      const manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
      return localDateStr(tz, manana) === checkDate;
    },
    armar: () => ({
      title: '📅 Chequeo mañana',
      body: 'No olvides tus fotos y medidas para tu chequeo de mañana'
    })
  }
];

(async () => {
  const ahora = new Date();
  const snap = await db.collection('athletes').get(); // UNICA lectura de Firestore de toda la corrida
  let conToken = 0, enviados = 0;

  for (const doc of snap.docs) {
    if (TEST_ATHLETE && doc.id !== TEST_ATHLETE) continue;
    const data = doc.data();
    const tokens = data.fcmTokens;
    if (!Array.isArray(tokens) || !tokens.length) continue;
    conToken++;

    const tz = (data.contacto && data.contacto.zonaHoraria) || 'America/Santiago';
    const nombre = (data.contacto && data.contacto.nombre) || doc.id;
    const hora = localTimeStr(tz, ahora);
    const fechaLocal = localDateStr(tz, ahora);
    const enviadosPrevios = data.recordatoriosEnviados || {};

    for (const regla of REGLAS) {
      const horaObjetivo = TEST_SEND ? regla.horas[0] : horaObjetivoEnVentana(hora, regla.horas);
      if (!horaObjetivo) continue;

      const dedupKey = `${fechaLocal}-${regla.id}-${horaObjetivo}`;
      if (!TEST_SEND && enviadosPrevios[dedupKey]) {
        console.log(`${nombre} [${regla.id}]: ya se envió hoy en la ventana de ${horaObjetivo} - se salta`);
        continue;
      }

      const ctx = regla.condicion ? regla.condicion(data, tz, ahora) : true;
      if (!ctx && !TEST_SEND) {
        console.log(`${nombre} [${regla.id}]: condición no se cumple - se salta`);
        continue;
      }

      const { title, body } = regla.armar(ctx);

      if (DRY_RUN) {
        console.log(`[DRY RUN] ${nombre} [${regla.id}] (${tz}, ${hora}, objetivo ${horaObjetivo}): "${title}" / "${body}" a ${tokens.length} token(s)`);
        continue;
      }

      try {
        const resp = await messaging.sendEachForMulticast({ tokens, notification: { title, body } });
        enviados++;
        const malos = [];
        resp.responses.forEach((r, i) => { if (!r.success) malos.push(tokens[i]); });
        const actualizacion = { recordatoriosEnviados: { [dedupKey]: true } };
        if (malos.length) actualizacion.fcmTokens = FieldValue.arrayRemove(...malos);
        await doc.ref.set(actualizacion, { merge: true });
        console.log(`${nombre} [${regla.id}]: enviado a ${resp.successCount}/${tokens.length} dispositivo(s)${malos.length ? `, ${malos.length} token(s) invalido(s) removido(s)` : ''}`);
      } catch (e) {
        console.error(`${nombre} [${regla.id}]: ERROR al enviar -`, e.message);
      }
    }
  }

  console.log(`\nResumen: ${snap.size} atleta(s) totales, ${conToken} con notificaciones activadas, ${enviados} envio(s) realizados.`);
  process.exit(0);
})().catch(e => { console.error('ERROR FATAL:', e.message); process.exit(1); });
