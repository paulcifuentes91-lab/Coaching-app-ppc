# 🔔 ANÁLISIS: Sistema de Alertas Panel Coach
**Fecha:** 17-07-2026  
**Status:** 🔴 CRÍTICO

---

## El Problema

### Síntoma
Cuando modificas **checkDate** en "Editar Plan", las alertas en el Dashboard **no se actualizan** automáticamente.

### Ejemplo
1. Tienes: checkDate = 2026-07-20 (en 3 días) → ALERTA AMARILLA ✓
2. Cambias a: checkDate = 2026-07-22 (en 5 días) → debería DESAPARECER
3. Pero: La alerta sigue visible hasta que haces F5 (refresh) ❌

---

## Causa Raíz

### Flujo Actual (❌ ROTO)

```
PAGE LOAD
  ↓
loadDashboard() — ejecuta 1 sola vez
  ↓
Renderiza alertas correctas
  ↓
Usuario edita checkDate
  ↓
Guardas cambios → .then(() => toast('✓ Guardado'))
  ↓
❌ NO se llama a loadDashboard() nuevamente
  ↓
Alertas siguen mostrando valores ANTIGUOS
  ↓
Usuario hace F5 → loadDashboard() ejecuta de nuevo
  ↓
Alertas finalmente se actualizan ✓
```

### Código Problemático

**Línea 730 (guardar plan):**
```javascript
db.collection('athletes').doc(currentAthleteId).set(update, {merge:true})
  .then(()=> toast('✓ Guardado — el atleta verá los cambios al recargar su app'))
  .catch(err=> toast('Error: '+err.message, true));
  // ❌ NO hay aquí: loadDashboard()
```

---

## Dónde Se Generan las Alertas

### Función: `loadDashboard()` (línea 1021)

Se generan alertas por:

1. **ALERTA_001: Sin documento Firebase**
   ```javascript
   if(!d){ alerts.push({...}); }
   ```

2. **ALERTA_002: Sin actividad hace N días**
   ```javascript
   if(d.updatedAt && d.updatedAt.toDate){
     const dias = daysBetween(d.updatedAt.toDate(), new Date());
     if(dias >= 3) alerts.push({...});
   }
   ```

3. **ALERTA_003: Chequeo vencido o próximo** ← 🔴 ESTO NO SE ACTUALIZA
   ```javascript
   const chk = planField(d, 'checkDate');
   if(chk){
     const diff = daysBetween(new Date(), new Date(chk + 'T00:00:00'));
     if(diff < 0) alerts.push({sev:'red', txt:`${a.nombre} — chequeo vencido`});
     else if(diff <= 7) { 
       if(diff<=2) alerts.push({sev:'yellow', txt:`${a.nombre} — chequeo en ${diff} días`});
     }
   }
   ```

4. **ALERTA_004: Pago pendiente**
   ```javascript
   if(crm.pago === 'pendiente') alerts.push({...});
   ```

5. **ALERTA_005: Renovación próxima o vencida**
   ```javascript
   // Mismo patrón que chequeo
   ```

6. **ALERTA_006: Acceso vencido o próximo**
   ```javascript
   // Mismo patrón que chequeo
   ```

7. **ALERTA_007: Adherencia crítica** ← 🔴 ESTO TAMPOCO SE ACTUALIZA
   ```javascript
   const adher = Math.round((done/total)*100||0);
   if(adher < 60) alerts.unshift({sev:'red', txt:`${a.nombre} — adherencia crítica ${adher}%`});
   ```

8. **ALERTA_008: Señales emocionales sostenidas**
   ```javascript
   if(bad('animo')||bad('estres')) alerts.unshift({...});
   ```

---

## Alertas que NO se Actualizan Automáticamente

### 🔴 Críticas (No se Recalculan)

| Alerta | Cuándo | Fix Requerido |
|--------|--------|----------------|
| Chequeo próximo | Cambias checkDate | Recalcular al guardar |
| Chequeo vencido | Cambias checkDate | Recalcular al guardar |
| Acceso próximo | Cambias accessExpiresAt | Recalcular al guardar |
| Acceso vencido | Cambias accessExpiresAt | Recalcular al guardar |
| Renovación próxima | Cambias crm.renovacion | Recalcular al guardar |
| Renovación vencida | Cambias crm.renovacion | Recalcular al guardar |
| Adherencia crítica | Cambias datos de atleta | Recalcular al guardar |
| Señal emocional sostenida | Cambias dailyFeel | Recalcular al guardar |

---

## Solución Requerida

### Fix: Llamar `loadDashboard()` después de guardar

**Opción A: Callback simple**
```javascript
db.collection('athletes').doc(currentAthleteId).set(update, {merge:true})
  .then(()=> {
    toast('✓ Guardado');
    loadDashboard(); // ← Recalcular alertas inmediatamente
  })
  .catch(err=> toast('Error: '+err.message, true));
```

**Opción B: Refresh selectivo** (más elegante)
```javascript
.then(()=> {
  toast('✓ Guardado');
  // Solo actualizar view-dashboard si está activo
  if(document.querySelector('.view.active').id === 'dashboardView'){
    loadDashboard();
  }
})
```

**Opción C: Sistema de eventos** (mejor escalabilidad)
```javascript
// Disparar evento cuando algo cambia
window.dispatchEvent(new CustomEvent('athleteDataChanged', {detail: currentAthleteId}));

// En loadDashboard():
window.addEventListener('athleteDataChanged', ()=> loadDashboard());
```

---

## Alertas que SÍ se Actualizan

### ✅ Funcionan Bien

| Alerta | Por Qué |
|--------|---------|
| Sin documento Firebase | Se comprueba cada vez que cargas el dashboard |
| Sin actividad N días | Se recalcula leyendo `updatedAt` en tiempo real |
| Pago pendiente | Se comprueba en cada carga |

---

## Impacto en Producción

### Escenario Real

```
Tu atleta Sandy tiene chequeo mañana.
  ↓
Panel muestra: ⚠️ "Sandy — chequeo en 1 día"
  ↓
Descubres que el chequeo era hoy (error de fecha).
  ↓
Entras a "Editar Plan" y cambias checkDate de mañana → a hoy.
  ↓
Guardas el cambio ✓
  ↓
Miras el Dashboard esperando ver: ⚠️ "Sandy — chequeo HOY"
  ↓
❌ Pero sigue mostrando: ⚠️ "Sandy — chequeo en 1 día"
  ↓
Esto causa:
- Confusión (¿se guardó o no?)
- Falta de visibilidad (¿debo mandar a Sandy ahora?)
- Trabajo manual (tener que hacer F5)
```

---

## Recomendación

**Aplicar FIX INMEDIATO:**
1. Agregar `loadDashboard()` en `.then()` de guardar plan (línea 730)
2. Agregar `loadDashboard()` en `.then()` de guardar JSON (línea 695)
3. Agregar `loadDashboard()` en `.then()` de guardar CRM/renovación (si existe)

**Verificación Post-Fix:**
1. Cambiar checkDate
2. Ver que la alerta se actualice al guardar
3. No debería necesitar F5

---

**PRIORIDAD: CRÍTICA** 🔴
Este bug afecta la confiabilidad del sistema de alertas.
