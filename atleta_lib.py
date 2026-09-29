"""
atleta_lib.py — lógica compartida para dar de alta un atleta nuevo.

Usada por:
  - crear_atleta.py         (uso manual desde tu computador, interactivo)
  - scripts/crear_atleta_ci.py  (usado por la GitHub Action "Alta de atleta nuevo")

Mantener esta lógica en un solo lugar evita que las dos formas de crear un
atleta (manual vs automática) se vayan desalineando con el tiempo — el mismo
problema que ya pasó con plan-template-vacío.html quedando desactualizado
respecto a los atletas activos (sep-2026).
"""
import json, re, os, unicodedata, datetime, shutil

PANEL = "panel-coach-ppc.html"
TEMPLATE = "plan-template-vacío.html"
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
         "septiembre", "octubre", "noviembre", "diciembre"]


class ErrorAltaAtleta(Exception):
    pass


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


def dar_de_alta(nombre, categoria, estatura, whatsapp, exportado):
    """Hace todo el trabajo de alta de un atleta nuevo: edita panel-coach-ppc.html
    (ATLETAS/FB_ID/APP_URL), crea plan-{id}.html desde la plantilla, y crea su
    manifest-{id}.json. No hace git add/commit/push — eso lo decide quien la llama
    (el propio coach a mano, o la Action).

    Lanza ErrorAltaAtleta con un mensaje explicativo si algo falla, sin dejar el
    panel a medio escribir (solo escribe panel-coach-ppc.html si las tres
    estructuras se editaron bien en memoria).

    Devuelve un dict con {aid, fb_id_valor, destino_app, manifest_nombre} para logging.
    """
    if not os.path.exists(PANEL):
        raise ErrorAltaAtleta("no encuentro " + PANEL + " en esta carpeta.")
    if not os.path.exists(TEMPLATE):
        raise ErrorAltaAtleta("no encuentro " + TEMPLATE + " en esta carpeta.")
    if not nombre.strip():
        raise ErrorAltaAtleta("el nombre no puede estar vacío.")

    with open(PANEL, encoding="utf-8") as f:
        panel = f.read()

    try:
        atletas, a_ini, a_fin = reemplazar_estructura(panel, "const ATLETAS=", "[", "]")
    except (ValueError, json.JSONDecodeError) as e:
        raise ErrorAltaAtleta("leyendo ATLETAS (" + str(e) + "). No se modificó nada.")

    existentes = {a.get("id", "") for a in atletas}
    aid = generar_id_panel(nombre, existentes)
    fb_id_valor = (slug_completo(nombre) + "-" + MESES[datetime.date.today().month - 1]
                   + "-" + str(datetime.date.today().year))

    nuevo = {
        "id": aid,
        "ini": "".join(p[0] for p in nombre.split()[:2]).upper(),
        "n": nombre, "cat": categoria or "Sin categoría", "fed": "Sin federación",
        "tz": exportado.get("tz", "America/Santiago"),
        "est": estatura or "", "wa": whatsapp or "",
        "ini_f": exportado.get("startDate", ""), "sem": 4,
        "chk": exportado.get("checkDate", ""), "vence": exportado.get("accessExpiresAt", ""),
        "estado": "activo", "e": "ok", "nota": "",
        "dias": convertir_dias(exportado.get("days", [])),
        "nut": {"agua": "", "sal": "", "libre": "", "vig": "", "bloques": []},
        "sup": [], "hist": []
    }
    atletas.append(nuevo)
    panel_nuevo = panel[:a_ini] + json.dumps(atletas, ensure_ascii=False, separators=(",", ":")) + panel[a_fin + 1:]

    try:
        fbid_obj, f_ini, f_fin = reemplazar_estructura(panel_nuevo, "const FB_ID", "{", "}")
    except (ValueError, json.JSONDecodeError) as e:
        raise ErrorAltaAtleta("leyendo FB_ID (" + str(e) + "). No se modificó nada.")
    fbid_obj[aid] = fb_id_valor
    panel_nuevo = panel_nuevo[:f_ini] + json.dumps(fbid_obj, ensure_ascii=False, separators=(",", ":")) + panel_nuevo[f_fin + 1:]

    try:
        appurl_obj, u_ini, u_fin = reemplazar_estructura(panel_nuevo, "const APP_URL", "{", "}")
    except (ValueError, json.JSONDecodeError) as e:
        raise ErrorAltaAtleta("leyendo APP_URL (" + str(e) + "). No se modificó nada.")
    appurl_obj[aid] = "plan-" + aid
    panel_nuevo = panel_nuevo[:u_ini] + json.dumps(appurl_obj, ensure_ascii=False, separators=(",", ":")) + panel_nuevo[u_fin + 1:]

    # Solo tocamos el archivo real una vez que las tres estructuras se
    # editaron bien en memoria, para no dejarlo a medio escribir.
    with open(PANEL, "w", encoding="utf-8") as f:
        f.write(panel_nuevo)

    destino_app = "plan-" + aid + ".html"
    shutil.copyfile(TEMPLATE, destino_app)
    with open(destino_app, encoding="utf-8") as f:
        app_html = f.read()
    for ph in ["'CAMBIAR-ESTE-ID'", '"CAMBIAR-ESTE-ID"']:
        if ph in app_html:
            app_html = app_html.replace(ph, "'" + fb_id_valor + "'", 1)
            break
    app_html = app_html.replace(
        "<title>Mesociclo — Nuevo Atleta</title>", "<title>Mesociclo — " + nombre + "</title>", 1)
    app_html = app_html.replace(
        '<h1 id="headerName">Nuevo Atleta</h1>', '<h1 id="headerName">' + nombre + '</h1>', 1)
    app_html = app_html.replace(
        "nombre: 'Nuevo Atleta',", "nombre: '" + nombre + "',", 1)

    manifest_nombre = "manifest-" + aid + ".json"
    marcador_manifest = 'href="./manifest-CAMBIAR-ESTE-ID.json"'
    if marcador_manifest in app_html:
        app_html = app_html.replace(marcador_manifest, 'href="./' + manifest_nombre + '"', 1)

    with open(destino_app, "w", encoding="utf-8") as f:
        f.write(app_html)

    # PWA_THEME_DEFAULT: color de acento por defecto para el manifest del
    # atleta nuevo (dorado de marca). No hay una regla real de que color le
    # toca a cada atleta - es solo un punto de partida, el coach lo puede
    # cambiar despues editando manifest-{id}.json directamente.
    PWA_THEME_DEFAULT = "#E8C15C"
    manifest_contenido = {
        "name": nombre + " · Pro Performance Coach",
        "short_name": nombre.split()[0] + " PPC",
        "description": "Plan de entrenamiento y nutrición de " + nombre + " — Pro Performance Coach",
        "start_url": "./" + destino_app,
        "scope": "./",
        "display": "standalone",
        "orientation": "portrait",
        "background_color": "#14171B",
        "theme_color": PWA_THEME_DEFAULT,
        "lang": "es-CL",
        "icons": [
            {"src": "./icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "./icons/icon-512.png", "sizes": "512x512", "type": "image/png"}
        ]
    }
    with open(manifest_nombre, "w", encoding="utf-8") as f:
        json.dump(manifest_contenido, f, ensure_ascii=False, indent=2)
        f.write("\n")

    return {
        "aid": aid,
        "fb_id_valor": fb_id_valor,
        "destino_app": destino_app,
        "manifest_nombre": manifest_nombre,
    }
