const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-key.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

/* Limpia documentos de athletes/ que quedaron vacíos o rotos.

   Por defecto SOLO MUESTRA lo que borraría. Para borrar de verdad:
     node limpiar-firebase.js --borrar

   Antes (nov-2026) borraba todo documento sin `nombre` en la raíz o sin
   `plan`: los atletas reales guardan el nombre en contacto.nombre y los
   prospectos no tienen plan, así que habría borrado casi todo (33 de 45
   documentos). Ahora un documento solo se considera roto si no tiene
   nombre en ningún lado Y no tiene plan, anamnesis ni registros.
   Los documentos internos que empiezan con "_" (ej. _coach, que guarda los
   teléfonos del coach para los avisos) nunca se tocan. */
const BORRAR = process.argv.includes('--borrar');

function nombreDe(data) {
  return (data.nombre || (data.contacto && data.contacto.nombre) || '').trim();
}
function tieneDatos(data) {
  return !!(data.plan || data.anamnesis ||
    (Array.isArray(data.progressLog) && data.progressLog.length) ||
    (data.trainingChecks && Object.keys(data.trainingChecks).length));
}

async function cleanupAthletes() {
  try {
    console.log(BORRAR ? '🧹 Limpiando Firebase (BORRANDO)...\n' : '🔎 Revisión (no se borra nada; usa --borrar para borrar)...\n');

    const snapshot = await db.collection('athletes').get();
    let candidatos = 0;

    for (const doc of snapshot.docs) {
      if (doc.id.startsWith('_')) continue; // documentos internos (ej. _coach)
      const data = doc.data();

      // Roto = sin nombre en ningún lado y sin plan, anamnesis ni registros
      if (!nombreDe(data) && !tieneDatos(data)) {
        candidatos++;
        if (BORRAR) {
          await doc.ref.delete();
          console.log(`❌ Eliminado: ${doc.id}`);
        } else {
          console.log(`• Se eliminaría: ${doc.id} (campos: ${Object.keys(data).join(', ') || 'ninguno'})`);
        }
      }
    }

    console.log(BORRAR
      ? `\n✅ ${candidatos} registros defectuosos eliminados`
      : `\n${candidatos} documento(s) se eliminarían. Revisa la lista y, si está bien, corre: node limpiar-firebase.js --borrar`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupAthletes();
