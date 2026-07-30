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
    return re.sub(r"[^a-zA-Z0-9]+", "-", quitar_tildes(s).lower()).strip("-")


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


def encontrar_cierre(texto, idx_apertura, abre, cierra):
    """Busca el indice del caracter de cierre que hace match con el de apertura
    en idx_apertura, contando profundidad y sin dejarse enganar por [ ] { } que
    esten dentro de strings (texto entre comillas)."""
    profundidad = 0
    i = idx_apertura
    en_string = False
    escape = False
    n = len(texto)
    while i < n:
        c = texto[i]
        if en_string:
            if escape:
                escape = False
            elif c == "\\":
                escape = True
            elif c == '"':
                en_string = False
        else:
            if c == '"':
                en_string = True
            elif c == abre:
                profundidad += 1
            elif c == cierra:
                profundidad -= 1
                if profundidad == 0:
                    return i
        i += 1
    return -1


def reemplazar_estructura(panel, marcador_const, abre, cierra):
    """Encuentra 'const NOMBRE=' o 'const NOMBRE = ', localiza el bloque
    balanceado que sigue, y devuelve (objeto_python, idx_inicio, idx_fin_incl)."""
    idx_const = panel.index(marcador_const)
    idx_apertura = panel.index(abre, idx_const)
    idx_cierre = encontrar_cierre(panel, idx_apertura, abre, cierra)
    if idx_cierre == -1:
        raise ValueError("no encontre el cierre balanceado de " + marcador_const)
    bloque = panel[idx_apertura:idx_cierre + 1]
    obj = json.loads(bloque)
    return obj, idx_apertura, idx_cierre


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

    try:
        atletas, a_ini, a_fin = reemplazar_estructura(panel, "const ATLETAS=", "[", "]")
    except (ValueError, json.JSONDecodeError) as e:
        print("ERROR leyendo ATLETAS (" + str(e) + "). No se modificó nada.")
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
    panel = panel[:a_ini] + json.dumps(atletas, ensure_ascii=False, separators=(",", ":")) + panel[a_fin + 1:]

    try:
        fbid_obj, f_ini, f_fin = reemplazar_estructura(panel, "const FB_ID", "{", "}")
    except (ValueError, json.JSONDecodeError) as e:
        print("ERROR leyendo FB_ID (" + str(e) + "). ATLETAS ya se modificó, revisa a mano.")
        sys.exit(1)
    fbid_obj[aid] = fb_id_valor
    panel = panel[:f_ini] + json.dumps(fbid_obj, ensure_ascii=False, separators=(",", ":")) + panel[f_fin + 1:]

    try:
        appurl_obj, u_ini, u_fin = reemplazar_estructura(panel, "const APP_URL", "{", "}")
    except (ValueError, json.JSONDecodeError) as e:
        print("ERROR leyendo APP_URL (" + str(e) + "). ATLETAS/FB_ID ya se modificaron, revisa a mano.")
        sys.exit(1)
    appurl_obj[aid] = "plan-" + aid
    panel = panel[:u_ini] + json.dumps(appurl_obj, ensure_ascii=False, separators=(",", ":")) + panel[u_fin + 1:]

    with open(PANEL, "w", encoding="utf-8") as f:
        f.write(panel)

    destino_app = "plan-" + aid + ".html"
    shutil.copyfile(TEMPLATE, destino_app)
    with open(destino_app, encoding="utf-8") as f:
        app_html = f.read()
    reemplazado = False
    for ph in ["'CAMBIAR-ESTE-ID'", '"CAMBIAR-ESTE-ID"']:
        if ph in app_html:
            app_html = app_html.replace(ph, "'" + fb_id_valor + "'", 1)
            reemplazado = True
            break
    with open(destino_app, "w", encoding="utf-8") as f:
        f.write(app_html)

    print("")
    print("LISTO —", nombre, "agregado como id de panel:", aid)
    print("  Firestore / FB_ID:", fb_id_valor)
    print("  App creada:", destino_app, "(ATHLETE_ID corregido)" if reemplazado else "(revisa el ATHLETE_ID a mano)")
    print("")
    print("Sube todo con:")
    print("  git add panel-coach-ppc.html " + destino_app)
    print('  git commit -m "Agregar atleta: ' + nombre + '"')
    print("  git push")


if __name__ == "__main__":
    main()
