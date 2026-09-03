const state={
 clients: JSON.parse(localStorage.getItem("we_clients")||"[]"),
 tickets: JSON.parse(localStorage.getItem("we_tickets")||"[]"),
 equipment: JSON.parse(localStorage.getItem("we_equipment")||"[]"),
 shipments: JSON.parse(localStorage.getItem("we_shipments")||"[]"),
 available: JSON.parse(localStorage.getItem("we_available")||"[]"),
 blocked: JSON.parse(localStorage.getItem("we_blocked")||"[]"),
 month:new Date()
};
const save=()=>["clients","tickets","equipment","shipments","available","blocked"].forEach(k=>localStorage.setItem("we_"+k,JSON.stringify(state[k])));
const $=s=>document.querySelector(s);
const modal=(title,html)=>{$("#modal-content").innerHTML=`<h2>${title}</h2>${html}`;$("#modal").classList.remove("hidden")};
const close=()=>$("#modal").classList.add("hidden");
$("#modal-close").onclick=close;
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>show(b.dataset.view));
document.querySelectorAll("[data-view-link]").forEach(b=>b.onclick=()=>show(b.dataset.viewLink));
function show(v){document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===v));document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===v));$("#page-title").textContent={dashboard:"Resumen",clientes:"Clientes",tracking:"Tickets / Tracking",calendario:"Calendario",inventario:"Inventario"}[v];render()}
document.addEventListener("click",e=>{const a=e.target.closest("[data-action]");if(!a)return;const t=a.dataset.action;
 if(t==="new-client") modal("Agregar cliente",`<form class="form" id="client-form"><label>RUC<input name="ruc" required></label><label>Razón social<input name="razon" required></label><label>Contacto<input name="contacto"></label><label>Serie / series<input name="series" placeholder="Separar por comas"></label><button>Guardar cliente</button></form>`);
 if(t==="new-ticket") modal("Nuevo ticket / tracking",`<form class="form" id="ticket-form"><label>Cliente<input name="cliente" required></label><label>RUC<input name="ruc"></label><label>Serie<input name="serie"></label><label>Código de tracking<input name="tracking" required></label><label>Archivo PDF / imagen<input name="file" type="file" accept=".pdf,image/*"></label><label>Estado<select name="estado"><option>Preparando</option><option>En tránsito</option><option>Entregado</option><option>Incidencia</option></select></label><button>Guardar ticket</button></form>`);
 if(t==="new-equipment") modal("Agregar equipo",`<form class="form" id="equipment-form"><label>Serie<input name="serie" required></label><label>Modelo<input name="modelo" required></label><label>Cliente<input name="cliente"></label><label>Ubicación<input name="ubicacion"></label><label>Estado<select name="estado"><option>Disponible</option><option>Reservado</option><option>En tránsito</option><option>Entregado</option><option>Mantenimiento</option></select></label><button>Guardar equipo</button></form>`);
 if(t==="new-shipment") modal("Programar envío",`<form class="form" id="shipment-form"><label>Fecha<input name="fecha" type="date" required></label><label>Cliente<input name="cliente" required></label><label>Serie<input name="serie"></label><label>Destino<input name="destino" required></label><label>Transportista<input name="transportista"></label><button>Programar envío</button></form>`);
});
document.addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.target);
 if(e.target.id==="client-form"){state.clients.push({ruc:f.get("ruc"),razon:f.get("razon"),contacto:f.get("contacto"),series:f.get("series")});}
 if(e.target.id==="ticket-form"){state.tickets.push({id:Date.now(),cliente:f.get("cliente"),ruc:f.get("ruc"),serie:f.get("serie"),tracking:f.get("tracking"),archivo:f.get("file")?.name||"",estado:f.get("estado")});}
 if(e.target.id==="equipment-form"){state.equipment.push(Object.fromEntries(f));}
 if(e.target.id==="shipment-form"){state.shipments.push({id:Date.now(),...Object.fromEntries(f)});}
 save();close();render();
});
$("#tracking-search").addEventListener("input",renderTickets);
$("#prev-month").onclick=()=>{state.month.setMonth(state.month.getMonth()-1);renderCalendar()};
$("#next-month").onclick=()=>{state.month.setMonth(state.month.getMonth()+1);renderCalendar()};
function render(){renderClients();renderTickets();renderInventory();renderCalendar();renderDashboard()}
function renderClients(){$("#clients-table").innerHTML=state.clients.map(c=>`<tr><td>${c.ruc}</td><td><b>${c.razon}</b></td><td>${c.contacto||"—"}</td><td>${c.series||"—"}</td><td><button class="ghost">Ver</button></td></tr>`).join("")||`<tr><td colspan="5" class="empty">Aún no hay clientes.</td></tr>`}
function renderTickets(){const q=($("#tracking-search")?.value||"").toLowerCase();$("#tickets-grid").innerHTML=state.tickets.filter(t=>Object.values(t).join(" ").toLowerCase().includes(q)).map(t=>`<article class="ticket"><span class="badge">${t.estado}</span><h3>${t.cliente}</h3><p>RUC: ${t.ruc||"—"}</p><p>Serie: ${t.serie||"—"}</p><p>Tracking: <b>${t.tracking}</b></p><p>Archivo: ${t.archivo||"Sin archivo"}</p></article>`).join("")||`<div class="panel empty">No hay tickets registrados.</div>`}
function renderInventory(){$("#inventory-table").innerHTML=state.equipment.map(e=>`<tr><td><b>${e.serie}</b></td><td>${e.modelo}</td><td>${e.cliente||"—"}</td><td><span class="badge">${e.estado}</span></td><td>${e.ubicacion||"—"}</td></tr>`).join("")||`<tr><td colspan="5" class="empty">No hay equipos registrados.</td></tr>`}
function renderDashboard(){$("#stat-active").textContent=state.shipments.length;$("#stat-delivered").textContent=state.tickets.filter(t=>t.estado==="Entregado").length;$("#stat-stock").textContent=state.equipment.filter(e=>e.estado==="Disponible").length;$("#stat-tickets").textContent=state.tickets.filter(t=>t.estado!=="Entregado").length;const x=state.shipments.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha)).slice(0,5);$("#upcoming-list").innerHTML=x.map(s=>`<div class="ticket" style="margin:8px 0"><b>${s.fecha}</b> · ${s.cliente} · ${s.destino}</div>`).join("")||`<div class="empty">No hay envíos programados.</div>`}
function renderCalendar(){const y=state.month.getFullYear(),m=state.month.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0);$("#month-label").textContent=new Intl.DateTimeFormat("es-PE",{month:"long",year:"numeric"}).format(first);const names=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];let h=names.map(n=>`<div class="day-name">${n}</div>`).join("");let offset=(first.getDay()+6)%7;for(let i=0;i<offset;i++)h+=`<div class="day muted"></div>`;for(let d=1;d<=last.getDate();d++){const key=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,ship=state.shipments.find(s=>s.fecha===key),cl=ship?"shipment":state.blocked.includes(key)?"blocked":state.available.includes(key)?"available":"";h+=`<div class="day ${cl}" data-date="${key}"><div class="num">${d}</div>${ship?`<div class="event">🚚 ${ship.cliente}</div>`:""}${cl==="available"?`<div class="event">Disponible</div>`:""}${cl==="blocked"?`<div class="event">No disponible</div>`:""}</div>`}$("#calendar-grid").innerHTML=h}
document.addEventListener("click",e=>{const day=e.target.closest(".day[data-date]");if(!day)return;const date=day.dataset.date;if(state.blocked.includes(date))state.blocked=state.blocked.filter(x=>x!==date);else if(state.available.includes(date))state.available=state.available.filter(x=>x!==date);else state.available.push(date);save();renderCalendar()});
render();
