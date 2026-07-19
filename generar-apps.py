#!/usr/bin/env python3
import os

ATHLETES = [
    ("sandy-gaete", "Sandy Gaete", "Wellness", "2000", "160", "200", "65", 
"yes"),
    ("nicole-jerez", "Nicole Jerez", "Bikini NZ", "1950", "155", "195", 
"65", "yes"),
    ("paul-cifuentes", "Paul Cifuentes", "Coach", "2000", "170", "180", 
"60", "no"),
    ("diego-valdebenito", "Diego Valdebenito", "Classic Ph.", "2900", 
"175", "320", "80", "no"),
    ("sebastian-guinart", "Sebastián Guinart", "Classic Ph.", "2500", 
"165", "280", "75", "no"),
    ("maria-jose-amezaga", "María José Amezaga", "Grupos", "2100", "145", 
"240", "70", "yes"),
    ("nelson-diaz", "Nelson Díaz", "General", "2300", "150", "260", "75", 
"no"),
    ("andrea-gonzalez", "Andrea González", "General", "2000", "140", 
"220", "65", "yes"),
    ("elizabeth-ellmen", "Elizabeth Ellmen", "Fuerza", "2400", "160", 
"280", "75", "yes"),
    ("ivan-de-la-cerda", "Iván De La Cerda", "Brazos", "3000", "180", 
"340", "85", "no"),
    ("rosa-perez", "Rosa Pérez", "Longevidad", "1850", "98", "240", "54", 
"no"),
]

HTML = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plan - {name}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: Poppins, sans-serif; background: #1a1a1a; 
color: #fff; padding: 20px; }}
        .container {{ max-width: 1000px; margin: 0 auto; }}
        header {{ text-align: center; margin-bottom: 40px; padding: 30px; 
border-bottom: 2px solid #d4af37; }}
        .logo {{ width: 80px; height: 80px; background: 
linear-gradient(135deg, #d4af37 0%, #ffc107 100%); border-radius: 10px; 
display: flex; align-items: center; justify-content: center; font-size: 
40px; margin: 0 auto 20px; }}
        h1 {{ font-size: 2.5rem; color: #d4af37; margin-bottom: 10px; }}
        .category {{ color: #aaa; margin-bottom: 10px; }}
        .tabs {{ display: flex; gap: 10px; margin-bottom: 30px; 
border-bottom: 2px solid #d4af37; }}
        .tab-button {{ padding: 15px 20px; background: rgba(212, 175, 55, 
0.1); border: none; color: #d4af37; cursor: pointer; font-weight: 600; }}
        .tab-button.active {{ border-bottom: 3px solid #d4af37; }}
        .tab-content {{ display: none; }}
        .tab-content.active {{ display: block; }}
        .card {{ background: rgba(255, 255, 255, 0.05); border: 1px solid 
#d4af37; border-radius: 10px; padding: 20px; margin-bottom: 20px; }}
        .card-title {{ font-size: 1.3rem; color: #d4af37; margin-bottom: 
15px; border-bottom: 1px solid #d4af37; padding-bottom: 10px; }}
        .stats-grid {{ display: grid; grid-template-columns: repeat(4, 
1fr); gap: 15px; }}
        .stat-card {{ background: rgba(212, 175, 55, 0.1); border: 1px 
solid #d4af37; padding: 15px; border-radius: 10px; text-align: center; }}
        .stat-number {{ font-size: 1.8rem; color: #d4af37; font-weight: 
700; }}
        .stat-label {{ font-size: 0.85rem; color: #aaa; margin-top: 5px; 
}}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">⚡</div>
            <h1>{name}</h1>
            <p class="category">{category}</p>
            <p style="font-size: 0.85rem; color: #d4af37; font-weight: 
600;">PRO PERFORMANCE COACH v4.2</p>
        </header>

        <div class="tabs">
            <button class="tab-button active" 
onclick="switchTab('plan')">📊 Plan</button>
            <button class="tab-button" onclick="switchTab('ciclo')">🔴 
Ciclo</button>
            <button class="tab-button" onclick="switchTab('monitoreo')">📈 
Monitoreo</button>
            <button class="tab-button" onclick="switchTab('historial')">📚 
Historial</button>
        </div>

        <div id="plan" class="tab-content active">
            <div class="card">
                <div class="card-title">📊 Nutrición</div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">{calories}</div>
                        <div class="stat-label">Calorías</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{protein}</div>
                        <div class="stat-label">Proteína (g)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{carbs}</div>
                        <div class="stat-label">Carbos (g)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{fats}</div>
                        <div class="stat-label">Grasas (g)</div>
                    </div>
                </div>
            </div>
        </div>

        <div id="ciclo" class="tab-content">
            <div class="card">
                <div class="card-title">🔴 Ciclo Menstrual</div>
                <p style="color: #aaa;">{menstrual}</p>
            </div>
        </div>

        <div id="monitoreo" class="tab-content">
            <div class="card">
                <div class="card-title">📈 Monitoreo</div>
                <p style="color: #aaa;">Tracking de peso, energía y 
sueño</p>
            </div>
        </div>

        <div id="historial" class="tab-content">
            <div class="card">
                <div class="card-title">📚 Historial</div>
                <p style="color: #aaa;">Plan creado: 19/07/2026</p>
            </div>
        </div>
    </div>

    <script>
        function switchTab(name) {{
            document.querySelectorAll('.tab-content').forEach(e => 
e.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(e => 
e.classList.remove('active'));
            document.getElementById(name).classList.add('active');
            event.target.classList.add('active');
        }}
    </script>
</body>
</html>"""

for aid, name, cat, cal, prot, carb, fat, mens in ATHLETES:
    menstrual = "Ciclo habilitado" if mens == "yes" else "No aplica"
    html = HTML.format(name=name, category=cat, calories=cal, 
protein=prot, carbs=carb, fats=fat, menstrual=menstrual)
    with open(f"plan-{aid}.html", "w") as f:
        f.write(html)
    print(f"✅ plan-{aid}.html")

print("\n✅ 11 apps creadas!")
