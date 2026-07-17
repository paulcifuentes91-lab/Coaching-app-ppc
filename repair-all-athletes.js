#!/usr/bin/env node

/**
 * REPAIR ALL ATHLETES SCRIPT
 * Aplica los 9 fixes a todos los archivos de atletas
 * Timezone: America/Santiago (Chile)
 */

const fs = require('fs');
const path = require('path');

const ATHLETE_FILES = [
  'plan-andrea-gonzalez.html',
  'plan-diego-valdebenito.html',
  'plan-maria-jose-amezaga.html',
  'plan-nelson-diaz.html',
  'plan-nicole-jerez.html',
  'plan-paul-cifuentes.html',
  'plan-sandy-gaete.html',
  'plan-sebastian-guinart.html'
];

const INPUT_DIR = '/mnt/user-data/uploads';
const OUTPUT_DIR = '/mnt/user-data/outputs';

// TIMEZONE CONSTANT
const TIMEZONE = 'America/Santiago'; // Chile

// FIXES A APLICAR
const FIXES = [
  {
    name: 'Fix #1: todayStr() con timezone',
    old: /function todayStr\(\)\{ return new Date\(\)\.toISOString\(\)\.slice\(0,10\); \}/,
    new: `function todayStr(){ 
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: '${TIMEZONE}'
  });
  return formatter.format(new Date());
}`
  },
  {
    name: 'Fix #2: computeCurrentWeek() con fecha local',
    old: /function computeCurrentWeek\(\)\{[\s\S]*?return Math\.min\(Math\.max\(week,1\), 4\);\s*\}/,
    new: `function computeCurrentWeek(){
  if(!planStartDate) return null;
  const start = new Date(planStartDate + 'T00:00:00');
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: '${TIMEZONE}'
  });
  const localToday = formatter.format(new Date());
  const now = new Date(localToday + 'T00:00:00');
  const diffDays = Math.floor((now - start) / 86400000);
  if(diffDays < 0) return null;
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(week,1), 4);
}`
  },
  {
    name: 'Fix #3: todayTrainingDayId() con día local',
    old: /function todayTrainingDayId\(\)\{[\s\S]*?return \(id && days\.find\(d=>d\.id===id\)\) \? id : null;\s*\}/,
    new: `function todayTrainingDayId(){
  if(!weeklyOrder || !weeklyOrder.length) return null;
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: '${TIMEZONE}'
  });
  const dayName = formatter.format(new Date());
  const dayMap = {Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6};
  const jsDay = dayMap[dayName] || 0;
  const mondayIdx = (jsDay + 6) % 7;
  const id = weeklyOrder[mondayIdx];
  return (id && days.find(d=>d.id===id)) ? id : null;
}`
  },
  {
    name: 'Fix #4: todayISO() alias',
    old: /function todayISO\(\)\{ return new Date\(\)\.toISOString\(\)\.slice\(0,10\); \}/,
    new: `function todayISO(){ return todayStr(); }`
  },
  {
    name: 'Fix #5: lastNDates() con fechas locales',
    old: /function lastNDates\(n\)\{[\s\S]*?return out;\s*\}/,
    new: `function lastNDates(n){
  const out = [];
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: '${TIMEZONE}'
  });
  for(let i=n-1; i>=0; i--){
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    out.push(formatter.format(d));
  }
  return out;
}`
  },
  {
    name: 'Fix #6: checkAccessExpiry() con todayStr()',
    old: /function checkAccessExpiry\(\)\{[\s\S]*?const today = new Date\(\)\.toISOString\(\)\.slice\(0,10\);/,
    new: `function checkAccessExpiry(){
  renderCheckReminder();
  if(!accessExpiresAt) return false;
  const today = todayStr();`
  },
  {
    name: 'Fix #7: activeMealDate inicialización',
    old: /let activeMealDate = new Date\(\)\.toISOString\(\)\.slice\(0,10\);/,
    new: `let activeMealDate = null;`
  },
  {
    name: 'Fix #8: autoSelectCurrentPosition() inicializa activeMealDate',
    old: /function autoSelectCurrentPosition\(\)\{[\s\S]*?if\(mealWindows\.find\(m=>m\.id===target\)\) activeMealWindow = target;\s*\}/,
    new: `function autoSelectCurrentPosition(){
  if(autoSelectedOnce) return;
  autoSelectedOnce = true;
  const w = computeCurrentWeek();
  if(w) activeWeek = w;
  const dId = todayTrainingDayId();
  if(dId) activeDay = dId;
  if(w){
    const target = (w === 1) ? 'sem1-mant' : 'sem2-deficit';
    if(mealWindows.find(m=>m.id===target)) activeMealWindow = target;
  }
  activeMealDate = todayStr();
}`
  },
  {
    name: 'Fix #9: Progreso form dateInput.value',
    old: /dateInput\.value = new Date\(\)\.toISOString\(\)\.slice\(0,10\);/,
    new: `dateInput.value = todayStr();`
  }
];

function repairFile(filename) {
  const inputPath = path.join(INPUT_DIR, filename);
  const outputPath = path.join(OUTPUT_DIR, filename);

  console.log(`\n🔧 Reparando: ${filename}`);

  try {
    let content = fs.readFileSync(inputPath, 'utf8');
    let originalSize = content.length;

    // Aplicar cada fix
    FIXES.forEach(fix => {
      const match = content.match(fix.old);
      if (match) {
        console.log(`   ✓ ${fix.name}`);
        content = content.replace(fix.old, fix.new);
      } else {
        console.log(`   ⚠ ${fix.name} — no coincidió (posiblemente ya aplicado)`);
      }
    });

    // Guardar archivo reparado
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`   ✅ Guardado: ${outputPath} (${content.length} bytes)`);

    return { success: true, file: filename, message: 'Reparado exitosamente' };
  } catch (err) {
    console.error(`   ❌ ERROR: ${err.message}`);
    return { success: false, file: filename, error: err.message };
  }
}

// MAIN
console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║  REPARADOR AUTOMÁTICO DE ATLETAS                     ║');
console.log('║  Timezone: America/Santiago (Chile)                  ║');
console.log('╚═══════════════════════════════════════════════════════╝');

const results = ATHLETE_FILES.map(repairFile);

console.log('\n\n═══ RESUMEN ═══');
const success = results.filter(r => r.success).length;
const failed = results.filter(r => !r.success).length;

console.log(`✅ Exitosos: ${success}/${ATHLETE_FILES.length}`);
if (failed > 0) {
  console.log(`❌ Fallidos: ${failed}/${ATHLETE_FILES.length}`);
  results.filter(r => !r.success).forEach(r => {
    console.log(`   • ${r.file}: ${r.error}`);
  });
}

console.log('\n📁 Archivos guardados en: ' + OUTPUT_DIR);
console.log('\n✨ Listo para deploy a GitHub.\n');

process.exit(failed > 0 ? 1 : 0);
