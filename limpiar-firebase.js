const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-key.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function cleanupAthletes() {
  try {
    console.log('🧹 Limpiando Firebase...\n');
    
    const snapshot = await db.collection('athletes').get();
    let deleted = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Eliminar documentos sin nombre o plan
      if (!data.nombre || !data.plan) {
        await doc.ref.delete();
        console.log(`❌ Eliminado: ${data.nombre || 'SIN NOMBRE'}`);
        deleted++;
      }
    }

    console.log(`\n✅ ${deleted} registros defectuosos eliminados`);
    console.log('🎉 Firebase limpio');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupAthletes();
