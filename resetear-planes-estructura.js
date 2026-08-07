const fs = require('fs');

// Leer el archivo base de María José
let baseContent = fs.readFileSync('plan-maria-jose-amezaga.html', 'utf8');

// Eliminar TODO el contenido de ejercicios entre los tags <div id="trainingView">...</div>
// Dejar la estructura, pero vacía

// Buscar la sección de Training y limpiarla
const trainingStart = baseContent.indexOf('id="trainingView"');
const trainingEnd = baseContent.indexOf('</div>', trainingStart + 1000) + 6;

// Reemplazar con estructura vacía
const trainingSection = `
<div id="trainingView" style="display: none;">
    <div style="padding: 20px;">
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
            <div style="font-size: 3rem; margin-bottom: 10px;">📝</div>
            <div style="font-size: 1.2rem; font-weight: 600;">Entrenamiento vacío</div>
            <div style="font-size: 0.9rem; margin-top: 10px; color: var(--text-faint);">Los detalles de entrenamiento se cargarán próximamente</div>
        </div>
    </div>
</div>
`;

baseContent = baseContent.substring(0, trainingStart) + trainingSection + baseContent.substring(trainingEnd);

// Guardar plantilla base
fs.writeFileSync('plan-template-vacío.html', baseContent);

console.log('✅ Plantilla base creada (estructura vacía)');
