#!/usr/bin/env python3
"""
crear_atleta.py — Da de alta un atleta nuevo en Pro Performance Coach.

USO (desde la carpeta del repo, ~/Coaching-app-ppc):
    python3 crear_atleta.py ~/Downloads/plan-nombre-del-atleta.json

Qué hace:
  1. Te pregunta nombre, categoría, estatura y WhatsApp
  2. Genera su id de panel (slug) y su id de Firestore
  3. Convierte el entrenamiento exportado al formato interno del panel
  4. Agrega el atleta al array ATLETAS, y sus entradas en FB_ID y APP_URL
  5. Copia plan-template-vacío.html -> plan-{id}.html y corrige su ATHLETE_ID
  6. Te muestra los comandos git al final — TÚ decides cuándo subirlo, el script
     nunca hace git add/commit/push por su cuenta.

Requiere: haber exportado el plan del atleta desde el panel (pestaña
Entrenamiento -> "Exportar plan") ANTES de correr este script.
"""
import json, re, sys, os, unicodedata, datetime, shutil

PANEL = "panel-coach-ppc.html"
TEMPLATE = "plan-template-vacío.html"
MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto",
         "septiembre","octubre","noviembre","diciembre"]


def quitar_tildes(s):
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def slug_palabra(s):
    return re.sub(r"[^a-z]", "", quitar_tildes(s).lower())


def slug_completo(s):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", quitar_tildes(s).lower()).strip("-")
    return s


def generar_id_panel(nombre, existentes):
    partes = nombre.strip().split()
    base = slug_palabra(partes[0]) or "atleta"
    if base in existentes and len(partes) > 1:
        base = base + "-" + slug_palabra(partes[1])
    aid = base
    n = 2
    while aid in existentes:
        aid = base + str(n)
        n += 1
    return aid


def convertir_dias(days_exportado):
    dias = []
    for d in days_exportado:
        secs = []
        for s in d.get("sections", []):
            ej = [[it.get("name", ""), it.get("reps", ""), it.get("tier", ""), it.get("tip", "")]
                  for it in s.get("items", [])]
            secs.append({"n": s.get("name", ""), "ej": ej})
        nombre_dia = (d.get("dayTag", "") + " · " + d.get("name", "")).strip(" ·")
        dias.append({"n": nombre_dia, "secs": secs})
    return dias


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 crear_atleta.py ruta/al/plan-exportado.json")
        sys.exit(1)
    if not os.path.exists(PANEL):
        print("ERROR: no encuentro " + PANEL + " en esta carpeta.")
        print("Asegúrate de correr esto dentro de ~/Coaching-app-ppc")
        sys.exit(1)
    if not os.path.exists(TEMPLATE):
        print("ERROR: no encuentro " + TEMPLATE + " en esta carpeta.")
        sys.exit(1)

    with open(sys.argv[1], encoding="utf-8") as f:
        exportado = json.load(f)

    print("=== Datos del atleta ===")
    nombre = input("Nombre completo: ").strip()
    if not nombre:
        print("Necesito al menos el nombre. Cancelado.")
        sys.exit(1)
    categoria = input("Categoría (ej. Fitness, Classic Physique): ").strip() or "Sin categoría"
    estatura = input("Estatura (ej. 1,75 m), deja vacío si no la tienes: ").strip()
    whatsapp = input("WhatsApp (+56...), deja vacío si no lo tienes: ").strip()

    with open(PANEL, encoding="utf-8") as f:
        panel = f.read()

    # ── 1. Cargar ATLETAS como JSON real y agregar el nuevo ──
    start_marker = "const ATLETAS="
    start_idx = panel.index(start_marker) + len(start_marker)
    fbid_marker_idx = panel.index("const FB_ID")
    region = panel[start_idx:fbid_marker_idx]
    cierre = region.rfind("];")
    if cierre == -1:
        print("ERROR: no pude leer el array ATLETAS de forma segura. No se modificó nada. Pide ayuda.")
        sys.exit(1)
    array_literal = region[:cierre + 1]
    try:
        atletas = json.loads(array_literal)
    except json.JSONDecodeError as e:
        print("ERROR: ATLETAS no se pudo leer como JSON válido (" + str(e) + "). No se modificó nada.")
        sys.exit(1)

    existentes = {a.get("id", "") for a in atletas}
    aid = generar_id_panel(nombre, existentes)
    fb_id_valor = slug_completo(nombre) + "-" + MESES[datetime.date.today().month - 1] + "-" + str(datetime.date.today().year)

    nuevo = {
        "id": aid,
        "ini": "".join(p[0] for p in nombre.split()[:2]).upper(),
        "n": nombre, "cat": categoria, "fed": "Sin federación",
        "tz": exportado.get("tz", "America/Santiago"),
        "est": estatura, "wa": whatsapp,
        "ini_f": exportado.get("startDate", ""), "sem": 4,
        "chk": exportado.get("checkDate", ""), "vence": exportado.get("accessExpiresAt", ""),
        "estado": "activo", "e": "ok", "nota": "",
        "dias": convertir_dias(exportado.get("days", [])),
        "nut": {"agua": "", "sal": "", "libre": "", "vig": "", "bloques": []},
        "sup": [], "hist": []
    }
    atletas.append(nuevo)
    nueva_array_literal = json.dumps(atletas, ensure_ascii=False)
    panel = panel[:start_idx] + nueva_array_literal + ";\n\n" + panel[fbid_marker_idx:]

    # ── 2. FB_ID ──
    start_idx2 = panel.index("const FB_ID") + len("const FB_ID")
    start_idx2 = panel.index("{", start_idx2)
    appurl_idx = panel.index("const APP_URL")
    region2 = panel[start_idx2:appurl_idx]
    cierre2 = region2.rfind("};")
    fbid_obj = json.loads(region2[:cierre2 + 1])
    fbid_obj[aid] = fb_id_valor
    panel = panel[:start_idx2] + json.dumps(fbid_obj, ensure_ascii=False) + ";\n\n" + panel[appurl_idx:]

    # ── 3. APP_URL ──
    start_idx3 = panel.index("const APP_URL") + len("const APP_URL=")
    resto = panel[start_idx3:]
    cierre3 = resto.index("};")
    appurl_obj = json.loads(resto[:cierre3 + 1])
    appurl_obj[aid] = "plan-" + aid
    panel = panel[:start_idx3] + json.dumps(appurl_obj, ensure_ascii=False) + ";" + resto[cierre3 + 2:]

    with open(PANEL, "w", encoding="utf-8") as f:
        f.write(panel)

    # ── 4. Copiar plantilla y corregir ATHLETE_ID ──
    destino_app = "plan-" + aid + ".html"
    shutil.copyfile(TEMPLATE, destino_app)
    with open(destino_app, encoding="utf-8") as f:
        app_html = f.read()
    placeholder_variantes = ["'CAMBIAR-ESTE-ID'", '"CAMBIAR-ESTE-ID"']
    reemplazado = False
    for ph in placeholder_variantes:
        if ph in app_html:
            app_html = app_html.replace(ph, "'" + fb_id_valor + "'", 1)
            reemplazado = True
            break
    with open(destino_app, "w", encoding="utf-8") as f:
        f.write(app_html)

    print("")
    print("LISTO —", nombre, "agregado como id de panel:", aid)
    print("  Firestore / FB_ID:", fb_id_valor)
    print("  App creada:", destino_app, "(ATHLETE_ID corregido)" if reemplazado else "(⚠ no encontré el placeholder ATHLETE_ID, revísalo a mano)")
    print("")
    print("Sube todo con:")
    print("  git add panel-coach-ppc.html " + destino_app)
    print('  git commit -m "Agregar atleta: ' + nombre + '"')
    print("  git push")


if __name__ == "__main__":
    main()
