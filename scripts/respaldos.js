/* Respaldo diario de cada atleta - corre por GitHub Actions (cron una vez
   al dia, ver .github/workflows/respaldos.yml), no por Cloud Functions
   (mismo motivo que scripts/recordatorios.js: evita depender del plan
   Blaze de Firebase).

   Copia el documento COMPLETO de cada atleta a
   respaldos/{atletaId}/dias/{YYYY-MM-DD} una vez al dia, para poder
   restaurar a mano el estado de un dia anterior si algo se rompe (ver
   incidente de Diego, ago-2026: una escritura del panel dejo un guardado
   de nutricion con el resumen en 0 kcal antes de que se notara).

   Retencion de RETENCION_DIAS: en la misma corrida se borran los
   respaldos de cada atleta mas viejos que eso, ANTES de escribir el
   nuevo, para no crecer sin limite el almacenamiento gratis de Firestore
   (1 GiB). Con 14 atletas x ~60KB promedio x 90 dias son ~75MB en
   regimen permanente - muy por debajo del limite, y no crece mas alla de
   eso con el tiempo.

   Para restaurar un atleta a mano: leer
   respaldos/{atletaId}/dias/{fecha}.snapshot y escribirlo de vuelta en
   athletes/{atletaId} (reemplazando el doc completo, no merge). */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldPath } = require('firebase-admin/firestore');

const RETENCION_DIAS = 90;

const key = JSON.parse(process.env.FIREBASE_KEY);
initializeApp({ credential: cert(key) });
const db = getFirestore();

function hoyStr(){
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function fechaCorte(){
  return new Date(Date.now() - RETENCION_DIAS * 86400000).toISOString().slice(0, 10);
}

(async () => {
  const snap = await db.collection('athletes').get();
  const fecha = hoyStr();
  const corte = fechaCorte();
  let respaldados = 0, podados = 0, errores = 0;

  for (const doc of snap.docs) {
    const atletaId = doc.id;
    const data = doc.data();
    const diasRef = db.collection('respaldos').doc(atletaId).collection('dias');

    try {
      await diasRef.doc(fecha).set({
        snapshot: data,
        timestamp: new Date().toISOString(),
        tamañoBytes: Buffer.byteLength(JSON.stringify(data), 'utf8'),
      });
      respaldados++;

      // Los IDs de documento son fechas "YYYY-MM-DD", que ordenan igual
      // lexicograficamente que cronologicamente - permite el rango directo.
      const viejos = await diasRef.where(FieldPath.documentId(), '<', corte).get();
      for (const v of viejos.docs) {
        await v.ref.delete();
        podados++;
      }
    } catch (e) {
      console.error(`Error respaldando ${atletaId}:`, e.message);
      errores++;
    }
  }

  console.log(
    `Respaldo diario (${fecha}): ${respaldados} atleta(s) respaldado(s), ` +
    `${podados} respaldo(s) podado(s) por antiguedad (>${RETENCION_DIAS} dias), ` +
    `${errores} error(es).`
  );
  if (errores > 0) process.exit(1);
})().catch(e => {
  console.error('ERROR en respaldo diario:', e.message);
  process.exit(1);
});
