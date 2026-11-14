/* Recuperación puntual de progressLog desde los respaldos diarios
   (respaldos/{atleta}/dias/{fecha}, ver scripts/respaldos.js).

   Uso temporal (caso Nicole Jerez, nov-2026): lo corre el flujo
   .github/workflows/recuperar-progresslog.yml en su propia rama. La
   configuración está en scripts/recuperar-progresslog.json:
     - modo "listar": solo lee y muestra en el registro qué fechas faltan
       en el progressLog actual y en qué respaldos aparecen. NO muestra
       pesos ni medidas (el registro del flujo puede ser visible) y NO
       escribe nada.
     - modo "aplicar": en una transacción, guarda una copia del documento
       actual en respaldos/{atleta}/manual/{timestamp}, agrega a
       progressLog las fechas faltantes (de `fechas`, o todas las
       listadas si está vacío) tomando la versión del respaldo más reciente
       que la tenga, sin tocar las fechas que ya existen, y deja una
       entrada en athletes/{atleta}/auditoria. */
const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const cfg = JSON.parse(fs.readFileSync(__dirname + '/recuperar-progresslog.json', 'utf8'));
const ATLETA = cfg.atleta, MODO = cfg.modo, SOLO = new Set(cfg.fechas || []);
if (!ATLETA || !['listar', 'aplicar'].includes(MODO)) { console.error('Config inválida'); process.exit(1); }

initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_KEY)) });
const db = getFirestore();
const ref = db.collection('athletes').doc(ATLETA);

const campos = e => ['weight', 'waist', 'arm', 'thigh', 'bodyFatPct', 'skinfolds', 'salud', 'notes']
  .filter(k => e[k] !== null && e[k] !== undefined && e[k] !== '').join('+') || '(vacío)';

(async () => {
  const actual = ((await ref.get()).data() || {}).progressLog || [];
  const fechasActuales = new Set(actual.map(e => e && e.date).filter(Boolean));
  const dias = await db.collection('respaldos').doc(ATLETA).collection('dias').get();
  const ids = dias.docs.map(d => d.id).sort();
  console.log(`Atleta ${ATLETA} · progressLog actual: ${actual.length} registro(s): ${[...fechasActuales].sort().join(', ')}`);
  console.log(`Respaldos diarios disponibles: ${ids.length} (${ids[0] || '-'} a ${ids[ids.length - 1] || '-'})`);

  // Por fecha faltante: en qué respaldos aparece y la versión del más reciente.
  const faltan = {};
  const conteo = [];
  dias.docs.sort((a, b) => a.id < b.id ? -1 : 1).forEach(d => {
    const pl = ((d.data().snapshot || {}).progressLog) || [];
    conteo.push(`${d.id}:${pl.length}`);
    pl.forEach(e => {
      if (!e || !e.date || fechasActuales.has(e.date)) return;
      const f = faltan[e.date] = faltan[e.date] || { primero: d.id, ultimo: d.id, veces: 0, entrada: e };
      f.ultimo = d.id; f.veces++; f.entrada = e;
    });
  });
  console.log('Registros por respaldo: ' + conteo.join(' '));
  const lista = Object.keys(faltan).sort();
  console.log(`\nFechas que están en respaldos y faltan hoy: ${lista.length}`);
  lista.forEach(f => { const x = faltan[f]; console.log(`  ${f} · en ${x.veces} respaldo(s), del ${x.primero} al ${x.ultimo} · campos: ${campos(x.entrada)}`); });

  if (MODO === 'listar') { console.log('\nModo listar: no se escribió nada.'); return; }

  const elegidas = lista.filter(f => !SOLO.size || SOLO.has(f));
  if (!elegidas.length) { console.log('Nada que restaurar.'); return; }
  const stamp = new Date().toISOString();
  const res = await db.runTransaction(async t => {
    const snap = await t.get(ref);
    const data = snap.data() || {};
    const pl = data.progressLog || [];
    const ya = new Set(pl.map(e => e && e.date));
    const nuevos = elegidas.filter(f => !ya.has(f)).map(f => Object.assign({}, faltan[f].entrada, { restaurado: true, restauradoDesde: 'respaldo ' + faltan[f].ultimo }));
    const final = pl.concat(nuevos).sort((a, b) => String(a.date).localeCompare(String(b.date)));
    t.set(db.collection('respaldos').doc(ATLETA).collection('manual').doc(stamp), { snapshot: data, timestamp: stamp, motivo: 'antes de recuperar progressLog desde respaldos diarios' });
    t.set(ref, { progressLog: final }, { merge: true });
    t.create(ref.collection('auditoria').doc(), { timestamp: stamp, origen: 'restauracion', funcion: 'recuperarDesdeRespaldos',
      cambios: [{ campo: 'progressLog', valorAnterior: pl.length + ' registro(s)', valorNuevo: final.length + ' registro(s) · restaurados desde respaldos diarios: ' + nuevos.map(e => e.date).join(', ') }] });
    return { antes: pl.length, despues: final.length, fechas: nuevos.map(e => e.date) };
  });
  console.log(`\nAplicado: ${res.antes} → ${res.despues} registro(s). Restauradas: ${res.fechas.join(', ')}. Copia previa en respaldos/${ATLETA}/manual/${stamp}.`);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
