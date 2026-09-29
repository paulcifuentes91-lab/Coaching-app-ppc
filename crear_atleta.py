#!/usr/bin/env python3
"""
crear_atleta.py — Da de alta un atleta nuevo en Pro Performance Coach (uso manual).

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

Nota: si prefieres no usar tu computador para esto, existe una alternativa
automática — ver "nuevos-atletas-pendientes/README.md".
"""
import json, sys

from atleta_lib import dar_de_alta, ErrorAltaAtleta


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 crear_atleta.py ruta/al/plan-exportado.json")
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

    try:
        info = dar_de_alta(nombre, categoria, estatura, whatsapp, exportado)
    except ErrorAltaAtleta as e:
        print("ERROR:", e)
        sys.exit(1)

    print("")
    print("LISTO —", nombre, "agregado como id de panel:", info["aid"])
    print("  Firestore / FB_ID:", info["fb_id_valor"])
    print("  App creada:", info["destino_app"])
    print("  Manifest creado:", info["manifest_nombre"])
    print("")
    print("Sube todo con:")
    print("  git add panel-coach-ppc.html " + info["destino_app"] + " " + info["manifest_nombre"])
    print('  git commit -m "Agregar atleta: ' + nombre + '"')
    print("  git push")


if __name__ == "__main__":
    main()
