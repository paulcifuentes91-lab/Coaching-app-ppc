const fs = require('fs');

// Leer base
const baseContent = fs.readFileSync('plan-maria-jose-amezaga.html', 'utf8');

const atletas = [
  { archivo: 'plan-elizabeth-ellmen.html', nombre: 'Elizabeth Ellmen', objetivo: 'Fuerza + Hombros', id: 'elizabeth-ellmen' },
  { archivo: 'plan-nicole-jerez.html', nombre: 'Nicole Jerez', objetivo: 'Bikini NZ', id: 'nicole-jerez' },
  { archivo: 'plan-nelson-diaz.html', nombre: 'Nelson Díaz', objetivo: 'General', id: 'nelson-diaz' },
  { archivo: 'plan-francisca-perez.html', nombre: 'Francisca Perez', objetivo: 'Tonificación', id: 'francisca-perez' },
  { archivo: 'plan-ivan-de-la-cerda.html', nombre: 'Iván De La Cerda', objetivo: 'Brazos', id: 'ivan-de-la-cerda' },
  { archivo: 'plan-diego-valdebenito.html', nombre: 'Diego Valdebenito', objetivo: 'Classic Physique', id: 'diego-valdebenito' },
  { archivo: 'plan-andrea-gonzalez.html', nombre: 'Andrea González', objetivo: 'Tonificación', id: 'andrea-gonzalez' },
  { archivo: 'plan-sandy-gaete.html', nombre: 'Sandy Gaete', objetivo: 'Wellness', id: 'sandy-gaete' },
  { archivo: 'plan-sebastian-guinart.html', nombre: 'Sebastián Guinart', objetivo: 'Classic Physique', id: 'sebastian-guinart' }
];

atletas.forEach(atleta => {
  let content = baseContent;
  
  // Reemplazar María José por el nombre
  content = content.replace(/María José Amezaga/g, atleta.nombre);
  content = content.replace(/maria-jose-amezaga-julio-2026/g, atleta.id + '-julio-2026');
  content = content.replace(/Fuerza \+ Performance/g, atleta.objetivo);
  content = content.replace(/Mesociclo Julio · Fuerza \+ Performance · Semana 1 a 4/g, 'Plan ' + atleta.nombre + ' · ' + atleta.objetivo);
  content = content.replace(/4 sesiones semanales · Salud y rendimiento/g, 'Entrenamiento personalizado · ' + atleta.objetivo);
  
  fs.writeFileSync(atleta.archivo, content);
  console.log(`✅ ${atleta.nombre} creado`);
});

console.log('\n🎉 ¡9 planes ONLINE creados!');
