#!/bin/bash
echo "Descargando archivos nuevos..."

curl -s "https://claude.ai/api/files/outputs/plan-rosa-perez.html" -o ~/Coaching-app-ppc/plan-rosa-perez.html 2>/dev/null || echo "Intenta manualmente"
curl -s "https://claude.ai/api/files/outputs/plan-maria-jose-amezaga.html" -o ~/Coaching-app-ppc/plan-maria-jose-amezaga.html 2>/dev/null || echo "Intenta manualmente"
curl -s "https://claude.ai/api/files/outputs/plan-magdalena-pinto.html" -o ~/Coaching-app-ppc/plan-magdalena-pinto.html 2>/dev/null || echo "Intenta manualmente"
curl -s "https://claude.ai/api/files/outputs/panel-coach-v4-2-CON-LOGO.html" -o ~/Coaching-app-ppc/panel-coach-v4-2-CON-LOGO.html 2>/dev/null || echo "Intenta manualmente"
curl -s "https://claude.ai/api/files/outputs/panel-atletas-modificar.html" -o ~/Coaching-app-ppc/panel-atletas-modificar.html 2>/dev/null || echo "Intenta manualmente"
curl -s "https://claude.ai/api/files/outputs/panel-atletas-clases-presenciales.html" -o ~/Coaching-app-ppc/panel-atletas-clases-presenciales.html 2>/dev/null || echo "Intenta manualmente"

ls -lh ~/Coaching-app-ppc/plan-*.html ~/Coaching-app-ppc/panel-*.html | tail -6

