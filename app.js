import {initializeApp} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {getFirestore,collection,addDoc,deleteDoc,doc,onSnapshot,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL,deleteObject} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";

const firebaseConfig={apiKey:"AIzaSyAO5gy-53kCBWV-vxNQlrRvzIR-p-IIycg",authDomain:"ous-workera.firebaseapp.com",projectId:"ous-workera",storageBucket:"ous-workera.firebasestorage.app",messagingSenderId:"779373746855",appId:"1:779373746855:web:98ed38d9abb7ed45839982",measurementId:"G-MPK93DMFEC"};
const firebaseApp=initializeApp(firebaseConfig),db=getFirestore(firebaseApp),storage=getStorage(firebaseApp);
const clientsRef=collection(db,"envioClientes"),shipmentsRef=collection(db,"envioRegistros");

const state={
  clients:JSON.parse(localStorage.getItem("we_clients")||"[]"),
  shipments:JSON.parse(localStorage.getItem("we_shipments")||"[]"),
  month:new Date()
};
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const normalize=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const save=()=>{localStorage.setItem("we_clients",JSON.stringify(state.clients));localStorage.setItem("we_shipments",JSON.stringify(state.shipments));};
const modal=(title,html,wide=false)=>{$("#modal-content").innerHTML=`<h2>${esc(title)}</h2>${html}`;$("#modal .modal-card").classList.toggle("wide",wide);$("#modal").classList.remove("hidden")};
const close=()=>$("#modal").classList.add("hidden");
const clientById=id=>state.clients.find(c=>String(c.id)===String(id));
const clientShipments=id=>state.shipments.filter(s=>String(s.clientId)===String(id)).sort((a,b)=>b.fecha.localeCompare(a.fecha));
const today=()=>new Date().toISOString().slice(0,10);
const whatsappNumber=value=>{let n=String(value||"").replace(/\D/g,"");if(n.length===9)n="51"+n;return n;};
const whatsappIcon='<svg class="whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2a9.84 9.84 0 0 0-8.42 14.93L2 22l5.2-1.58A9.9 9.9 0 1 0 12.04 2Zm0 17.98a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.08.94.98-3-.2-.31a8.08 8.08 0 1 1 6.73 3.68Zm4.43-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21a7.35 7.35 0 0 1-1.36-1.69c-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.43-.06-.12-.55-1.31-.75-1.8-.2-.47-.4-.41-.55-.42h-.46c-.16 0-.42.06-.65.3-.22.24-.85.83-.85 2.02 0 1.19.87 2.34.99 2.5.12.16 1.7 2.6 4.13 3.65.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z"/></svg>';
const setCloudStatus=(text,error=false)=>{const el=$("#cloud-status");if(el){el.classList.toggle("error",error);el.innerHTML=`<span class="status-dot"></span> ${esc(text)}`;}};
const firebaseError=error=>{console.error(error);setCloudStatus("Sin conexión",true);alert(error?.code?.includes("permission-denied")||error?.code?.includes("unauthorized")?"Firebase rechazó la operación. Revisa las reglas de Firestore y Storage.":`No se pudo guardar en Firebase: ${error.message||error}`);};

onSnapshot(clientsRef,snapshot=>{state.clients=snapshot.docs.map(d=>({id:d.id,...d.data()}));save();render();setCloudStatus("Sincronizado");},firebaseError);
onSnapshot(shipmentsRef,snapshot=>{state.shipments=snapshot.docs.map(d=>({id:d.id,...d.data()}));save();render();setCloudStatus("Sincronizado");},firebaseError);

$("#modal-close").onclick=close;
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>show(b.dataset.view));
document.querySelectorAll("[data-view-link]").forEach(b=>b.onclick=()=>show(b.dataset.viewLink));
function show(v){document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===v));document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===v));$("#page-title").textContent={dashboard:"Resumen",clientes:"Clientes y envíos",calendario:"Calendario"}[v];render();}

document.addEventListener("click",e=>{
  const a=e.target.closest("[data-action]");if(!a)return;
  if(a.dataset.action==="new-client") modal("Agregar cliente",`<form class="form" id="client-form"><label>RUC<input name="ruc" inputmode="numeric" maxlength="11" required placeholder="11 dígitos"></label><label>Razón social<input name="razon" required></label><label>Contacto / teléfono<input name="contacto" required></label><p class="form-help">Las series, tracking y PDF se agregan después, dentro de la ficha del cliente.</p><button>Guardar y abrir cliente</button></form>`);
  if(a.dataset.action==="open-client") openClient(a.dataset.id);
  if(a.dataset.action==="new-shipment") openShipmentForm(a.dataset.id);
  if(a.dataset.action==="open-file") openFile(a.dataset.id);
  if(a.dataset.action==="whatsapp") openWhatsApp(a.dataset.id);
  if(a.dataset.action==="delete-shipment"&&confirm("¿Eliminar este envío y su archivo adjunto?"))deleteShipment(a.dataset.id,a.dataset.client);
});

document.addEventListener("submit",async e=>{
  e.preventDefault();const f=new FormData(e.target);
  if(e.target.id==="client-form"){
    const ruc=String(f.get("ruc")).trim();
    if(!/^\d{11}$/.test(ruc))return alert("El RUC debe tener 11 dígitos.");
    if(state.clients.some(c=>c.ruc===ruc))return alert("Ya existe un cliente con este RUC.");
    try{setCloudStatus("Guardando...");const result=await addDoc(clientsRef,{ruc,razon:String(f.get("razon")).trim(),contacto:String(f.get("contacto")).trim(),creadoEn:serverTimestamp()});close();setTimeout(()=>openClient(result.id),250);}catch(error){firebaseError(error);}
  }
  if(e.target.id==="shipment-form"){
    const file=f.get("file");let documento=null;
    if(file&&file.size){
      const allowed=["application/pdf","image/jpeg","image/png","image/webp"];
      if(!allowed.includes(file.type))return alert("Adjunta un PDF o una imagen JPG, PNG o WEBP.");
      if(file.size>4*1024*1024)return alert("El archivo no debe superar 4 MB en esta versión.");
      try{setCloudStatus("Subiendo archivo...");const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");const path=`envios/${f.get("clientId")}/${Date.now()}-${safeName}`,fileRef=ref(storage,path);await uploadBytes(fileRef,file,{contentType:file.type});documento={nombre:file.name,tipo:file.type,url:await getDownloadURL(fileRef),path};}catch(error){firebaseError(error);return;}
    }
    try{setCloudStatus("Guardando...");await addDoc(shipmentsRef,{clientId:String(f.get("clientId")),fecha:f.get("fecha"),serie:String(f.get("serie")||"").trim(),tracking:String(f.get("tracking")||"").trim(),nota:String(f.get("nota")||"").trim(),documento,creadoEn:serverTimestamp()});openClient(f.get("clientId"));}catch(error){if(documento?.path)deleteObject(ref(storage,documento.path)).catch(()=>{});firebaseError(error);}
  }
});

function fileToDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
function openFile(id){const s=state.shipments.find(x=>String(x.id)===String(id)),url=s?.documento?.url||s?.documento?.datos;if(!url)return alert("Este envío no tiene un archivo adjunto.");const w=window.open();if(!w)return alert("Permite las ventanas emergentes para abrir el archivo.");w.location.href=url;}
async function deleteShipment(id,clientId){try{const s=state.shipments.find(x=>String(x.id)===String(id));setCloudStatus("Eliminando...");if(s?.documento?.path)await deleteObject(ref(storage,s.documento.path)).catch(error=>{if(error.code!=="storage/object-not-found")throw error;});await deleteDoc(doc(db,"envioRegistros",String(id)));openClient(clientId);}catch(error){firebaseError(error);}}
function openWhatsApp(clientId){const c=clientById(clientId),number=whatsappNumber(c?.contacto);if(number.length<9)return alert("El contacto de este cliente no contiene un número de WhatsApp válido.");const message=encodeURIComponent(`Hola, ${c.razon}. Le escribimos de Workera respecto a su envío.`);window.open(`https://wa.me/${number}?text=${message}`,"_blank","noopener");}
function openShipmentForm(clientId){const c=clientById(clientId);if(!c)return;modal(`Nuevo envío · ${c.razon}`,`<form class="form" id="shipment-form"><input type="hidden" name="clientId" value="${c.id}"><div class="client-summary"><b>${esc(c.razon)}</b><span>RUC ${esc(c.ruc)} · ${esc(c.contacto)}</span></div><label>Fecha en que se envió<input name="fecha" type="date" value="${today()}" required></label><label>Serie del equipo<input name="serie" placeholder="Ej. ZK-2026-001"></label><label>Tracking / guía<input name="tracking" placeholder="Código de seguimiento"></label><label>Adjuntar imagen o PDF<input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp"><small>Formatos: PDF, JPG, PNG o WEBP. Máximo 4 MB.</small></label><label>Observación<textarea name="nota" rows="3" placeholder="Opcional"></textarea></label><button>Guardar envío</button></form>`);}
function openClient(id){const c=clientById(id);if(!c)return;const list=clientShipments(id);modal(c.razon,`<div class="client-header"><div><span class="label">RUC</span><b>${esc(c.ruc)}</b></div><div><span class="label">CONTACTO</span><b>${esc(c.contacto)}</b></div><div class="client-actions"><button class="whatsapp-btn" data-action="whatsapp" data-id="${c.id}">${whatsappIcon} WhatsApp</button><button class="primary dark" data-action="new-shipment" data-id="${c.id}">+ Agregar envío</button></div></div><h3 class="subheading">Historial de envíos</h3><div class="shipment-list">${list.map(s=>shipmentRow(s,c,true)).join("")||'<div class="empty">Todavía no hay series, tracking ni PDF para este cliente.</div>'}</div>`,true);}
function shipmentRow(s,c,actions=false){const isImage=s.documento?.tipo?.startsWith("image/");return `<article class="shipment-row"><div class="shipment-date"><b>${formatDate(s.fecha)}</b><span>${esc(s.serie)||"Sin serie"}</span></div><div><span class="label">TRACKING</span><b>${esc(s.tracking)||"Sin tracking"}</b><small>${esc(s.nota)||""}</small></div><div><span class="label">ARCHIVO</span>${s.documento?`<button class="link-btn" data-action="open-file" data-id="${s.id}">${isImage?"🖼️":"📄"} ${esc(s.documento.nombre)}</button>`:"<span>Sin archivo</span>"}</div>${actions?`<button class="danger-link" data-action="delete-shipment" data-id="${s.id}" data-client="${c.id}">Eliminar</button>`:""}</article>`;}

$("#client-search").addEventListener("input",renderClients);
$("#calendar-search").addEventListener("input",renderCalendar);
$("#prev-month").onclick=()=>{state.month=new Date(state.month.getFullYear(),state.month.getMonth()-1,1);renderCalendar();};
$("#next-month").onclick=()=>{state.month=new Date(state.month.getFullYear(),state.month.getMonth()+1,1);renderCalendar();};
$("#today").onclick=()=>{state.month=new Date();renderCalendar();};

function render(){renderClients();renderCalendar();renderDashboard();}
function renderClients(){const q=normalize($("#client-search")?.value);const rows=state.clients.filter(c=>normalize(`${c.ruc} ${c.razon} ${c.contacto}`).includes(q)).map(c=>{const ss=clientShipments(c.id);return `<tr><td data-label="RUC">${esc(c.ruc)}</td><td data-label="Razón social"><b>${esc(c.razon)}</b></td><td data-label="Contacto">${esc(c.contacto)}</td><td data-label="Envíos"><span class="count">${ss.length}</span></td><td data-label="Último envío">${ss[0]?formatDate(ss[0].fecha):"—"}</td><td class="row-actions"><button class="whatsapp-mini" title="Abrir WhatsApp" aria-label="Abrir WhatsApp de ${esc(c.razon)}" data-action="whatsapp" data-id="${c.id}">${whatsappIcon}</button><button class="ghost action" data-action="open-client" data-id="${c.id}">Abrir ficha →</button></td></tr>`;}).join("");$("#clients-table").innerHTML=rows||'<tr><td colspan="6" class="empty">No se encontraron clientes.</td></tr>';}
function renderDashboard(){const now=new Date(),prefix=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;$("#stat-clients").textContent=state.clients.length;$("#stat-shipments").textContent=state.shipments.length;$("#stat-month").textContent=state.shipments.filter(s=>s.fecha.startsWith(prefix)).length;$("#stat-pdf").textContent=state.shipments.filter(s=>s.documento).length;const latest=state.shipments.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,5);$("#recent-list").innerHTML=latest.map(s=>{const c=clientById(s.clientId)||{};return shipmentRow(s,c);}).join("")||'<div class="empty">No hay envíos registrados.</div>';}
function matchesShipment(s,q){const c=clientById(s.clientId)||{};return normalize(`${c.ruc} ${c.razon} ${c.contacto} ${s.serie} ${s.tracking} ${s.nota}`).includes(q);}
function renderCalendar(){const y=state.month.getFullYear(),m=state.month.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),q=normalize($("#calendar-search")?.value);$("#month-label").textContent=new Intl.DateTimeFormat("es-PE",{month:"long",year:"numeric"}).format(first);let h=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(n=>`<div class="day-name">${n}</div>`).join("");for(let i=0;i<(first.getDay()+6)%7;i++)h+='<div class="day muted"></div>';for(let d=1;d<=last.getDate();d++){const key=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,items=state.shipments.filter(s=>s.fecha===key&&matchesShipment(s,q));h+=`<div class="day ${items.length?"has-shipment":""}"><div class="num">${d}</div>${items.slice(0,3).map(s=>{const c=clientById(s.clientId)||{};return `<button class="event" data-action="open-client" data-id="${c.id}">${esc(c.razon||"Cliente")}${s.serie?` · ${esc(s.serie)}`:""}</button>`;}).join("")}${items.length>3?`<div class="more">+${items.length-3} más</div>`:""}</div>`;}$("#calendar-grid").innerHTML=h;const prefix=`${y}-${String(m+1).padStart(2,"0")}`,monthItems=state.shipments.filter(s=>s.fecha.startsWith(prefix)&&matchesShipment(s,q)).sort((a,b)=>a.fecha.localeCompare(b.fecha));$("#month-shipments").innerHTML=monthItems.map(s=>{const c=clientById(s.clientId)||{};return shipmentRow(s,c);}).join("")||'<div class="empty">No hay envíos que coincidan en este mes.</div>';}
function formatDate(v){if(!v)return"—";return new Intl.DateTimeFormat("es-PE",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(`${v}T00:00:00Z`));}
render();
