# Alta de atleta nuevo — automática

Esta carpeta es un "buzón": lo que subas aquí se procesa solo y desaparece
(se mueve a `procesados/`). No hace falta computador ni instalar nada — se
puede hacer completo desde el celular, con la app de GitHub o el navegador.

## Pasos

1. En el panel (`panel-coach-ppc.html`), arma el entrenamiento del atleta como
   siempre y expórtalo (pestaña Entrenamiento → "Exportar plan"). Eso te
   descarga un archivo `.json`.

2. **Renombra ese archivo al nombre completo del atleta**, por ejemplo:

   ```
   Camila Rojas.json
   ```

   El nombre del archivo (sin el `.json`) es literalmente el nombre que va a
   quedar cargado. Revísalo bien antes de subirlo — después se puede corregir
   a mano en el panel, pero es más fácil dejarlo bien de una.

3. Sube ese archivo a **esta carpeta** (`nuevos-atletas-pendientes/`) del
   repositorio, vía GitHub → "Add file" → "Upload files". Confirma el commit
   directo a la rama `main`.

4. Eso dispara solo una GitHub Action que en menos de un minuto:
   - agrega al atleta en `panel-coach-ppc.html` (ATLETAS/FB_ID/APP_URL),
   - crea su app `plan-{id}.html` desde la plantilla más actualizada,
   - crea su `manifest-{id}.json`,
   - sube todo junto a `main`.

   Puedes verlo correr en la pestaña **Actions** del repo ("Alta de atleta
   nuevo"). Si el archivo se movió a `procesados/`, salió bien.

5. Categoría, estatura y WhatsApp quedan vacíos por defecto — complétalos
   cuando quieras directamente en el panel, igual que con cualquier otro dato
   del atleta. No son necesarios para que la app del atleta funcione.

## Si algo sale mal

Si la Action falla (revisa la pestaña "Actions" → el ícono rojo ✕), el
archivo se queda en esta carpeta sin tocar — no se pierde nada, solo
corrígelo y vuelve a intentarlo, o dile a Claude que revise el log de esa
corrida.

## ¿Prefieres el camino de siempre?

`crear_atleta.py` sigue funcionando igual que antes para quien prefiera
hacerlo desde su computador a mano.
