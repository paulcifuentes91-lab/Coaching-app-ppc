#!/usr/bin/env python3
"""
crear_atleta_ci.py — versión automática (sin preguntas) de crear_atleta.py,
usada por la GitHub Action "Alta de atleta nuevo" (.github/workflows/nuevo-atleta.yml).

Escanea nuevos-atletas-pendientes/*.json. Por cada archivo encontrado:
  - El nombre del atleta es el nombre del archivo, sin el ".json"
    (ej. "Camila Rojas.json" -> nombre = "Camila Rojas").
  - categoria / estatura / whatsapp son opcionales: si el JSON exportado trae
    las claves "_categoria" / "_estatura" / "_whatsapp" (agregarlas a mano no
    es obligatorio), se usan; si no, quedan vacías y el coach las completa
    después a mano en el panel — no bloquean el alta.
  - Da de alta al atleta con atleta_lib.dar_de_alta (misma lógica que el
    script manual).
  - Si todo sale bien, MUEVE el archivo procesado a
    nuevos-atletas-pendientes/procesados/ (no lo borra, por si hay que
    revisarlo despues).
  - Si algo sale mal con un archivo, lo deja donde estaba y sigue con los
    demás - no aborta todo el lote por un archivo con problemas.

No hace git add/commit/push - eso lo hace el workflow después de correr esto.
"""
import json, os, sys, shutil

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from atleta_lib import dar_de_alta, ErrorAltaAtleta

PENDIENTES = "nuevos-atletas-pendientes"
PROCESADOS = os.path.join(PENDIENTES, "procesados")


def main():
    if not os.path.isdir(PENDIENTES):
        print("No existe la carpeta " + PENDIENTES + ", nada que hacer.")
        return

    pendientes = sorted(
        f for f in os.listdir(PENDIENTES)
        if f.lower().endswith(".json") and os.path.isfile(os.path.join(PENDIENTES, f))
    )
    if not pendientes:
        print("No hay archivos pendientes en " + PENDIENTES + ".")
        return

    os.makedirs(PROCESADOS, exist_ok=True)
    hubo_error = False

    for archivo in pendientes:
        ruta = os.path.join(PENDIENTES, archivo)
        nombre = archivo[:-5].strip()  # sin ".json"
        print("--- Procesando: " + archivo + " (nombre: " + nombre + ") ---")

        try:
            with open(ruta, encoding="utf-8") as f:
                exportado = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            print("  ERROR: no pude leer/parsear el JSON (" + str(e) + "). Lo dejo pendiente.")
            hubo_error = True
            continue

        categoria = exportado.get("_categoria", "")
        estatura = exportado.get("_estatura", "")
        whatsapp = exportado.get("_whatsapp", "")

        try:
            info = dar_de_alta(nombre, categoria, estatura, whatsapp, exportado)
        except ErrorAltaAtleta as e:
            print("  ERROR dando de alta: " + str(e) + ". Lo dejo pendiente para revisar a mano.")
            hubo_error = True
            continue

        print("  LISTO. id de panel: " + info["aid"] + " / Firestore: " + info["fb_id_valor"])
        print("  Creados: " + info["destino_app"] + ", " + info["manifest_nombre"])

        shutil.move(ruta, os.path.join(PROCESADOS, archivo))

    if hubo_error:
        print("")
        print("Uno o más archivos quedaron pendientes por error - revisa los logs arriba.")
        sys.exit(1)


if __name__ == "__main__":
    main()
