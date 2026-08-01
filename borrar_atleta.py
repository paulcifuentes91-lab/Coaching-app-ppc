#!/usr/bin/env python3
"""
borrar_atleta.py — Quita un atleta del panel de Pro Performance Coach.

USO (desde la carpeta del repo, ~/Coaching-app-ppc):
    python3 borrar_atleta.py id-del-atleta

El "id-del-atleta" es el id interno del panel (ej. "nicole", "sebastian"),
NO su nombre completo. Si no sabes cuál es, corre el script sin argumentos
y te muestra la lista completa.

Qué hace:
  1. Te muestra los datos del atleta y pide confirmación explícita
  2. Lo quita de ATLETAS, FB_ID y APP_URL en panel-coach-ppc.html
  3. Renombra su archivo plan-{id}.html a plan-{id}-ARCHIVADO.html
     (no lo borra de verdad - así puedes recuperarlo si te equivocas)
  4. NO toca nada en Firestore - sus datos siguen ahí por si los necesitas
  5. Te muestra los comandos git al final — tú decides cuándo subirlo
"""
import json, re, sys, os

PANEL = "panel-coach-ppc.html"


def encontrar_cierre(texto, idx_apertura, abre, cierra):
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


def leer_estructura(panel, marcador_const, abre, cierra):
    idx_const = panel.index(marcador_const)
    idx_apertura = panel.index(abre, idx_const)
    idx_cierre = encontrar_cierre(panel, idx_apertura, abre, cierra)
    if idx_cierre == -1:
        raise ValueError("no encontre el cierre balanceado de " + marcador_const)
    bloque = panel[idx_apertura:idx_cierre + 1]
    obj = json.loads(bloque)
    return obj, idx_apertura, idx_cierre


def main():
    if not os.path.exists(PANEL):
        print("ERROR: no encuentro " + PANEL + " en esta carpeta.")
        print("Asegúrate de correr esto dentro de ~/Coaching-app-ppc")
        sys.exit(1)

    with open(PANEL, encoding="utf-8") as f:
        panel = f.read()

    atletas, a_ini, a_fin = leer_estructura(panel, "const ATLETAS=", "[", "]")

    if len(sys.argv) < 2:
        print("Uso: python3 borrar_atleta.py id-del-atleta")
        print("")
        print("Atletas disponibles:")
        for a in atletas:
            print("  " + a.get("id", "?") + "  —  " + a.get("n", "?"))
        sys.exit(0)

    aid = sys.argv[1].strip()
    objetivo = next((a for a in atletas if a.get("id") == aid), None)
    if not objetivo:
        print("No encontré ningún atleta con id '" + aid + "'.")
        print("Corre el script sin argumentos para ver la lista de ids válidos.")
        sys.exit(1)

    print("=== Vas a quitar este atleta ===")
    print("Nombre:", objetivo.get("n"))
    print("Categoría:", objetivo.get("cat"))
    print("WhatsApp:", objetivo.get("wa"))
    print("")
    confirmar = input("Escribe 'SI' en mayúsculas para confirmar: ").strip()
    if confirmar != "SI":
        print("Cancelado. No se tocó nada.")
        sys.exit(0)

    atletas_nuevos = [a for a in atletas if a.get("id") != aid]
    panel = panel[:a_ini] + json.dumps(atletas_nuevos, ensure_ascii=False, separators=(",", ":")) + panel[a_fin + 1:]

    fbid_obj, f_ini, f_fin = leer_estructura(panel, "const FB_ID", "{", "}")
    fbid_obj.pop(aid, None)
    panel = panel[:f_ini] + json.dumps(fbid_obj, ensure_ascii=False, separators=(",", ":")) + panel[f_fin + 1:]

    appurl_obj, u_ini, u_fin = leer_estructura(panel, "const APP_URL", "{", "}")
    archivo_app = appurl_obj.pop(aid, None)
    panel = panel[:u_ini] + json.dumps(appurl_obj, ensure_ascii=False, separators=(",", ":")) + panel[u_fin + 1:]

    with open(PANEL, "w", encoding="utf-8") as f:
        f.write(panel)

    archivado_msg = ""
    if archivo_app:
        origen = archivo_app + ".html"
        destino = archivo_app + "-ARCHIVADO.html"
        if os.path.exists(origen):
            os.rename(origen, destino)
            archivado_msg = "Archivo renombrado: " + origen + " -> " + destino
        else:
            archivado_msg = "(no encontré " + origen + " para archivar, revísalo a mano)"

    print("")
    print("LISTO —", objetivo.get("n"), "quitado del panel.")
    print(" ", archivado_msg)
    print("  Sus datos en Firebase NO se tocaron (siguen ahí por si los necesitas).")
    print("")
    print("Sube todo con:")
    print("  git add -A")
    print('  git commit -m "Quitar atleta: ' + objetivo.get("n", aid) + '"')
    print("  git push")


if __name__ == "__main__":
    main()
