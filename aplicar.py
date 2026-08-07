import os
with open("plan-maria-jose-amezaga.html", "r") as f:
    template = f.read()

atletas = [("plan-rosa-perez.html", "Rosa Pérez", 20), ("plan-magdalena-pinto.html", "Magdalena Pinto", 12), ("plan-elizabeth-ellmen.html", "Elizabeth Ellmen", 0), ("plan-nicole-jerez.html", "Nicole Jerez", 0), ("plan-nelson-diaz.html", "Nelson Díaz", 0), ("plan-francisca-perez.html", "Francisca Perez", 0), ("plan-ivan-de-la-cerda.html", "Iván De La Cerda", 0), ("plan-diego-valdebenito.html", "Diego Valdebenito", 0), ("plan-andrea-gonzalez.html", "Andrea González", 0), ("plan-sandy-gaete.html", "Sandy Gaete", 0), ("plan-sebastian-guinart.html", "Sebastián Guinart", 0)]

for archivo, nombre, sesiones in atletas:
    content = template.replace("María José Amezaga", nombre)
    if sesiones > 0:
        content = content.replace(">16<", f">{sesiones}<")
    with open(archivo, "w") as f:
        f.write(content)
    print(f"✅ {nombre}")
print("Listo!")
