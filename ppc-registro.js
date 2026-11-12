/* PPC · Registro de macros (módulo compartido por todas las apps de atleta) · v1 */
/* PPC · Registro de macros estilo diario (búsqueda, porciones, recientes, copiar de ayer) */
(function(){
 var FOODS_DB = {"pechuga de pollo":[165,31,0,3.6,"prot"],"carne roja magra":[250,26,0,15,"prot"],"pescado blanco":[105,23,0,1.5,"prot"],"salmón":[208,20,0,13,"prot"],"atún en agua":[116,26,0,1,"prot"],"pavo":[135,29,0,1.7,"prot"],"lomo de cerdo":[143,26,0,4,"prot"],"camarones":[99,24,0.2,0.3,"prot"],"huevo entero":[143,12.6,0.7,9.5,"prot"],"claras de huevo":[52,11,0.7,0.2,"prot"],"tofu":[144,15,3,9,"prot"],"tempeh":[192,20,7.6,11,"prot"],"seitán":[370,75,14,1.9,"prot"],"lentejas cocidas":[116,9,20,0.4,"prot"],"garbanzos cocidos":[164,9,27,2.6,"prot"],"porotos negros cocidos":[132,8.9,24,0.5,"prot"],"edamame":[122,11,10,5,"prot"],"arroz blanco cocido":[130,2.7,28,0.3,"carbo"],"papa cocida":[87,2,20,0.1,"carbo"],"camote cocido":[86,1.6,20,0.1,"carbo"],"avena":[389,17,66,7,"carbo"],"pasta cocida":[158,6,31,0.9,"carbo"],"pasta integral cocida":[124,5,25,1.1,"carbo"],"pan":[265,9,49,3.2,"carbo"],"pan integral":[247,13,41,4.2,"carbo"],"quinoa cocida":[120,4.4,21,1.9,"carbo"],"legumbres cocidas":[116,8,20,0.5,"carbo"],"zapallo":[34,1,8,0.1,"carbo"],"choclo":[96,3.4,21,1.5,"carbo"],"arroz integral cocido":[112,2.3,24,0.9,"carbo"],"galletas de arroz":[387,8,81,3,"carbo"],"cuscús cocido":[112,3.8,23,0.2,"carbo"],"polenta cocida":[70,1.6,15,0.3,"carbo"],"aceite de oliva":[884,0,0,100,"grasa"],"palta":[160,2,9,15,"grasa"],"frutos secos":[607,20,21,54,"grasa"],"mantequilla de maní":[588,25,20,50,"grasa"],"almendras":[579,21,22,50,"grasa"],"nueces":[654,15,14,65,"grasa"],"chía":[486,17,42,31,"grasa"],"linaza":[534,18,29,42,"grasa"],"maní":[567,26,16,49,"grasa"],"aceite de coco":[862,0,0,99,"grasa"],"aceitunas":[115,0.8,6,11,"grasa"],"yogurt griego":[59,10,3.6,0.4,"lacteos"],"queso":[320,25,2,24,"lacteos"],"kefir":[41,3.3,4.5,1,"lacteos"],"leche descremada":[35,3.4,5,0.2,"lacteos"],"yogurt natural":[61,3.5,4.7,3.3,"lacteos"],"queso cottage":[98,11,3.4,4.3,"lacteos"],"leche de almendras":[17,0.6,0.6,1.5,"lacteos"],"leche de soya":[33,3.3,1.8,1.8,"lacteos"],"plátano":[89,1.1,23,0.3,"frutas"],"frutos rojos":[52,0.7,12,0.3,"frutas"],"manzana":[52,0.3,14,0.2,"frutas"],"naranja":[47,0.9,12,0.1,"frutas"],"kiwi":[61,1.1,15,0.5,"frutas"],"piña":[50,0.5,13,0.1,"frutas"],"pera":[57,0.4,15,0.1,"frutas"],"sandía":[30,0.6,8,0.2,"frutas"],"uvas":[69,0.7,18,0.2,"frutas"],"mango":[60,0.8,15,0.4,"frutas"],"whey":[400,80,8,6,"polvo"],"proteína aislada":[370,90,1,1,"polvo"],"caseína":[360,80,6,2,"polvo"],"proteína vegetal":[380,75,8,6,"polvo"],"proteína":[395,78,8,6,"polvo"],"brócoli":[34,2.8,7,0.4,"verd"],"espinaca":[23,2.9,3.6,0.4,"verd"],"tomate":[18,0.9,3.9,0.2,"verd"],"pepino":[15,0.7,3.6,0.1,"verd"],"zanahoria":[41,0.9,10,0.2,"verd"],"champiñón":[22,3.1,3.3,0.3,"verd"],"pimiento":[31,1,6,0.3,"verd"],"coliflor":[25,1.9,5,0.3,"verd"],"lechuga":[15,1.4,2.9,0.2,"verd"],"acelga":[19,1.8,3.7,0.2,"verd"],"ensalada verde":[22,1.1,3.5,0.25,"verd"],"verduras":[35,2,6,0.4,"verd"],"arroz basmati cocido":[121,3.5,25,0.4,"carbo"],"arroz cocido":[130,2.7,28,0.3,"carbo"],"corn flakes":[357,7,84,0.4,"carbo"],"harina de arroz":[366,6,80,1.4,"carbo"],"arándanos":[57,0.7,14,0.3,"frutas"],"frutillas":[32,0.7,7.7,0.3,"frutas"]}, customFoods = {};
 var foodLog = {}, propios = {}, aguaLog = {}, actLog = {}, viewDate = null, sheetEl = null, ST = null, semOff = 0;
 var AGUA_META = 3000, CARDIO_MIN = 0, CARDIO_MAX = 0;
 var TRAIN = [1,2,4,5,6];
 var COL = {k:'#E0C23D', p:'#5B8DEF', c:'#4FD1A5', f:'#FF7FAE'};
 /* Alimentos extra (por 100 g: kcal, P, C, G) — valores referenciales */
 var EXTRA = {"marraqueta":[275,9,56,1],"hallulla":[300,9,52,6],"pan de molde integral":[250,10,43,4],"tortilla de rollo":[300,8,50,7],"pollo muslo sin piel":[175,26,0,8],"carne molida 5% grasa":[137,21,0,5],"lomo vetado":[230,25,0,14],"jurel en conserva":[158,23,0,7],"atún en aceite":[190,26,0,9],"jamón de pavo":[105,17,3,3],"queso gouda":[356,25,2,28],"queso fresco":[190,13,3,14],"queso mozzarella":[280,22,2,20],"leche entera":[61,3.2,4.8,3.3],"yogurt proteico":[64,10,4,0.5],"miel":[304,0.3,82,0],"mermelada":[250,0.4,62,0],"chocolate amargo 70%":[598,8,46,43],"barra proteica":[350,30,35,10],"azúcar":[387,0,100,0],"bebida cola normal":[42,0,10.6,0],"bebida cola cero":[0,0,0,0],"cerveza":[43,0.5,3.6,0],"vino tinto":[85,0.1,2.6,0],"zapallo italiano":[17,1.2,3.1,0.3],"betarraga":[43,1.6,10,0.2],"cebolla":[40,1.1,9,0.1],"papas fritas":[312,3.4,41,15],"empanada de pino horneada":[250,9,27,12],"pizza":[266,11,33,10],"sushi roll":[150,5,30,1.5],"porotos cocidos":[127,8.7,22.8,0.5],"mayonesa light":[270,1,12,25],"ketchup":[100,1.2,25,0.1],"cacao en polvo":[228,20,58,14],"crema de maní":[588,25,20,50],"granola":[450,10,64,18],"barra de cereal":[390,6,70,9]};
 /* Porciones: gramos por unidad */
 var SERV = {"huevo entero":[["huevo",55]],"claras de huevo":[["clara",33]],"plátano":[["plátano mediano",120]],"manzana":[["manzana",180]],"naranja":[["naranja",150]],"kiwi":[["kiwi",75]],"pera":[["pera",170]],"pan":[["rebanada",28]],"pan integral":[["rebanada",28]],"pan de molde integral":[["rebanada",28]],"marraqueta":[["marraqueta (1 pan)",90],["mitad",45]],"hallulla":[["hallulla",80]],"tortilla de rollo":[["tortilla",60]],"whey":[["scoop",30]],"proteína aislada":[["scoop",30]],"avena":[["1/2 taza",40],["cucharada",10]],"aceite de oliva":[["cucharada",14],["cucharadita",5]],"palta":[["1/2 palta",75],["palta entera",150]],"yogurt griego":[["pote",125]],"yogurt natural":[["pote",125]],"yogurt proteico":[["pote",160]],"arroz blanco cocido":[["taza",160],["porción",150]],"arroz cocido":[["taza",160]],"papa cocida":[["papa mediana",170]],"camote cocido":[["camote mediano",130]],"pechuga de pollo":[["filete",150]],"leche descremada":[["taza",245]],"leche entera":[["taza",245]],"almendras":[["puñado",28]],"nueces":[["puñado",28]],"mantequilla de maní":[["cucharada",16]],"crema de maní":[["cucharada",16]],"miel":[["cucharada",21]],"queso":[["lámina",25]],"queso gouda":[["lámina",20]],"jamón de pavo":[["lámina",15]],"barra proteica":[["barra",60]],"barra de cereal":[["barra",25]],"granola":[["porción",45]],"cerveza":[["lata 350 ml",350]],"vino tinto":[["copa",150]],"bebida cola normal":[["lata 350 ml",350]],"empanada de pino horneada":[["empanada",200]],"pasta cocida":[["taza",140]],"quinoa cocida":[["taza",185]],"lentejas cocidas":[["taza",200]]};
 function esc(t){ return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
 function num(v){ var n = parseFloat(String(v).replace(',','.')); return isFinite(n) && n>=0 ? n : 0; }
 function r0(x){ return Math.round(x); }
 function r1(x){ return Math.round(x*10)/10; }
 function fmt(x){ return String(r1(x)).replace('.',','); }
 function sa(t){ return String(t).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim(); }
 function vd(){ return viewDate || todayStr(); }
 function addDays(s,n){ var d = new Date(s+'T12:00:00'); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
 function ventanaDe(date){
  var wd = new Date(date+'T12:00:00').getDay(), id = TRAIN.indexOf(wd)>=0 ? 'entreno' : 'descanso';
  return mealWindows.find(function(w){ return w.id===id; }) || mealWindows[0];
 }
 function macrosDe(e){
  if(e.t) return {k:e.t[0], p:e.t[1], c:e.t[2], f:e.t[3]};
  var b = e.b || [0,0,0,0], q = (e.g||0)/100;
  return {k:b[0]*q, p:b[1]*q, c:b[2]*q, f:b[3]*q};
 }
 function sumar(arr){ var t = {k:0,p:0,c:0,f:0}; (arr||[]).forEach(function(e){ var m = macrosDe(e); t.k+=m.k; t.p+=m.p; t.c+=m.c; t.f+=m.f; }); return t; }
 function baseDe(nombre){
  var key = String(nombre).toLowerCase();
  if(propios[key]) return propios[key];
  if(EXTRA[key]) return EXTRA[key];
  var cf = customFoods[key]; if(cf) return [+cf.k||0,+cf.p||0,+cf.c||0,+cf.g||0];
  var f = FOODS_DB[key];
  return f ? [f[0],f[1],f[2],f[3]] : null;
 }
 function todosNombres(){
  var out = {}, k;
  for(k in FOODS_DB) out[k]=1;
  for(k in customFoods) out[String(k).toLowerCase()]=1;
  for(k in EXTRA) out[k]=1;
  for(k in propios) out[k]=1;
  return Object.keys(out);
 }
 function porcionesDe(nombre, online){
  var l = (online && online.serv) ? online.serv : (SERV[String(nombre).toLowerCase()] || []);
  return l;
 }
 function guardar(){
  var keys = Object.keys(foodLog).sort().slice(-60), out = {};
  keys.forEach(function(k){ out[k] = foodLog[k]; }); foodLog = out;
  saveField('foodLog', foodLog);
  try{ renderSemana(); }catch(e){}
 }
 function guardarPropios(){ saveField('foodsPropios', propios); }
 function sincronizarCheck(date){
  var mw = ventanaDe(date), arr = foodLog[date] || [], cambio = false;
  mw.meals.forEach(function(_,i){
   var k = date+'-'+mw.id+'-'+i, hay = arr.some(function(e){ return e.m===i; });
   if(!!mealChecks[k] !== hay){ mealChecks[k] = hay; cambio = true; }
  });
  if(cambio){ saveField('mealChecks', mealChecks); try{ updateMesocicloSummary(); }catch(e){} }
 }
 function setDate(d){
  viewDate = d;
  var w = ventanaDe(d); if(w) activeMealWindow = w.id;
  renderMacroCard(); renderMealWindowRow(); renderMealCard(); renderMealHistory();
 }
 /* ── Pestañas de Nutrición ── */
 var TAB = 'diario';
 try{ var gt = localStorage.getItem('ppc_nut_tab'); if(gt) TAB = gt; }catch(e){}
 var TABS = [['diario','🍽 Diario'],['agua','💧 Agua'],['semana','📊 Semana'],['metas','🎯 Metas']];
 function ocultar(el, si){ if(el) el.classList.toggle('rg-oculto', !!si); }
 function aplicarTab(){
  if(!activo) return;
  var nv = document.getElementById('nutritionView'); if(!nv) return;
  if(!document.getElementById('rgStyle')){ var st = document.createElement('style'); st.id = 'rgStyle'; st.textContent = '.rg-oculto{display:none!important}#rgTabs{display:flex;gap:6px;margin:12px 0 0}#rgTabs button{flex:1 1 0;min-width:0;white-space:nowrap;padding:10px 4px;font-size:12.5px}'; document.head.appendChild(st); }
  var bar = document.getElementById('rgTabs');
  if(!bar){ bar = document.createElement('div'); bar.id = 'rgTabs'; nv.insertBefore(bar, nv.firstChild); }
  bar.innerHTML = TABS.map(function(t){ return '<button class="week-btn '+(TAB===t[0]?'active':'')+'" data-rgt="'+t[0]+'">'+t[1]+'</button>'; }).join('');
  Array.prototype.forEach.call(bar.querySelectorAll('[data-rgt]'), function(b){ b.onclick = function(){ TAB = b.dataset.rgt; try{ localStorage.setItem('ppc_nut_tab', TAB); }catch(e){} aplicarTab(); try{ window.scrollTo({top: Math.max(0, bar.getBoundingClientRect().top + window.pageYOffset - 8), behavior:'smooth'}); }catch(e){} }; });
  var metas = TAB==='metas', reg = (TAB==='diario' || TAB==='agua'), sem = TAB==='semana';
  ['nutritionNotesBanner','macroCard','mealWindowRow','btnDiaLibre'].forEach(function(id){ ocultar(document.getElementById(id), !metas); });
  ocultar(nv.querySelector('details.accordion'), !metas);
  ocultar(document.getElementById('mealCard'), !reg);
  ocultar(document.getElementById('rgWeek'), !sem);
  ocultar(document.getElementById('mealHistoryCard'), !sem);
  Array.prototype.forEach.call(document.querySelectorAll('#mealCard [data-nsec]'), function(s){ var k = s.dataset.nsec; ocultar(s, !(k==='nav' || k===TAB)); });
 }

 /* ── Diario ── */
 function barra(lbl, val, meta, color, unit){
  var pct = meta>0 ? Math.min(100, val/meta*100) : 0, over = meta>0 && val>meta*1.05, resta = meta-val;
  return '<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="color:var(--text-muted,#9aa0a6);font-weight:600">'+lbl+'</span><span style="font-family:var(--font-mono);font-weight:700">'+r0(val)+' / '+r0(meta)+unit+'</span></div>'+
  '<div style="height:7px;border-radius:6px;background:var(--surface,#14171B);overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+(over?'#E05B5B':color)+'"></div></div>'+
  '<div style="font-size:11px;margin-top:2px;color:'+(over?'#E05B5B':'var(--text-muted,#9aa0a6)')+'">'+(resta>=0?'Faltan '+r0(resta)+unit:'Te pasaste por '+r0(-resta)+unit)+'</div></div>';
 }
 function renderRegistro(){
  var card = document.getElementById('mealCard'); if(!card || !activo) return;
  var date = vd(), hoyS = todayStr(), mwReq = mealWindows.find(function(w){ return w.id===activeMealWindow; }) || mealWindows[0];
  var mwPlan = ventanaDe(date), arr = foodLog[date] || [], tot = sumar(arr);
  var T = mwReq.macros || {kcal:0,proteinG:0,carbG:0,fatG:0}, esHoy = date===hoyS;
  var kcalP = tot.p*4, kcalC = tot.c*4, kcalF = tot.f*9, ks = (kcalP+kcalC+kcalF) || 1;
  var h = '<div data-nsec="nav">'+'<div class="card-top"><div class="card-title"><span class="day-tag">Diario de alimentos</span>'+esc(mwReq.label)+'</div></div>';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin:2px 0 8px"><button class="week-btn" id="rgPrev" style="min-width:42px">◀</button><div style="font-family:var(--font-mono);font-weight:700;font-size:13px">'+(esHoy?'HOY · ':'')+date+'</div><button class="week-btn" id="rgNext" style="min-width:42px;'+(esHoy?'opacity:.35':'')+'">▶</button></div>';
  h += '</div><div data-nsec="diario">';
  h += '<div style="background:var(--surface-2,#1c1f24);border-radius:12px;padding:12px 12px 4px">'+
   '<div style="display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:center;text-align:center;gap:2px"><div><div style="font-family:var(--font-mono);font-weight:700;font-size:18px">'+r0(T.kcal)+'</div><div style="font-size:10px;color:var(--text-muted,#9aa0a6)">META</div></div><div style="opacity:.5">−</div><div><div style="font-family:var(--font-mono);font-weight:700;font-size:18px">'+r0(tot.k)+'</div><div style="font-size:10px;color:var(--text-muted,#9aa0a6)">ALIMENTOS</div></div><div style="opacity:.5">=</div><div><div style="font-family:var(--font-mono);font-weight:800;font-size:22px;color:'+(T.kcal-tot.k<0?'#E05B5B':COL.k)+'">'+r0(T.kcal-tot.k)+'</div><div style="font-size:10px;color:var(--text-muted,#9aa0a6)">RESTANTES</div></div></div>'+
   '<div style="display:flex;height:6px;border-radius:6px;overflow:hidden;margin:12px 0 4px;background:var(--surface,#14171B)"><div style="width:'+(kcalP/ks*100)+'%;background:'+COL.p+'"></div><div style="width:'+(kcalC/ks*100)+'%;background:'+COL.c+'"></div><div style="width:'+(kcalF/ks*100)+'%;background:'+COL.f+'"></div></div>'+
   '<div style="font-size:10.5px;color:var(--text-muted,#9aa0a6);margin-bottom:6px">'+(tot.k>0?'Reparto de calorías · P '+r0(kcalP/ks*100)+'% · C '+r0(kcalC/ks*100)+'% · G '+r0(kcalF/ks*100)+'%':'Aún no registras alimentos hoy')+'</div>'+
   barra('PROTEÍNA', tot.p, T.proteinG, COL.p, ' g')+barra('CARBOHIDRATOS', tot.c, T.carbG, COL.c, ' g')+barra('GRASAS', tot.f, T.fatG, COL.f, ' g')+resumenAct(date, tot)+'</div>';
  mwPlan.meals.forEach(function(meal,mi){
   var es = arr.filter(function(e){ return e.m===mi; }), st = sumar(es);
   var _p = String(meal.name).split(' · '), _num = _p[0], _rest = _p.slice(1).join(' · ') || meal.sub || '';
   h += '<div style="margin-top:20px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px;background:linear-gradient(90deg,rgba(224,194,61,.16),rgba(224,194,61,0));border-left:4px solid var(--accent,#E0C23D);border-radius:8px"><div style="min-width:0"><div style="font-size:19px;font-weight:800;line-height:1.1;color:#FFE27A;text-shadow:0 0 12px rgba(224,194,61,.45);text-transform:uppercase;letter-spacing:.02em">'+esc(_num)+'</div>'+(_rest?'<div style="font-size:13px;font-weight:600;color:var(--text,#e8eaed);margin-top:2px">'+esc(_rest)+'</div>':'')+'</div><div style="font-family:var(--font-mono);font-weight:800;font-size:15px;color:'+(es.length?'#FFE27A':'var(--text-muted,#9aa0a6)')+';white-space:nowrap">'+(es.length? r0(st.k)+' kcal':'0 kcal')+'</div></div>';
   es.forEach(function(e){
    var m = macrosDe(e), desc = e.u ? fmt(e.q)+' '+esc(e.u)+' · '+fmt(e.g)+' g' : (e.g ? fmt(e.g)+' g' : '');
    h += '<div class="row" style="align-items:center"><div class="ex-info" data-edit="'+e.id+'" style="cursor:pointer"><div class="ex-name">'+esc(e.n)+'</div><div class="ex-tip">'+(desc?desc+' · ':'')+r0(m.k)+' kcal · P '+fmt(m.p)+' · C '+fmt(m.c)+' · G '+fmt(m.f)+'</div></div><button data-del="'+e.id+'" aria-label="Eliminar" style="background:none;border:0;color:#E05B5B;font-size:20px;padding:6px 10px;cursor:pointer">×</button></div>';
   });
   h += '<button class="week-btn" data-add="'+mi+'" style="width:100%;margin-top:6px;color:var(--accent,#E0C23D);font-weight:700">+ AGREGAR ALIMENTO</button>';
   if(meal.items && meal.items.length) h += '<details style="margin-top:6px"><summary style="font-size:11.5px;color:var(--text-muted,#9aa0a6);cursor:pointer">Sugerido por tu coach</summary>'+meal.items.map(function(x){ return '<div class="ex-tip">· '+esc(x)+'</div>'; }).join('')+'</details>';
  });
  h += '</div><div data-nsec="agua"><div style="margin-top:12px;padding:10px 12px;border-radius:10px;background:var(--surface-2,#1c1f24);font-size:12.5px;display:flex;justify-content:space-between;gap:8px"><span>Restantes <b style="font-family:var(--font-mono);color:'+(T.kcal-tot.k<0?'#E05B5B':COL.k)+'">'+r0(T.kcal-tot.k)+' kcal</b></span><span style="color:var(--text-muted,#9aa0a6)">Proteína faltan '+r0(Math.max(0,T.proteinG-tot.p))+' g</span></div>';
  var ml = aguaLog[date] || 0, apct = Math.min(100, ml/AGUA_META*100), okAg = ml>=AGUA_META;
  h += '<div style="margin-top:20px;padding:12px;background:var(--surface-2,#1c1f24);border-radius:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:17px;font-weight:800;color:#7FD1FF">💧 AGUA</div><div style="font-family:var(--font-mono);font-weight:800;font-size:15px;color:'+(okAg?'#4CAF7D':'var(--text,#e8eaed)')+'">'+fmt(ml/1000)+' / '+fmt(AGUA_META/1000)+' L</div></div>'+
   '<div style="height:10px;border-radius:8px;background:var(--surface,#14171B);overflow:hidden;margin:8px 0 4px"><div style="height:100%;width:'+apct+'%;background:'+(okAg?'#4CAF7D':'#7FD1FF')+'"></div></div>'+
   '<div style="font-size:11.5px;color:var(--text-muted,#9aa0a6);margin-bottom:8px">'+(okAg?'Meta cumplida ✓ · '+r0(ml/AGUA_META*100)+'%':'Faltan '+fmt((AGUA_META-ml)/1000)+' L · '+r0(ml/AGUA_META*100)+'% de tu meta')+'</div>'+
   '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="week-btn" data-ag="250">+250 ml</button><button class="week-btn" data-ag="500">+500 ml</button><button class="week-btn" data-ag="750">+750 ml</button><button class="week-btn" data-ag="1000">+1 L</button><button class="week-btn" data-ag="-250" style="color:#E05B5B">−250</button></div>'+
   '<div style="display:flex;gap:6px;margin-top:8px"><input id="agCustom" inputmode="numeric" placeholder="Otra cantidad (ml)" style="flex:1;min-width:0;box-sizing:border-box;background:var(--surface,#14171B);color:var(--text,#e8eaed);border:1px solid var(--border,#2a2f36);border-radius:10px;padding:9px;font-size:14px"><button class="week-btn" id="agCustomBtn">Agregar</button></div></div>';
  h += actividadHtml(date) + '</div>';
  card.innerHTML = h;
  aplicarTab();
  card.querySelector('#rgPrev').onclick = function(){ setDate(addDays(date,-1)); };
  if(!esHoy) card.querySelector('#rgNext').onclick = function(){ setDate(addDays(date,1)); };
  Array.prototype.forEach.call(card.querySelectorAll('[data-add]'), function(b){ b.onclick = function(){ abrirHoja(date, +b.dataset.add, null); }; });
  Array.prototype.forEach.call(card.querySelectorAll('[data-del]'), function(b){ b.onclick = function(ev){ ev.stopPropagation(); eliminar(date,b.dataset.del); }; });
  Array.prototype.forEach.call(card.querySelectorAll('[data-edit]'), function(b){ b.onclick = function(){ var e = (foodLog[date]||[]).find(function(x){ return x.id===b.dataset.edit; }); if(e) abrirHoja(date, e.m, e); }; });
  Array.prototype.forEach.call(card.querySelectorAll('[data-ag]'), function(bt){ bt.onclick = function(){ sumarAgua(date, +bt.dataset.ag); }; });
  var cb = card.querySelector('#agCustomBtn'), ci = card.querySelector('#agCustom');
  function custom(){ var v = Math.round(num(ci.value)); if(v>0 && v<=5000) sumarAgua(date, v); else toast2('Ingresa los ml (1 a 5000)'); }
  cb.onclick = custom; ci.onkeydown = function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); custom(); } };
  Array.prototype.forEach.call(card.querySelectorAll('[data-act-del]'), function(b){ b.onclick = function(){ actLog[date] = (actLog[date]||[]).filter(function(x){ return x.id!==b.dataset.actDel; }); guardarAct(); renderRegistro(); renderSemana(); }; });
  Array.prototype.forEach.call(card.querySelectorAll('[data-act-add]'), function(b){ b.onclick = function(){ abrirActividad(date, b.dataset.actAdd); }; });
  Array.prototype.forEach.call(card.querySelectorAll('[data-act-plan]'), function(b){ b.onclick = function(){ var p = planDe(date); if(!p) return; var tipo = b.dataset.actPlan; if(tipo==='cardio' && p.cardio) agregarAct(date, {t:'cardio', n:p.cardio.nombre, min:p.cardio.min, kcal:estimarKcal(metDe(p.cardio.nombre,'cardio'), p.cardio.min), est:true, plan:true}); else if(tipo==='fuerza') agregarAct(date, {t:'fuerza', n:p.dayName||'Entrenamiento de fuerza', min:60, kcal:estimarKcal(MET_FUERZA, 60), est:true, plan:true}); }; });
 }
 function eliminar(date,id){ foodLog[date] = (foodLog[date]||[]).filter(function(e){ return e.id!==id; }); guardar(); sincronizarCheck(date); renderRegistro(); renderHistorial(); }
 function renderHistorial(){
  var el = document.getElementById('mealHistoryCard'); if(!el || !activo) return;
  var dias = Object.keys(foodLog).filter(function(d){ return (foodLog[d]||[]).length; }).sort().reverse().slice(0,14);
  if(!dias.length){ el.innerHTML = ''; aplicarTab(); return; }
  el.innerHTML = '<summary class="section-label" style="margin:0 0 4px">Historial de macros</summary><div style="margin-top:12px">'+dias.map(function(d){
   var t = sumar(foodLog[d]), w = ventanaDe(d), meta = (w.macros||{}).kcal||0, pct = meta? r0(t.k/meta*100) : 0;
   var color = (pct>=90 && pct<=105) ? '#4CAF7D' : (pct>=75 && pct<=115 ? '#E0C23D' : '#E05B5B');
   return '<div class="param-row"><span class="param-label">'+d+'</span><span class="param-value" style="font-family:var(--font-mono);font-weight:700;color:'+color+'">'+r0(t.k)+' kcal ('+pct+'%) · P '+r0(t.p)+' · C '+r0(t.c)+' · G '+r0(t.f)+'</span></div>';
  }).join('')+'</div>';
  aplicarTab();
 }
 /* ── Datos para listas ── */
 function usoAlimentos(){
  var map = {};
  Object.keys(foodLog).sort().forEach(function(d){
   (foodLog[d]||[]).forEach(function(e){ if(!e.b) return; var x = map[e.n] || (map[e.n] = {n:e.n, b:e.b, c:0, last:'', e:e}); x.c++; x.last = d; x.e = e; });
  });
  return Object.keys(map).map(function(k){ return map[k]; });
 }
 function defaultDe(nombre, b, online){
  var s = porcionesDe(nombre, online);
  if(s.length) return {q:1, u:s[0][0], ug:s[0][1], g:s[0][1]};
  return {q:100, u:null, ug:1, g:100};
 }
 /* ── Hoja ── */
 function cerrarHoja(){ if(sheetEl){ sheetEl.remove(); sheetEl = null; } }
 function toast2(t){ try{ showToast(t, true); }catch(e){ alert(t); } }
 function chip(t){ return '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center">'+[['KCAL',t[0],COL.k],['PROT',t[1],COL.p],['CARB',t[2],COL.c],['GRASA',t[3],COL.f]].map(function(x){ return '<div style="background:var(--surface-2,#1c1f24);border-radius:10px;padding:8px 2px"><div style="font-family:var(--font-mono);font-weight:700;font-size:16px;color:'+x[2]+'">'+(x[0]==='KCAL'?r0(x[1]):fmt(x[1]))+'</div><div style="font-size:9.5px;color:var(--text-muted,#9aa0a6)">'+x[0]+'</div></div>'; }).join('')+'</div>'; }
 function abrirHoja(date, mi, edit){
  cerrarHoja();
  var meal = ventanaDe(date).meals[mi] || {name:'Comida'};
  ST = {vista:'lista', tab:'todos', q:'', sel:null, agregados:0, online:[], onlineMsg:''};
  var wReq = mealWindows.find(function(w){ return w.id===activeMealWindow; }) || mealWindows[0], T = wReq.macros || {};
  if(edit && edit.b){ ST.sel = {n:edit.n, b:edit.b, online:null, qty:(edit.u?edit.q:edit.g), unit:edit.u?edit.u:'g', ug:edit.u?(edit.g/edit.q):1}; ST.vista='detalle'; }
  else if(edit && edit.t){ ST.vista = 'macros'; }
  sheetEl = document.createElement('div');
  sheetEl.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center';
  sheetEl.innerHTML = '<div id="rgSheet" style="width:100%;max-width:520px;height:90vh;display:flex;flex-direction:column;background:var(--surface,#14171B);border:1px solid var(--border,#2a2f36);border-radius:18px 18px 0 0"></div>';
  document.body.appendChild(sheetEl);
  sheetEl.addEventListener('click', function(ev){ if(ev.target===sheetEl) cerrarHoja(); });
  var inp = 'width:100%;box-sizing:border-box;background:var(--surface-2,#1c1f24);color:var(--text,#e8eaed);border:1px solid var(--border,#2a2f36);border-radius:10px;padding:11px;font-size:15px';
  function marco(titulo, cuerpo, pie, atras){
   var S = sheetEl.querySelector('#rgSheet');
   S.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:14px 16px 8px">'+(atras?'<button id="rgBackBtn" style="background:none;border:0;color:var(--text,#e8eaed);font-size:20px;cursor:pointer;padding:0 6px">←</button>':'')+'<div style="flex:1;font-weight:700">'+titulo+'</div><button id="rgX" style="background:none;border:0;color:var(--text-muted,#9aa0a6);font-size:24px;cursor:pointer">×</button></div><div id="rgBody" style="flex:1;overflow:auto;padding:0 16px 12px">'+cuerpo+'</div>'+(pie?'<div style="padding:10px 16px 18px;border-top:1px solid var(--border,#2a2f36)">'+pie+'</div>':'');
   S.querySelector('#rgX').onclick = cerrarHoja;
   var bb = S.querySelector('#rgBackBtn'); if(bb) bb.onclick = function(){ ST.vista='lista'; ST.sel=null; pintar(); };
   return S;
  }
  function pie(){ return ST.agregados>0 ? '<button id="rgDone" class="sv" style="width:100%">Listo · '+ST.agregados+' agregado'+(ST.agregados>1?'s':'')+'</button>' : ''; }
  function agregarEntrada(datos, seguir){
   var arr = foodLog[date] = foodLog[date] || [];
   if(edit){ var i = arr.findIndex(function(e){ return e.id===edit.id; }); var nuevo = Object.assign({id:edit.id, m:mi}, datos); if(i>=0) arr[i] = nuevo; else arr.push(nuevo); }
   else arr.push(Object.assign({id:Date.now().toString(36)+Math.floor(Math.random()*99), m:mi}, datos));
   guardar(); sincronizarCheck(date); renderRegistro(); renderHistorial();
   if(edit){ cerrarHoja(); return; }
   ST.agregados++; ST.vista='lista'; ST.sel=null; ST.q=''; ST.flash = datos.n; pintar();
  }
  function datosDeSel(s){
   var g = s.qty*s.ug, o = {n:s.n, g:r1(g), b:s.b};
   if(s.unit && s.unit!=='g'){ o.u = s.unit; o.q = s.qty; }
   return o;
  }
  /* — Lista de búsqueda — */
  function pintarLista(){
   var tabs = [['todos','Todos'],['recientes','Recientes'],['frecuentes','Frecuentes'],['propios','Mis alimentos']];
   var cuerpo = '<input id="rgQ" value="'+esc(ST.q)+'" placeholder="Buscar un alimento (ej: arroz, pollo, avena)" style="'+inp+'" autocomplete="off">'+
    '<div style="display:flex;gap:6px;margin:10px 0;overflow:auto">'+tabs.map(function(t){ return '<button class="week-btn '+(ST.tab===t[0]?'active':'')+'" data-tab="'+t[0]+'" style="white-space:nowrap">'+t[1]+'</button>'; }).join('')+'</div>'+
    (ST.flash?'<div style="background:#1f3a2a;color:#7fe0a8;border-radius:10px;padding:8px 10px;font-size:12.5px;margin-bottom:8px">✓ Agregado: '+esc(ST.flash)+'. Puedes seguir agregando.</div>':'')+
    '<div id="rgList"></div>'+
    '<div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap"><button class="week-btn" id="rgCopy">📋 Copiar de ayer</button><button class="week-btn" id="rgMac">⚡ Solo macros</button><button class="week-btn" id="rgNew">＋ Crear alimento</button></div>';
   var S = marco('Agregar a '+esc(meal.name), cuerpo, pie());
   ST.flash = null;
   var q = S.querySelector('#rgQ'), list = S.querySelector('#rgList');
   function fila(n, b, sub, tag, extra){
    var d = defaultDe(n, b, extra), kc = b[0]*d.g/100;
    return '<div class="rgRow" data-n="'+esc(n)+'" style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--border,#2a2f36);cursor:pointer"><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14px">'+esc(n)+(tag?' <span style="font-size:10px;opacity:.6">'+tag+'</span>':'')+'</div><div style="font-size:11.5px;color:var(--text-muted,#9aa0a6)">'+r0(kc)+' kcal · '+(d.u?fmt(d.q)+' '+esc(d.u)+' ('+fmt(d.g)+' g)':fmt(d.g)+' g')+(sub?' · '+esc(sub):'')+'</div></div><button class="rgQuick" aria-label="Agregar rápido" style="width:34px;height:34px;border-radius:50%;border:1px solid var(--accent,#E0C23D);background:none;color:var(--accent,#E0C23D);font-size:20px;cursor:pointer">+</button></div>';
   }
   function listar(){
    var t = sa(q.value), items = [], vacio = '';
    if(t){
     var nombres = todosNombres().filter(function(n){ return sa(n).indexOf(t)>=0; });
     nombres.sort(function(a,b){ return (sa(a).indexOf(t)===0?0:1)-(sa(b).indexOf(t)===0?0:1) || a.length-b.length; });
     items = nombres.slice(0,25).map(function(n){ return {n:n, b:baseDe(n), tag:propios[n.toLowerCase()]?'mío':''}; });
     ST.online.forEach(function(o){ items.push({n:o.n, b:o.b, tag:'🌐', online:o, sub:o.marca}); });
     vacio = 'Sin resultados. Prueba otra palabra, «Buscar en internet» o «Crear alimento».';
    } else if(ST.tab==='recientes'){
     items = usoAlimentos().sort(function(a,b){ return a.last<b.last?1:-1; }).slice(0,20).map(function(u){ return {n:u.n, b:u.b, e:u.e}; });
     vacio = 'Aquí aparecerán los alimentos que registres.';
    } else if(ST.tab==='frecuentes'){
     items = usoAlimentos().sort(function(a,b){ return b.c-a.c; }).slice(0,20).map(function(u){ return {n:u.n, b:u.b, e:u.e, sub:u.c+' veces'}; });
     vacio = 'Aquí aparecerán los alimentos que más usas.';
    } else if(ST.tab==='propios'){
     items = Object.keys(propios).map(function(n){ return {n:n, b:propios[n]}; });
     vacio = 'Aún no creas alimentos propios. Usa «Crear alimento».';
    } else {
     var us = usoAlimentos().sort(function(a,b){ return b.c-a.c; }).slice(0,8);
     items = us.map(function(u){ return {n:u.n, b:u.b, e:u.e, sub:'usado '+u.c+(u.c>1?' veces':' vez')}; });
     vacio = 'Escribe en el buscador para encontrar un alimento.';
    }
    var h = items.map(function(it,i){ return fila(it.n, it.b, it.sub, it.tag, it.online).replace('data-n="','data-i="'+i+'" data-n="'); }).join('');
    if(t) h += '<button class="week-btn" id="rgWeb" style="width:100%;margin-top:10px">🌐 Buscar «'+esc(q.value.trim())+'» en internet</button>'+(ST.onlineMsg?'<div style="font-size:11.5px;color:var(--text-muted,#9aa0a6);margin-top:6px">'+esc(ST.onlineMsg)+'</div>':'');
    list.innerHTML = h || '<div style="font-size:12.5px;color:var(--text-muted,#9aa0a6);padding:10px 0">'+vacio+'</div>';
    Array.prototype.forEach.call(list.querySelectorAll('.rgRow'), function(row){
     var it = items[+row.dataset.i];
     function seleccion(){
      var d = (it.e && it.e.u) ? {q:it.e.q, u:it.e.u, ug:it.e.g/it.e.q} : (it.e && it.e.g ? {q:it.e.g, u:null, ug:1} : (function(){ var x = defaultDe(it.n, it.b, it.online); return {q:x.q, u:x.u, ug:x.ug}; })());
      return {n:it.n, b:it.b, online:it.online||null, qty:d.q, unit:d.u||'g', ug:d.ug};
     }
     row.onclick = function(){ ST.sel = seleccion(); ST.vista='detalle'; pintar(); };
     row.querySelector('.rgQuick').onclick = function(ev){ ev.stopPropagation(); var s = seleccion(); if(!s.unit || s.unit==='g'){ var x = defaultDe(it.n, it.b, it.online); if(!(it.e && it.e.g)){ s.qty = x.q; s.unit = x.u||'g'; s.ug = x.ug; } } agregarEntrada(datosDeSel(s)); };
    });
    var web = list.querySelector('#rgWeb'); if(web) web.onclick = buscarOnline;
   }
   function buscarOnline(){
    var t = q.value.trim(); if(!t) return;
    ST.onlineMsg = 'Buscando…'; listar();
    var url = 'https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=12&fields=product_name,brands,nutriments,serving_quantity&search_terms='+encodeURIComponent(t);
    fetch(url).then(function(r){ return r.json(); }).then(function(d){
     ST.online = (d.products||[]).filter(function(p){ var n = p.nutriments||{}; return p.product_name && n['energy-kcal_100g']!=null; }).map(function(p){
      var n = p.nutriments, sq = parseFloat(p.serving_quantity);
      return {n:p.product_name, marca:p.brands||'', b:[+n['energy-kcal_100g']||0, +n.proteins_100g||0, +n.carbohydrates_100g||0, +n.fat_100g||0].map(r1), serv: sq>0 ? [['porción',sq]] : null};
     });
     ST.onlineMsg = ST.online.length ? 'Datos colaborativos de Open Food Facts: revisa la etiqueta del producto.' : 'No encontré productos en internet.';
     listar();
    }).catch(function(){ ST.onlineMsg = 'No se pudo buscar en internet. Revisa tu conexión.'; listar(); });
   }
   q.oninput = function(){ ST.q = q.value; ST.online = []; ST.onlineMsg = ''; listar(); };
   q.onkeydown = function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); var first = list.querySelector('.rgRow'); if(first) first.click(); } };
   Array.prototype.forEach.call(S.querySelectorAll('[data-tab]'), function(b){ b.onclick = function(){ ST.tab = b.dataset.tab; ST.q=''; ST.online=[]; ST.onlineMsg=''; pintar(); }; });
   S.querySelector('#rgMac').onclick = function(){ ST.vista='macros'; pintar(); };
   S.querySelector('#rgNew').onclick = function(){ ST.vista='propio'; pintar(); };
   S.querySelector('#rgCopy').onclick = function(){
    var ayer = addDays(date,-1), src = (foodLog[ayer]||[]).filter(function(e){ return e.m===mi; });
    if(!src.length){ toast2('Ayer no tienes alimentos en esta comida'); return; }
    var arr = foodLog[date] = foodLog[date] || [];
    src.forEach(function(e){ arr.push(Object.assign({}, e, {id:Date.now().toString(36)+Math.floor(Math.random()*999)})); });
    guardar(); sincronizarCheck(date); renderRegistro(); renderHistorial();
    ST.agregados += src.length; ST.flash = src.length+' alimento'+(src.length>1?'s':'')+' de ayer'; pintar();
   };
   var done = S.querySelector('#rgDone'); if(done) done.onclick = cerrarHoja;
   listar();
   if(!ST.agregados || ST.q) q.focus();
  }
  /* — Detalle de porción — */
  function pintarDetalle(){
   var s = ST.sel, servs = porcionesDe(s.n, s.online), unitsHtml = '<option value="g" data-ug="1"'+(s.unit==='g'?' selected':'')+'>gramos</option>'+servs.map(function(x){ return '<option value="'+esc(x[0])+'" data-ug="'+x[1]+'"'+(s.unit===x[0]?' selected':'')+'>'+esc(x[0])+' ('+x[1]+' g)</option>'; }).join('');
   if(s.unit!=='g' && !servs.some(function(x){ return x[0]===s.unit; })) unitsHtml += '<option value="'+esc(s.unit)+'" data-ug="'+s.ug+'" selected>'+esc(s.unit)+' ('+fmt(s.ug)+' g)</option>';
   var cuerpo = '<div style="font-weight:700;font-size:16px">'+esc(s.n)+'</div><div style="font-size:11.5px;color:var(--text-muted,#9aa0a6);margin:2px 0 12px">Por 100 g: '+fmt(s.b[0])+' kcal · P '+fmt(s.b[1])+' · C '+fmt(s.b[2])+' · G '+fmt(s.b[3])+'</div>'+
    '<div style="display:grid;grid-template-columns:110px 1fr;gap:8px"><div><label style="font-size:11px;font-weight:600;color:var(--text-muted,#9aa0a6)">CANTIDAD</label><input id="dQ" inputmode="decimal" value="'+fmt(s.qty)+'" style="'+inp+';margin-top:4px;font-family:var(--font-mono);font-weight:700;font-size:18px"></div><div><label style="font-size:11px;font-weight:600;color:var(--text-muted,#9aa0a6)">MEDIDA</label><select id="dU" style="'+inp+';margin-top:4px">'+unitsHtml+'</select></div></div>'+
    '<div id="dQuick" style="display:flex;gap:6px;margin:10px 0;flex-wrap:wrap"></div><div id="dPrev"></div><div id="dPct" style="margin-top:12px"></div>';
   var S = marco('Porción', cuerpo, '<button id="dOk" class="sv" style="width:100%"></button>', !edit);
   var qi = S.querySelector('#dQ'), ui = S.querySelector('#dU'), prev = S.querySelector('#dPrev'), ok = S.querySelector('#dOk'), pct = S.querySelector('#dPct'), qk = S.querySelector('#dQuick');
   function chips(){
    var vals = s.unit==='g' ? [50,100,150,200,250,300] : [0.5,1,2,3,4];
    qk.innerHTML = vals.map(function(v){ return '<button class="week-btn" data-v="'+v+'">'+fmt(v)+'</button>'; }).join('');
    Array.prototype.forEach.call(qk.querySelectorAll('[data-v]'), function(b){ b.onclick = function(){ qi.value = b.dataset.v; calc(); }; });
   }
   function calc(){
    s.qty = num(qi.value); var g = s.qty*s.ug, f = g/100, m = [s.b[0]*f,s.b[1]*f,s.b[2]*f,s.b[3]*f];
    prev.innerHTML = chip(m);
    pct.innerHTML = '<div style="font-size:11px;font-weight:600;color:var(--text-muted,#9aa0a6);margin-bottom:6px">PORCENTAJE DE TU META DIARIA</div>'+[['Calorías',m[0],T.kcal,COL.k],['Proteína',m[1],T.proteinG,COL.p],['Carbos',m[2],T.carbG,COL.c],['Grasas',m[3],T.fatG,COL.f]].map(function(x){ var p = x[2]>0 ? x[1]/x[2]*100 : 0; return '<div style="display:flex;align-items:center;gap:8px;font-size:11.5px;margin:4px 0"><span style="width:62px;color:var(--text-muted,#9aa0a6)">'+x[0]+'</span><div style="flex:1;height:6px;border-radius:6px;background:var(--surface-2,#1c1f24);overflow:hidden"><div style="height:100%;width:'+Math.min(100,p)+'%;background:'+x[3]+'"></div></div><span style="width:34px;text-align:right;font-family:var(--font-mono)">'+r0(p)+'%</span></div>'; }).join('');
    var listo = s.qty>0; ok.disabled = !listo; ok.style.opacity = listo?'1':'.45';
    ok.textContent = listo ? (edit?'Guardar cambios':'✓ Agregar a '+meal.name)+' · '+fmt(g)+' g' : 'Ingresa la cantidad';
   }
   qi.oninput = calc;
   qi.onkeydown = function(ev){ if(ev.key==='Enter' && !ok.disabled){ ev.preventDefault(); ok.click(); } };
   ui.onchange = function(){
    var o = ui.options[ui.selectedIndex], nuevoUg = +o.dataset.ug, antG = s.qty*s.ug;
    s.unit = o.value; s.ug = nuevoUg;
    s.qty = r1(s.unit==='g' ? (antG||100) : (antG>0 ? antG/nuevoUg : 1)); if(s.unit!=='g' && s.qty<=0) s.qty = 1;
    qi.value = fmt(s.qty); chips(); calc();
   };
   ok.onclick = function(){ if(!(s.qty>0)){ toast2('Ingresa la cantidad'); return; } agregarEntrada(datosDeSel(s)); };
   chips(); calc(); qi.focus(); qi.select();
  }
  /* — Crear alimento — */
  function pintarPropio(){
   var cuerpo = '<div style="font-size:12px;color:var(--text-muted,#9aa0a6);margin:2px 0 8px">Ingresa los valores por 100 g (están en la etiqueta). Quedará guardado en «Mis alimentos».</div>'+
    '<input id="pN" placeholder="Nombre del alimento" style="'+inp+';margin-bottom:8px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input id="pK" inputmode="decimal" placeholder="kcal /100 g (opcional)" style="'+inp+'"><input id="pP" inputmode="decimal" placeholder="Proteína /100 g" style="'+inp+'"><input id="pC" inputmode="decimal" placeholder="Carbos /100 g" style="'+inp+'"><input id="pF" inputmode="decimal" placeholder="Grasas /100 g" style="'+inp+'"></div>'+
    '<input id="pS" inputmode="decimal" placeholder="Gramos por porción (opcional, ej: 30)" style="'+inp+';margin-top:8px">';
   var S = marco('Crear alimento', cuerpo, '<button id="pOk" class="sv" style="width:100%">Guardar y elegir cantidad</button>', true);
   S.querySelector('#pOk').onclick = function(){
    var n = S.querySelector('#pN').value.trim(), p = num(S.querySelector('#pP').value), c = num(S.querySelector('#pC').value), f = num(S.querySelector('#pF').value), k = num(S.querySelector('#pK').value) || (4*p+4*c+9*f), sg = num(S.querySelector('#pS').value);
    if(!n || !(k>0)){ toast2('Completa el nombre y los valores'); return; }
    var key = n.toLowerCase(); propios[key] = [r1(k),r1(p),r1(c),r1(f)]; guardarPropios();
    if(sg>0) SERV[key] = [['porción',sg]];
    var d = defaultDe(key, propios[key]);
    ST.sel = {n:key, b:propios[key], online:null, qty:d.q, unit:d.u||'g', ug:d.ug}; ST.vista='detalle'; pintar();
   };
  }
  /* — Solo macros — */
  function pintarMacros(){
   var cuerpo = '<div style="font-size:12px;color:var(--text-muted,#9aa0a6);margin:2px 0 8px">Para comidas fuera de plan: ingresa los macros totales de lo que comiste.</div>'+
    '<input id="mN" placeholder="Descripción (ej: Almuerzo restaurante)" style="'+inp+';margin-bottom:8px" value="'+(edit&&edit.t?esc(edit.n):'')+'"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input id="mK" inputmode="decimal" placeholder="kcal (opcional)" style="'+inp+'" value="'+(edit&&edit.t?edit.t[0]:'')+'"><input id="mP" inputmode="decimal" placeholder="Proteína g" style="'+inp+'" value="'+(edit&&edit.t?edit.t[1]:'')+'"><input id="mC" inputmode="decimal" placeholder="Carbos g" style="'+inp+'" value="'+(edit&&edit.t?edit.t[2]:'')+'"><input id="mF" inputmode="decimal" placeholder="Grasas g" style="'+inp+'" value="'+(edit&&edit.t?edit.t[3]:'')+'"></div><div id="mPrev" style="margin-top:12px"></div>';
   var S = marco('Solo macros', cuerpo, '<button id="mOk" class="sv" style="width:100%">'+(edit?'Guardar cambios':'✓ Agregar a '+esc(meal.name))+'</button>', !edit);
   function val(){ var p = num(S.querySelector('#mP').value), c = num(S.querySelector('#mC').value), f = num(S.querySelector('#mF').value), k = num(S.querySelector('#mK').value) || (4*p+4*c+9*f); return [k,p,c,f]; }
   function upd(){ S.querySelector('#mPrev').innerHTML = chip(val()); }
   ['mK','mP','mC','mF'].forEach(function(i){ S.querySelector('#'+i).oninput = upd; }); upd();
   S.querySelector('#mOk').onclick = function(){ var v = val(); if(!(v[0]>0)){ toast2('Ingresa al menos un macro'); return; } agregarEntrada({n:S.querySelector('#mN').value.trim()||'Comida fuera de plan', t:v.map(r1)}); };
  }
  function pintar(){
   if(ST.vista==='detalle') pintarDetalle();
   else if(ST.vista==='propio') pintarPropio();
   else if(ST.vista==='macros') pintarMacros();
   else pintarLista();
  }
  pintar();
 }
 function sumarAgua(date, ml){
  var v = Math.max(0, Math.min(15000, (aguaLog[date]||0) + ml));
  aguaLog[date] = v;
  var keys = Object.keys(aguaLog).sort().slice(-90), out = {}; keys.forEach(function(k){ out[k] = aguaLog[k]; }); aguaLog = out;
  saveField('aguaLog', aguaLog);
  var cumple = v>=AGUA_META;
  if(!!mealChecks[date+'-agua'] !== cumple){ mealChecks[date+'-agua'] = cumple; saveField('mealChecks', mealChecks); try{ updateMesocicloSummary(); }catch(e){} }
  renderRegistro(); renderSemana();
 }
 var DIAS3 = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
 function lunesDe(date){ var d = new Date(date+'T12:00:00'); return addDays(date, -((d.getDay()+6)%7)); }
 function actSemana(filas, n, reg, pk){
  var tot = {cm:0, fm:0, k:0, dc:0}, rows = filas.map(function(f){
   var a = totAct(f.d); tot.cm += a.cardioMin; tot.fm += a.fuerzaMin; tot.k += a.kcal; if(CARDIO_MIN>0 && a.cardioMin>=CARDIO_MIN) tot.dc++;
   var neto = f.reg ? r0(f.t.k - a.kcal) : null;
   return '<div style="display:grid;grid-template-columns:54px 1fr 1fr 1fr 1fr;gap:4px;font-size:12px;padding:7px 0;border-bottom:1px solid var(--border,#2a2f36);opacity:'+(f.fut?'.4':'1')+'"><span style="font-weight:700;color:'+(f.d===todayStr()?'#FFE27A':'inherit')+'">'+f.lbl+'</span><span style="text-align:right;font-family:var(--font-mono);color:'+(CARDIO_MIN>0&&a.cardioMin>=CARDIO_MIN?'#4CAF7D':(a.cardioMin>0?'#FF9F5B':'var(--text-muted,#9aa0a6)'))+'">'+(a.cardioMin?a.cardioMin:'—')+'</span><span style="text-align:right;font-family:var(--font-mono)">'+(a.fuerzaMin?a.fuerzaMin:'—')+'</span><span style="text-align:right;font-family:var(--font-mono)">'+(a.kcal?r0(a.kcal):'—')+'</span><span style="text-align:right;font-family:var(--font-mono)">'+(neto!==null?neto:'—')+'</span></div>';
  }).join('');
  var dias = filas.filter(function(f){ return !f.fut; }).length;
  return '<div style="font-size:15px;font-weight:800;color:#FF9F5B;margin:18px 0 6px">🔥 ACTIVIDAD DE LA SEMANA</div>'+
   '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px"><div style="background:var(--surface-2,#1c1f24);border-radius:10px;padding:8px 4px;text-align:center"><div style="font-family:var(--font-mono);font-weight:800;font-size:15px">'+tot.cm+'</div><div style="font-size:9.5px;color:var(--text-muted,#9aa0a6)">MIN CARDIO</div></div>'+(CARDIO_MIN>0?'<div style="background:var(--surface-2,#1c1f24);border-radius:10px;padding:8px 4px;text-align:center"><div style="font-family:var(--font-mono);font-weight:800;font-size:15px;color:'+(tot.dc>=dias&&dias>0?'#4CAF7D':'inherit')+'">'+tot.dc+'/'+dias+'</div><div style="font-size:9.5px;color:var(--text-muted,#9aa0a6)">DÍAS CON '+CARDIO_MIN+'+ MIN</div></div>':'<div style="background:var(--surface-2,#1c1f24);border-radius:10px;padding:8px 4px;text-align:center"><div style="font-family:var(--font-mono);font-weight:800;font-size:15px">'+tot.fm+'</div><div style="font-size:9.5px;color:var(--text-muted,#9aa0a6)">MIN FUERZA</div></div>')+'<div style="background:var(--surface-2,#1c1f24);border-radius:10px;padding:8px 4px;text-align:center"><div style="font-family:var(--font-mono);font-weight:800;font-size:15px">'+r0(tot.k)+'</div><div style="font-size:9.5px;color:var(--text-muted,#9aa0a6)">KCAL GASTO ACTIVO</div></div></div>'+
   '<div style="display:grid;grid-template-columns:54px 1fr 1fr 1fr 1fr;gap:4px;font-size:10px;color:var(--text-muted,#9aa0a6);padding:6px 0;border-bottom:1px solid var(--border,#2a2f36);font-weight:700"><span>DÍA</span><span style="text-align:right">CARDIO MIN</span><span style="text-align:right">FUERZA MIN</span><span style="text-align:right">GASTO KCAL</span><span style="text-align:right">NETO KCAL</span></div>'+rows+
   '<div style="font-size:10.5px;color:var(--text-muted,#9aa0a6);margin-top:6px">Neto = alimentos − gasto activo del día. Tu meta calórica ya considera el cardio y el entrenamiento planificados.</div>';
 }

 function renderSemana(){
  if(!activo) return;
  var ref = document.getElementById('mealCard'); if(!ref) return;
  var el = document.getElementById('rgWeek');
  if(!el){ el = document.createElement('section'); el.id = 'rgWeek'; el.className = ref.className; el.style.marginTop = '12px'; var hc = document.getElementById('mealHistoryCard'); hc.parentNode.insertBefore(el, hc); }
  var hoyS = todayStr(), ini = addDays(lunesDe(hoyS), semOff*7), dias = []; for(var i=0;i<7;i++) dias.push(addDays(ini,i));
  var filas = dias.map(function(d,i){
   var arr = foodLog[d]||[], t = sumar(arr), w = (ventanaDe(d).macros||{}), ml = aguaLog[d]||0, fut = d>hoyS;
   return {d:d, lbl:DIAS3[i]+' '+d.slice(8), t:t, meta:w, ml:ml, reg:arr.length>0, fut:fut};
  });
  var reg = filas.filter(function(f){ return f.reg; }), n = reg.length;
  function prom(fn){ return n ? reg.reduce(function(s,f){ return s+fn(f); },0)/n : 0; }
  var pk = prom(function(f){return f.t.k;}), pp = prom(function(f){return f.t.p;}), pc = prom(function(f){return f.t.c;}), pf = prom(function(f){return f.t.f;});
  var mk = prom(function(f){return f.meta.kcal||0;}), mp = prom(function(f){return f.meta.proteinG||0;}), mc = prom(function(f){return f.meta.carbG||0;}), mf = prom(function(f){return f.meta.fatG||0;});
  var diasAgua = filas.filter(function(f){ return f.ml>=AGUA_META; }).length, pa = filas.filter(function(f){ return f.ml>0; }).length ? filas.reduce(function(s,f){ return s+f.ml; },0)/filas.filter(function(f){ return f.ml>0; }).length : 0;
  function col(p){ return (p>=90&&p<=105)?'#4CAF7D':(p>=75&&p<=115?'#E0C23D':'#E05B5B'); }
  /* gráfico */
  var W=340,H=130,bw=30,gap=(W-7*bw)/8,maxV=Math.max.apply(null, filas.map(function(f){ return Math.max(f.t.k, f.meta.kcal||0); }).concat([1000]))*1.12;
  var svg = '<svg viewBox="0 0 '+W+' '+(H+22)+'" width="100%" role="img" aria-label="Calorías por día contra la meta">';
  filas.forEach(function(f,i){
   var x = gap+i*(bw+gap), h = f.t.k/maxV*H, y = H-h, gy = H-(f.meta.kcal||0)/maxV*H, p = f.meta.kcal? f.t.k/f.meta.kcal*100 : 0;
   svg += '<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+h+'" rx="4" fill="'+(f.reg?col(p):'transparent')+'" opacity=".9"/>';
   svg += '<line x1="'+(x-3)+'" x2="'+(x+bw+3)+'" y1="'+gy+'" y2="'+gy+'" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 2" opacity="'+(f.fut?'.2':'.75')+'"/>';
   svg += '<text x="'+(x+bw/2)+'" y="'+(H+14)+'" text-anchor="middle" font-size="10" fill="'+(f.d===hoyS?'#FFE27A':'#9aa0a6')+'">'+DIAS3[i]+'</text>';
  });
  svg += '</svg>';
  var cab = '<div style="display:grid;grid-template-columns:54px 1fr 40px 40px 40px 44px;gap:4px;font-size:10px;color:var(--text-muted,#9aa0a6);padding:6px 0;border-bottom:1px solid var(--border,#2a2f36);font-weight:700"><span>DÍA</span><span style="text-align:right">KCAL</span><span style="text-align:right">P</span><span style="text-align:right">C</span><span style="text-align:right">G</span><span style="text-align:right">💧 L</span></div>';
  var rows = filas.map(function(f){
   var p = f.meta.kcal ? r0(f.t.k/f.meta.kcal*100) : 0;
   return '<div style="display:grid;grid-template-columns:54px 1fr 40px 40px 40px 44px;gap:4px;font-size:12px;padding:7px 0;border-bottom:1px solid var(--border,#2a2f36);opacity:'+(f.fut?'.4':'1')+';align-items:center"><span style="font-weight:700;color:'+(f.d===hoyS?'#FFE27A':'inherit')+'">'+f.lbl+'</span>'+
    (f.reg ? '<span style="text-align:right;font-family:var(--font-mono);font-weight:700;color:'+col(p)+'">'+r0(f.t.k)+' <small style="opacity:.8">'+p+'%</small></span><span style="text-align:right;font-family:var(--font-mono)">'+r0(f.t.p)+'</span><span style="text-align:right;font-family:var(--font-mono)">'+r0(f.t.c)+'</span><span style="text-align:right;font-family:var(--font-mono)">'+r0(f.t.f)+'</span>' : '<span style="grid-column:2/6;text-align:right;color:var(--text-muted,#9aa0a6)">'+(f.fut?'—':'sin registro')+'</span>')+
    '<span style="text-align:right;font-family:var(--font-mono);color:'+(f.ml>=AGUA_META?'#4CAF7D':(f.ml>0?'#7FD1FF':'var(--text-muted,#9aa0a6)'))+'">'+(f.ml>0?fmt(f.ml/1000):'—')+'</span></div>';
  }).join('');
  function pr(l, v, m, c){ var p = m? r0(v/m*100) : 0; return '<div style="background:var(--surface-2,#1c1f24);border-radius:10px;padding:8px 4px;text-align:center"><div style="font-family:var(--font-mono);font-weight:800;font-size:15px;color:'+c+'">'+r0(v)+'</div><div style="font-size:9.5px;color:var(--text-muted,#9aa0a6)">'+l+'</div><div style="font-size:10px;font-weight:700;color:'+col(p)+'">'+p+'% de '+r0(m)+'</div></div>'; }
  var h = '<div class="card-top"><div class="card-title"><span class="day-tag">Historial</span>Resumen semanal de macros</div></div>'+
   '<div style="display:flex;align-items:center;justify-content:space-between;margin:2px 0 8px"><button class="week-btn" id="swPrev" style="min-width:42px">◀</button><div style="font-family:var(--font-mono);font-weight:700;font-size:12px;text-align:center">'+(semOff===0?'ESTA SEMANA · ':'')+ini.slice(5)+' → '+dias[6].slice(5)+'</div><button class="week-btn" id="swNext" style="min-width:42px;'+(semOff>=0?'opacity:.35':'')+'">▶</button></div>'+
   (n? '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">'+pr('KCAL PROM.',pk,mk,COL.k)+pr('PROT PROM.',pp,mp,COL.p)+pr('CARB PROM.',pc,mc,COL.c)+pr('GRASA PROM.',pf,mf,COL.f)+'</div>' : '<div style="font-size:12.5px;color:var(--text-muted,#9aa0a6);padding:6px 0">Aún no hay registros en esta semana.</div>')+
   '<div style="font-size:11.5px;color:var(--text-muted,#9aa0a6);margin:10px 0 2px">Registro: <b style="color:var(--text,#e8eaed)">'+n+'/'+filas.filter(function(f){ return !f.fut; }).length+' días</b> · Agua: <b style="color:#7FD1FF">'+diasAgua+' día'+(diasAgua===1?'':'s')+' con meta</b> · promedio '+fmt(pa/1000)+' L/día</div>'+
   '<div style="margin:8px 0 4px">'+svg+'</div><div style="font-size:10px;color:var(--text-muted,#9aa0a6);margin-bottom:6px">Barras: calorías del día · línea punteada: tu meta · verde 90–105%, amarillo 75–115%, rojo fuera de rango</div>'+cab+rows+actSemana(filas, n, reg, pk);
  el.innerHTML = h;
  el.querySelector('#swPrev').onclick = function(){ semOff--; renderSemana(); };
  if(semOff<0) el.querySelector('#swNext').onclick = function(){ semOff++; renderSemana(); };
  aplicarTab();
 }

 /* ── Actividad: cardio y entrenamiento ── */
 var MET_FUERZA = 5.0;
 var METS = [["Caminata inclinada",6.0],["Caminata",4.0],["Trote suave",8.0],["Carrera",10.0],["Bicicleta suave",5.5],["Bicicleta moderada",7.0],["Elíptico",5.0],["Remo",7.0],["Escaladora",8.0],["Natación",6.0],["HIIT",9.0],["Otro cardio",5.0]];
 function metDe(nombre, tipo){
  var n = sa(nombre||'');
  if(tipo==='fuerza') return MET_FUERZA;
  if(/inclinad/.test(n)) return 6.0; if(/camin/.test(n)) return 4.0; if(/trote/.test(n)) return 8.0; if(/carrera|correr/.test(n)) return 10.0;
  if(/bici|ciclo/.test(n)) return /suave|liss/.test(n)||!/modera|hiit/.test(n) ? 5.5 : 7.0; if(/eliptic/.test(n)) return 5.0; if(/remo/.test(n)) return 7.0; if(/escalad|stair/.test(n)) return 8.0; if(/nata/.test(n)) return 6.0; if(/hiit|interval/.test(n)) return 9.0;
  return 5.0;
 }
 function pesoKg(){
  try{ var l = progressLog.filter(function(e){ return e && typeof e.weight==='number'; }).sort(function(a,b){ return a.date<b.date?1:-1; })[0]; if(l) return l.weight; }catch(e){}
  return 101;
 }
 function estimarKcal(met, min){ return r0(Math.max(0, met-1) * pesoKg() * (min/60)); }
 function planDe(date){
  try{
   var idx = (new Date(date+'T12:00:00').getDay()+6)%7, id = weeklyOrder && weeklyOrder[idx];
   var d = id && days.find(function(x){ return x.id===id; }); if(!d) return null;
   var cs = (d.sections||[]).find(function(s){ return /cardio/i.test(s.name); }), it = cs && cs.items && cs.items[0], min = 0;
   if(it){ var m = String(it.reps||'').match(/(\d+)(?:\s*(?:a|-)\s*(\d+))?\s*min/i); if(m) min = r0(m[2] ? (+m[1]+ +m[2])/2 : +m[1]); }
   var hecho = Object.keys(checks||{}).filter(function(k){ return checks[k] && k.indexOf(date+'-w')===0; }).length;
   var total = 0; (d.sections||[]).forEach(function(s){ if(/entrenamiento/i.test(s.name)) total += (s.items||[]).length; });
   return {dayName:(d.dayTag?d.dayTag+' · ':'')+d.name, cardio: it && min ? {nombre:it.name, min:min} : null, hecho:hecho, total:total};
  }catch(e){ return null; }
 }
 function totAct(date){
  var a = actLog[date]||[], t = {cardioMin:0, fuerzaMin:0, kcal:0};
  a.forEach(function(x){ if(x.t==='cardio') t.cardioMin += x.min||0; else t.fuerzaMin += x.min||0; t.kcal += x.kcal||0; });
  return t;
 }
 function guardarAct(){
  var keys = Object.keys(actLog).sort().slice(-90), out = {}; keys.forEach(function(k){ out[k] = actLog[k]; }); actLog = out;
  saveField('actividadLog', actLog);
  try{ renderSemana(); }catch(e){}
 }
 function agregarAct(date, o){
  var arr = actLog[date] = actLog[date] || [];
  arr.push(Object.assign({id:Date.now().toString(36)+Math.floor(Math.random()*99)}, o));
  guardarAct(); renderRegistro();
 }
 function resumenAct(date, tot){
  var a = totAct(date), ok = CARDIO_MIN>0 && a.cardioMin>=CARDIO_MIN;
  return '<div style="border-top:1px solid var(--border,#2a2f36);margin-top:8px;padding:9px 0 8px;font-size:12px;line-height:1.7"><span>🏃 Cardio: <b style="color:'+(ok?'#4CAF7D':'var(--text,#e8eaed)')+'">'+a.cardioMin+'</b>'+(CARDIO_MIN>0?' / '+CARDIO_MIN+'–'+CARDIO_MAX:'')+' min'+(ok?' ✓':'')+'</span> · <span>🔥 Gasto activo: <b>'+r0(a.kcal)+'</b> kcal</span><br><span style="color:var(--text-muted,#9aa0a6)">Neto (alimentos − actividad): <b style="color:var(--text,#e8eaed)">'+r0(tot.k-a.kcal)+'</b> kcal</span></div>';
 }
 function actividadHtml(date){
  var arr = actLog[date]||[], a = totAct(date), p = planDe(date), cm = CARDIO_MIN>0 ? Math.min(100, a.cardioMin/CARDIO_MIN*100) : (a.cardioMin>0?100:0);
  var h = '<div style="margin-top:20px;padding:12px;background:var(--surface-2,#1c1f24);border-radius:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:17px;font-weight:800;color:#FF9F5B">🔥 ACTIVIDAD Y GASTO</div><div style="font-family:var(--font-mono);font-weight:800;font-size:15px">'+r0(a.kcal)+' kcal</div></div>';
  if(p){
   h += '<div style="font-size:12px;margin:8px 0 6px;color:var(--text-muted,#9aa0a6)">Rutina de hoy: <b style="color:var(--text,#e8eaed)">'+esc(p.dayName)+'</b>'+(p.total? ' · '+p.hecho+'/'+p.total+' ejercicios marcados'+(p.hecho>=p.total&&p.total>0?' ✓':'') : '')+'</div>';
  }
  h += '<div style="height:8px;border-radius:8px;background:var(--surface,#14171B);overflow:hidden;margin:6px 0 3px"><div style="height:100%;width:'+cm+'%;background:'+(CARDIO_MIN>0&&a.cardioMin>=CARDIO_MIN?'#4CAF7D':'#FF9F5B')+'"></div></div><div style="font-size:11.5px;color:var(--text-muted,#9aa0a6);margin-bottom:8px">Cardio '+a.cardioMin+' min'+(CARDIO_MIN>0?' · meta diaria '+CARDIO_MIN+'–'+CARDIO_MAX+' min':'')+(p&&p.cardio?' · plan de hoy: '+p.cardio.min+' min':'')+'</div>';
  arr.forEach(function(x){
   h += '<div class="row" style="align-items:center"><div class="ex-info"><div class="ex-name">'+(x.t==='cardio'?'🏃 ':'🏋️ ')+esc(x.n)+'</div><div class="ex-tip">'+x.min+' min · '+r0(x.kcal)+' kcal'+(x.fc?' · FC '+x.fc+' lpm':'')+(x.est?' · estimado':'')+'</div></div><button data-act-del="'+x.id+'" aria-label="Eliminar" style="background:none;border:0;color:#E05B5B;font-size:20px;padding:6px 10px;cursor:pointer">×</button></div>';
  });
  h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'+(p&&p.cardio?'<button class="week-btn" data-act-plan="cardio" style="color:#FF9F5B;font-weight:700">✓ Cardio del plan · '+p.cardio.min+' min</button>':'')+(p&&p.total?'<button class="week-btn" data-act-plan="fuerza" style="color:#FF9F5B;font-weight:700">✓ Fuerza · 60 min</button>':'')+'<button class="week-btn" data-act-add="cardio">+ Cardio</button><button class="week-btn" data-act-add="fuerza">+ Entrenamiento</button></div>';
  h += '<div style="font-size:10.5px;color:var(--text-muted,#9aa0a6);margin-top:8px">Las calorías son una estimación (MET × tu peso ('+fmt(pesoKg())+' kg) × tiempo, solo gasto adicional al reposo). Si tu máquina o reloj marca otro valor, edítalo al agregar.</div></div>';
  return h;
 }
 function abrirActividad(date, tipo){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center';
  var inp = 'width:100%;box-sizing:border-box;background:var(--surface-2,#1c1f24);color:var(--text,#e8eaed);border:1px solid var(--border,#2a2f36);border-radius:10px;padding:11px;font-size:15px';
  var esC = tipo==='cardio', p = planDe(date);
  var opts = esC ? METS.map(function(m){ return '<option value="'+m[0]+'">'+m[0]+'</option>'; }).join('') : '';
  ov.innerHTML = '<div style="width:100%;max-width:520px;max-height:90vh;overflow:auto;background:var(--surface,#14171B);border:1px solid var(--border,#2a2f36);border-radius:18px 18px 0 0;padding:16px 16px 22px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-weight:700">'+(esC?'🏃 Agregar cardio':'🏋️ Agregar entrenamiento')+'</div><button id="aX" style="background:none;border:0;color:var(--text-muted,#9aa0a6);font-size:24px;cursor:pointer">×</button></div>'+
   (esC ? '<label style="font-size:11px;font-weight:600;color:var(--text-muted,#9aa0a6)">TIPO DE CARDIO</label><select id="aN" style="'+inp+';margin:4px 0 10px">'+opts+'</select>' : '<label style="font-size:11px;font-weight:600;color:var(--text-muted,#9aa0a6)">ENTRENAMIENTO</label><input id="aN" style="'+inp+';margin:4px 0 10px" value="'+esc(p?p.dayName:'Entrenamiento de fuerza')+'">')+
   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label style="font-size:11px;font-weight:600;color:var(--text-muted,#9aa0a6)">DURACIÓN (MIN)</label><input id="aM" inputmode="numeric" value="'+(esC&&p&&p.cardio?p.cardio.min:(esC?35:60))+'" style="'+inp+';margin-top:4px;font-family:var(--font-mono);font-weight:700"></div><div><label style="font-size:11px;font-weight:600;color:var(--text-muted,#9aa0a6)">KCAL GASTADAS</label><input id="aK" inputmode="numeric" style="'+inp+';margin-top:4px;font-family:var(--font-mono);font-weight:700"></div></div>'+
   '<div style="display:flex;gap:6px;margin:8px 0;flex-wrap:wrap">'+[20,30,35,40,45,60,75].map(function(v){ return '<button class="week-btn" data-m="'+v+'">'+v+'</button>'; }).join('')+'</div>'+
   '<label style="font-size:11px;font-weight:600;color:var(--text-muted,#9aa0a6)">FC PROMEDIO (OPCIONAL)</label><input id="aF" inputmode="numeric" placeholder="lpm" style="'+inp+';margin:4px 0 10px"><div id="aHint" style="font-size:11px;color:var(--text-muted,#9aa0a6);margin-bottom:10px"></div><button id="aOk" class="sv" style="width:100%">Agregar</button></div>';
  document.body.appendChild(ov);
  var N = ov.querySelector('#aN'), M = ov.querySelector('#aM'), K = ov.querySelector('#aK'), tocado = false;
  function cerrar(){ ov.remove(); }
  ov.addEventListener('click', function(e){ if(e.target===ov) cerrar(); }); ov.querySelector('#aX').onclick = cerrar;
  if(esC && p && p.cardio){ var g = sa(p.cardio.nombre); Array.prototype.forEach.call(N.options, function(o){ if(sa(o.value)===sa(metNombre(p.cardio.nombre))) N.value = o.value; }); }
  function metNombre(n){ var m = metDe(n,'cardio'), f = METS.find(function(x){ return x[1]===m; }); return f ? f[0] : 'Otro cardio'; }
  function recalc(){ var mt = esC ? (METS.find(function(x){ return x[0]===N.value; })||[0,5])[1] : MET_FUERZA; if(!tocado) K.value = estimarKcal(mt, num(M.value)); ov.querySelector('#aHint').textContent = 'Estimación con MET '+mt+' y '+fmt(pesoKg())+' kg. Puedes cambiar las kcal si tienes el dato real.'; }
  N.onchange = recalc; M.oninput = recalc; K.oninput = function(){ tocado = true; };
  Array.prototype.forEach.call(ov.querySelectorAll('[data-m]'), function(b){ b.onclick = function(){ M.value = b.dataset.m; recalc(); }; });
  recalc();
  ov.querySelector('#aOk').onclick = function(){
   var min = r0(num(M.value)), kc = r0(num(K.value)); if(!(min>0)){ toast2('Ingresa la duración en minutos'); return; }
   var o = {t:esC?'cardio':'fuerza', n:N.value.trim()||(esC?'Cardio':'Entrenamiento'), min:min, kcal:kc, est:!tocado}; var fc = r0(num(ov.querySelector('#aF').value)); if(fc>0) o.fc = fc;
   cerrar(); agregarAct(date, o);
  };
 }


 /* ── Enganche con la app (solo si el panel activó el modo registro) ── */
 var activo = false, origCard = window.renderMealCard, origHist = window.renderMealHistory;
 function activar(){
  if(activo) return; activo = true;
  window.renderMealCard = function(){ renderRegistro(); };
  window.renderMealHistory = function(){ renderHistorial(); renderSemana(); };
  try{ if(typeof COLA!=='undefined' && COLA.indexOf('foodLog')<0) COLA.push('foodLog','foodsPropios','aguaLog','actividadLog'); }catch(e){}
 }
 function desactivar(){
  if(!activo) return; activo = false;
  window.renderMealCard = origCard; window.renderMealHistory = origHist;
  ['rgTabs','rgWeek'].forEach(function(id){ var e = document.getElementById(id); if(e) e.remove(); });
  Array.prototype.forEach.call(document.querySelectorAll('.rg-oculto'), function(e){ e.classList.remove('rg-oculto'); });
  cerrarHoja();
  try{ renderMacroCard(); renderMealWindowRow(); origCard(); origHist(); }catch(e){}
 }
 var primera = true;
 athleteRef.onSnapshot(function(doc){
  if(!doc.exists) return;
  var d = doc.data(), pl = d.plan || {}, def = (typeof DEFAULT_PLAN!=='undefined') ? DEFAULT_PLAN : {};
  var modo = pl.nutModo || def.nutModo || 'menu';
  if(modo!=='registro'){ desactivar(); return; }
  activar();
  var mr = pl.metasRegistro || def.metasRegistro || {};
  AGUA_META = mr.agua>0 ? mr.agua : 3000; CARDIO_MIN = mr.cardioMin>0 ? mr.cardioMin : 0; CARDIO_MAX = mr.cardioMax>0 ? mr.cardioMax : 0;
  TRAIN = (mr.diasEntreno && mr.diasEntreno.length) ? mr.diasEntreno : [1,2,3,4,5,6,0];
  customFoods = {}; Object.keys(pl.foodsCustom||{}).forEach(function(k){ customFoods[String(k).toLowerCase()] = pl.foodsCustom[k]; });
  foodLog = d.foodLog || {}; propios = d.foodsPropios || {}; aguaLog = d.aguaLog || {}; actLog = d.actividadLog || {};
  if(primera){ primera = false; var w = ventanaDe(vd()); if(w) activeMealWindow = w.id; }
  if(!sheetEl){ try{ renderMacroCard(); renderMealWindowRow(); renderRegistro(); renderHistorial(); renderSemana(); }catch(e){} }
 });
 window.ppcRegistroMacros = {render: renderRegistro, get log(){ return foodLog; }, get agua(){ return aguaLog; }, get act(){ return actLog; }};
})();
