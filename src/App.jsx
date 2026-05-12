import { useState, useMemo, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════ */
const T = {
  light: {
    pageBg:"#f0f3fa", sidebar:"#ffffff", sidebarBorder:"rgba(0,0,0,0.07)",
    cardBg:"#ffffff", surface:"#f4f6fd", surfaceHover:"#eaedfa",
    border:"rgba(0,0,0,0.08)", borderMed:"rgba(0,0,0,0.14)",
    text:"#0d1020", textSub:"#3a4260", textMuted:"#6070a0",
    accent:"#00b87a", accentBg:"rgba(0,184,122,0.09)", accentGlow:"0 0 16px rgba(0,184,122,0.22)",
    danger:"#e03060", dangerBg:"rgba(224,48,96,0.08)",
    warn:"#c97800",   warnBg:"rgba(201,120,0,0.08)",
    orange:"#d96000", orangeBg:"rgba(217,96,0,0.08)",
    gray:"#6b7490",   grayBg:"rgba(107,116,144,0.09)",
    blue:"#2e5ce6",   blueBg:"rgba(46,92,230,0.08)",
    shadow:"0 2px 10px rgba(0,0,0,0.07)", shadowCard:"0 4px 24px rgba(0,0,0,0.09)",
    inputBg:"#f4f6fd", overlay:"rgba(13,16,32,0.45)", scrollThumb:"#c8cde0",
    navBg:"rgba(255,255,255,0.97)", headerBg:"rgba(240,243,250,0.97)",
  },
  dark: {
    pageBg:"#0c0e16", sidebar:"#10131e", sidebarBorder:"rgba(255,255,255,0.07)",
    cardBg:"#161924", surface:"#1e2235", surfaceHover:"#252a42",
    border:"rgba(255,255,255,0.09)", borderMed:"rgba(255,255,255,0.16)",
    text:"#e8eaf6", textSub:"#9aa3c8", textMuted:"#7a85ab",
    accent:"#00e5a0", accentBg:"rgba(0,229,160,0.1)", accentGlow:"0 0 20px rgba(0,229,160,0.22)",
    danger:"#ff5a7e", dangerBg:"rgba(255,90,126,0.1)",
    warn:"#ffb84d",   warnBg:"rgba(255,184,77,0.1)",
    orange:"#ff8c42", orangeBg:"rgba(255,140,66,0.1)",
    gray:"#8890b0",   grayBg:"rgba(136,144,176,0.1)",
    blue:"#6b9fff",   blueBg:"rgba(107,159,255,0.1)",
    shadow:"0 2px 12px rgba(0,0,0,0.5)", shadowCard:"0 4px 28px rgba(0,0,0,0.55)",
    inputBg:"#1e2235", overlay:"rgba(0,0,0,0.75)", scrollThumb:"#2a3050",
    navBg:"rgba(16,19,30,0.97)", headerBg:"rgba(12,14,22,0.97)",
  },
};

const DEVICES = {
  phone:   { W:390,  H:844,  label:"Móvil" },
  tablet:  { W:810,  H:640,  label:"Tablet" },
  desktop: { W:null, H:null, label:"Escritorio" },
};

const ESTADOS     = ["Sin iniciar","En curso","Pausada","Realizada","Cancelada"];
const PRIORIDADES = ["Alta","Media","Baja"];
const PROY_DEF    = ["Marketing","Tecnología","Operaciones","Recursos Humanos","Finanzas"];
const API         = "http://localhost:5238/tareas";

const ESTADO_CFG = (t) => ({
  "Sin iniciar": { dot:t.gray,   bg:t.grayBg,   color:t.gray   },
  "En curso":    { dot:t.blue,   bg:t.blueBg,   color:t.blue   },
  "Pausada":     { dot:t.orange, bg:t.orangeBg, color:t.orange },
  "Realizada":   { dot:t.accent, bg:t.accentBg, color:t.accent },
  "Cancelada":   { dot:t.danger, bg:t.dangerBg, color:t.danger },
});
const PRIO_CFG = (t) => ({
  Alta:  { dot:t.danger, bg:t.dangerBg, color:t.danger },
  Media: { dot:t.warn,   bg:t.warnBg,   color:t.warn   },
  Baja:  { dot:t.accent, bg:t.accentBg, color:t.accent },
});

const MOCK = [
  { recordId:"r1",  Id:1,  Titulo:"Rediseño de identidad corporativa",   Proyecto:"Marketing",        Responsable:"Elena Martínez", Estado:"En curso",    Prioridad:"Alta",  "Fecha inicio":"2026-03-15","Fecha fin":"2026-04-30", Horas:"18",  Descripcion:"Actualización del logotipo, paleta y guía de estilo." },
  { recordId:"r2",  Id:2,  Titulo:"Migración al nuevo ERP",              Proyecto:"Tecnología",       Responsable:"Roberto Sanz",   Estado:"Pausada",     Prioridad:"Alta",  "Fecha inicio":"2026-03-20","Fecha fin":"2026-05-15", Horas:"40",  Descripcion:"Bloqueado pendiente de licencias del proveedor." },
  { recordId:"r3",  Id:3,  Titulo:"Plan de incorporación de empleados",  Proyecto:"Recursos Humanos", Responsable:"Carmen Vega",    Estado:"Realizada",   Prioridad:"Media", "Fecha inicio":"2026-02-01","Fecha fin":"2026-03-01", Horas:"12",  Descripcion:"Flujos de onboarding para nuevas incorporaciones." },
  { recordId:"r4",  Id:4,  Titulo:"Auditoría de costes Q1",              Proyecto:"Finanzas",         Responsable:"Andrés Molina",  Estado:"Realizada",   Prioridad:"Alta",  "Fecha inicio":"2026-03-01","Fecha fin":"2026-03-31", Horas:"10",  Descripcion:"Revisión de gastos operativos del primer trimestre." },
  { recordId:"r5",  Id:5,  Titulo:"Campaña de redes sociales verano",    Proyecto:"Marketing",        Responsable:"Laura Jiménez",  Estado:"Sin iniciar", Prioridad:"Media", "Fecha inicio":"2026-04-10","Fecha fin":"2026-06-30", Horas:"6",   Descripcion:"Calendarización de contenidos para verano." },
  { recordId:"r6",  Id:6,  Titulo:"Optimización de procesos de almacén", Proyecto:"Operaciones",      Responsable:"Miguel Torres",  Estado:"En curso",    Prioridad:"Media", "Fecha inicio":"2026-03-25","Fecha fin":"2026-04-20", Horas:"15",  Descripcion:"Reducción de tiempos de picking y packing." },
  { recordId:"r7",  Id:7,  Titulo:"Actualización política de privacidad",Proyecto:"Operaciones",      Responsable:"Isabel Ramos",   Estado:"Sin iniciar", Prioridad:"Baja",  "Fecha inicio":"2026-04-05","Fecha fin":"2026-04-25", Horas:"4",   Descripcion:"Adaptación al nuevo reglamento europeo." },
  { recordId:"r8",  Id:8,  Titulo:"Formación en liderazgo para mandos",  Proyecto:"Recursos Humanos", Responsable:"Carmen Vega",    Estado:"En curso",    Prioridad:"Media", "Fecha inicio":"2026-03-28","Fecha fin":"2026-05-10", Horas:"9",   Descripcion:"Programa de 5 sesiones con consultora externa." },
  { recordId:"r9",  Id:9,  Titulo:"Integración pasarela de pagos",       Proyecto:"Tecnología",       Responsable:"Roberto Sanz",   Estado:"Sin iniciar", Prioridad:"Alta",  "Fecha inicio":"2026-04-01","Fecha fin":"2026-04-22", Horas:"22",  Descripcion:"Conexión con Stripe y validación PCI DSS." },
  { recordId:"r10", Id:10, Titulo:"Previsión presupuestaria 2027",       Proyecto:"Finanzas",         Responsable:"Andrés Molina",  Estado:"Sin iniciar", Prioridad:"Alta",  "Fecha inicio":"2026-04-15","Fecha fin":"2026-05-30", Horas:"14",  Descripcion:"Elaboración del presupuesto anual con jefes de área." },
];

/* ─── Horas helpers ─── */
function normalizeHoras(val) {
  if (val === "" || val == null) return "";
  return String(val).replace(".", ",");
}
function parseHoras(val) {
  if (val === "" || val == null) return 0;
  return parseFloat(String(val).replace(",", ".")) || 0;
}

/* ═══════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════ */
const Ic = ({ s=14, sw="1.9", children }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const IcoHome    = ({s=17}) => <Ic s={s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Ic>;
const IcoTable   = ({s=17}) => <Ic s={s}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></Ic>;
const IcoKanban  = ({s=17}) => <Ic s={s}><rect x="3" y="3" width="4" height="18" rx="1"/><rect x="10" y="3" width="4" height="12" rx="1"/><rect x="17" y="3" width="4" height="15" rx="1"/></Ic>;
const IcoEdit    = ({s=14}) => <Ic s={s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></Ic>;
const IcoTrash   = ({s=14}) => <Ic s={s}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Ic>;
const IcoPlus    = ()       => <Ic s={14} sw="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Ic>;
const IcoFilt    = ()       => <Ic s={13}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Ic>;
const IcoX       = ()       => <Ic s={12} sw="2.3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ic>;
const IcoChev    = ()       => <Ic s={10} sw="2.5"><polyline points="6 9 12 15 18 9"/></Ic>;
const IcoMoon    = ({s=13}) => <Ic s={s}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Ic>;
const IcoSun     = ({s=13}) => <Ic s={s}><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="1.5" x2="12" y2="3.5"/><line x1="12" y1="20.5" x2="12" y2="22.5"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1.5" y1="12" x2="3.5" y2="12"/><line x1="20.5" y1="12" x2="22.5" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></Ic>;
const IcoTask    = ()       => <Ic s={15}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></Ic>;
const IcoClock   = ()       => <Ic s={12}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></Ic>;
const IcoMenu    = ()       => <Ic s={18} sw="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></Ic>;
const IcoArrow   = ()       => <Ic s={13}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Ic>;
const IcoCal     = ()       => <Ic s={12}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ic>;
const IcoPhone   = ({s=13}) => <Ic s={s}><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ic>;
const IcoTablet  = ({s=13}) => <Ic s={s}><rect x="3" y="2" width="18" height="20" rx="2"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ic>;
const IcoDesktop = ({s=13}) => <Ic s={s}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></Ic>;
const IcoSortUp  = ()       => <Ic s={9} sw="2.5"><polyline points="18 15 12 9 6 15"/></Ic>;
const IcoSortDn  = ()       => <Ic s={9} sw="2.5"><polyline points="6 9 12 15 18 9"/></Ic>;
const IcoSortNo  = ()       => <Ic s={9} sw="2"><polyline points="18 13 12 9 6 13"/><polyline points="6 15 12 19 18 15"/></Ic>;
const IcoEye     = ({s=12}) => <Ic s={s}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Ic>;

/* ═══════════════════════════════════════════════
   BADGE
═══════════════════════════════════════════════ */
function Badge({ text, cfg }) {
  const c = cfg[text];
  if (!c) return <span style={{ fontSize:12, color:"#888" }}>{text||"—"}</span>;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:c.bg, color:c.color, border:`1px solid ${c.color}28`, borderRadius:20, padding:"3px 10px", fontSize:11.5, fontWeight:700, whiteSpace:"nowrap" }}>
      <span style={{ width:5.5, height:5.5, borderRadius:"50%", background:c.dot, flexShrink:0 }}/>
      {text}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   DEVICE SWITCHER
═══════════════════════════════════════════════ */
function DevSw({ device, setDevice, dark }) {
  const btn = (k, Icon) => (
    <button key={k} onClick={() => setDevice(k)} style={{
      width:28, height:26, borderRadius:6, border:"none", cursor:"pointer",
      background: device===k ? (dark?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.9)") : "transparent",
      color: device===k ? (dark?"#00e5a0":"#2e5ce6") : (dark?"#5a6285":"#9099b8"),
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow: device===k ? "0 1px 4px rgba(0,0,0,0.18)" : "none",
      transition:"all .15s",
    }}><Icon s={12}/></button>
  );
  return (
    <div style={{ display:"flex", gap:2, background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", borderRadius:9, padding:"3px" }}>
      {btn("phone",IcoPhone)}{btn("tablet",IcoTablet)}{btn("desktop",IcoDesktop)}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DARK TOGGLE
═══════════════════════════════════════════════ */
function Toggle({ dark, setDark, t }) {
  return (
    <button onClick={() => setDark(!dark)} style={{ position:"relative", width:52, height:27, borderRadius:14, background:dark?"rgba(0,229,160,0.12)":t.surface, border:`1.5px solid ${dark?t.accent:t.border}`, cursor:"pointer", padding:0, flexShrink:0, boxShadow:dark?t.accentGlow:"none", transition:"all 0.25s" }}>
      <span style={{ position:"absolute", left:6, top:"50%", transform:"translateY(-50%)", color:"#ffb84d", display:"flex", alignItems:"center", opacity:dark?1:0, transition:"opacity .2s", pointerEvents:"none" }}><IcoSun/></span>
      <span style={{ position:"absolute", right:6, top:"50%", transform:"translateY(-50%)", color:"#8890b0", display:"flex", alignItems:"center", opacity:dark?0:1, transition:"opacity .2s", pointerEvents:"none" }}><IcoMoon/></span>
      <span style={{ position:"absolute", width:19, height:19, borderRadius:"50%", background:dark?t.accent:"#9099b8", top:"50%", transform:"translateY(-50%)", left:dark?27:4, transition:"left .25s,background .25s", boxShadow:dark?`0 0 8px ${t.accent}99`:"none" }}/>
    </button>
  );
}

/* ═══════════════════════════════════════════════
   FORM HELPERS
═══════════════════════════════════════════════ */
const FF = "'Plus Jakarta Sans','DM Sans',sans-serif";
const lbS = (t) => ({ display:"block", fontSize:10.5, fontWeight:700, letterSpacing:0.9, textTransform:"uppercase", color:t.textMuted, marginBottom:6 });
const inS = (t,f) => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:`1.5px solid ${f?t.accent:t.border}`, background:t.inputBg, color:t.text, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:FF, boxShadow:f?`0 0 0 3px ${t.accentBg}`:"none", transition:"border-color .15s,box-shadow .15s" });

function Field({ label, value, onChange, type="text", t }) {
  const [f,sf]=useState(false);
  return <div><label style={lbS(t)}>{label}</label><input type={type} value={value} onChange={onChange} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={inS(t,f)}/></div>;
}
function TA({ label, value, onChange, t }) {
  const [f,sf]=useState(false);
  return <div><label style={lbS(t)}>{label}</label><textarea value={value} onChange={onChange} rows={3} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{...inS(t,f),resize:"vertical",minHeight:72,lineHeight:1.5}}/></div>;
}

/* Select con punto de color por opción */
function ColorSel({ label, value, onChange, options, cfgFn, t }) {
  const [f,sf]=useState(false);
  const cfg = cfgFn(t);
  const current = cfg[value];
  return (
    <div>
      <label style={lbS(t)}>{label}</label>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",zIndex:1,width:8,height:8,borderRadius:"50%",background:current?.dot||"#999",display:"block"}}/>
        <select value={value} onChange={onChange} onFocus={()=>sf(true)} onBlur={()=>sf(false)}
          style={{...inS(t,f),appearance:"none",cursor:"pointer",paddingLeft:28,paddingRight:32}}>
          {options.map(o=><option key={o}>{o}</option>)}
        </select>
        <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:t.textMuted}}><IcoChev/></span>
      </div>
    </div>
  );
}

function ProjF({ value, onChange, proyectos, t }) {
  const [custom,setC]=useState(!proyectos.includes(value)&&value!=="");
  const [f,sf]=useState(false);
  const onS=(e)=>{if(e.target.value==="__n__"){setC(true);onChange({target:{value:""}});}else{setC(false);onChange(e);}};
  return (
    <div><label style={lbS(t)}>Proyecto</label>
      {!custom?(
        <div style={{position:"relative"}}>
          <select value={value} onChange={onS} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{...inS(t,f),appearance:"none",cursor:"pointer",paddingRight:32}}>
            {proyectos.map(o=><option key={o}>{o}</option>)}
            <option value="__n__">＋ Nuevo…</option>
          </select>
          <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:t.textMuted}}><IcoChev/></span>
        </div>
      ):(
        <div style={{display:"flex",gap:6}}>
          <input autoFocus value={value} onChange={onChange} onFocus={()=>sf(true)} onBlur={()=>sf(false)} placeholder="Nombre" style={{...inS(t,f),flex:1}}/>
          <button onClick={()=>{setC(false);onChange({target:{value:proyectos[0]}});}} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:9,padding:"0 10px",cursor:"pointer",color:t.textMuted,display:"flex",alignItems:"center"}}><IcoX/></button>
        </div>
      )}
    </div>
  );
}

/* Campo horas: acepta punto o coma, siempre guarda con coma */
function HorasField({ value, onChange, t }) {
  const [f,sf]=useState(false);
  const handleChange = (e) => {
    let v = e.target.value.replace(/[^0-9.,]/g,"");
    v = v.replace(".", ",");
    const parts = v.split(",");
    if (parts.length > 2) v = parts[0]+","+parts.slice(1).join("");
    if (parts[1] && parts[1].length > 2) v = parts[0]+","+parts[1].slice(0,2);
    onChange({ target:{ value:v } });
  };
  return (
    <div>
      <label style={lbS(t)}>Horas</label>
      <input type="text" inputMode="decimal" value={value} onChange={handleChange}
        onFocus={()=>sf(true)} onBlur={()=>sf(false)}
        placeholder="ej: 5,25" style={inS(t,f)}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TASK MODAL
═══════════════════════════════════════════════ */
const emptyF=(ps)=>({Titulo:"",Proyecto:ps[0]||"",Descripcion:"",Responsable:"",Estado:"Sin iniciar",FechaInicio:"",FechaFin:"",Prioridad:"Media",Horas:""});

function TaskModal({ modal,form,setForm,onSave,onClose,saving,proyectos,t,device }) {
  const narrow = device==="phone";
  const s=(c)=>(e)=>setForm(f=>({...f,[c]:e.target.value}));
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"absolute",inset:0,background:t.overlay,backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16}}>
      <div style={{background:t.cardBg,borderRadius:18,width:"100%",maxWidth:500,maxHeight:"90%",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.45)",border:`1px solid ${t.border}`,boxSizing:"border-box"}}>
        <div style={{padding:"22px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:3}}>
              <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(160deg,${t.accent}f0,${t.accent}88)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:t.accentGlow}}><IcoTask/></div>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,color:t.text,fontFamily:FF}}>{modal.modo==="crear"?"Nueva tarea":"Editar tarea"}</h2>
            </div>
            <p style={{margin:0,fontSize:12,color:t.textMuted}}>{modal.modo==="crear"?"Rellena los campos.":"Modifica lo que necesites."}</p>
          </div>
          <button onClick={onClose} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,width:30,height:30,cursor:"pointer",color:t.textMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><IcoX/></button>
        </div>
        <div style={{height:1,background:t.border,margin:"18px 0 0"}}/>
        <div style={{padding:"18px 24px 22px",display:"flex",flexDirection:"column",gap:12}}>
          <Field label="Título" value={form.Titulo} onChange={s("Titulo")} t={t}/>
          <TA label="Descripción" value={form.Descripcion} onChange={s("Descripcion")} t={t}/>
          <div style={{display:"grid",gridTemplateColumns:narrow?"1fr":"1fr 1fr",gap:12}}>
            <ProjF value={form.Proyecto} onChange={s("Proyecto")} proyectos={proyectos} t={t}/>
            <Field label="Responsable" value={form.Responsable} onChange={s("Responsable")} t={t}/>
            <ColorSel label="Estado" value={form.Estado} onChange={s("Estado")} options={ESTADOS} cfgFn={ESTADO_CFG} t={t}/>
            <ColorSel label="Prioridad" value={form.Prioridad} onChange={s("Prioridad")} options={PRIORIDADES} cfgFn={PRIO_CFG} t={t}/>
            <Field label="Fecha inicio" value={form.FechaInicio} onChange={s("FechaInicio")} type="date" t={t}/>
            <Field label="Fecha fin" value={form.FechaFin} onChange={s("FechaFin")} type="date" t={t}/>
            <HorasField value={form.Horas} onChange={s("Horas")} t={t}/>
          </div>
          <div style={{height:1,background:t.border}}/>
          <div style={{display:"flex",gap:9}}>
            <button onClick={onSave} disabled={saving} style={{flex:1,background:`linear-gradient(160deg,${t.accent}f0,${t.accent}88)`,color:"#0c0e16",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:13,cursor:saving?"not-allowed":"pointer",opacity:saving?0.7:1,fontFamily:FF,boxShadow:t.accentGlow}}>
              {saving?"Guardando…":"Guardar tarea"}
            </button>
            <button onClick={onClose} style={{background:"none",color:t.textSub,border:`1px solid ${t.border}`,borderRadius:10,padding:"11px 20px",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:FF}}
              onMouseEnter={e=>e.currentTarget.style.background=t.surface}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DATE RANGE
═══════════════════════════════════════════════ */
const RANGES=[{id:"all",l:"Todo"},{id:"today",l:"Hoy"},{id:"week",l:"Esta semana"},{id:"month",l:"Este mes"},{id:"year",l:"Este año"},{id:"custom",l:"Personalizado"}];
function getRange(id,cf,ct){
  const n=new Date(),y=(d)=>d.toISOString().split("T")[0];
  if(id==="all")   return{from:null,to:null};
  if(id==="today") return{from:y(n),to:y(n)};
  if(id==="week"){const m=new Date(n);m.setDate(n.getDate()-n.getDay()+1);const s=new Date(m);s.setDate(m.getDate()+6);return{from:y(m),to:y(s)};}
  if(id==="month") return{from:y(new Date(n.getFullYear(),n.getMonth(),1)),to:y(new Date(n.getFullYear(),n.getMonth()+1,0))};
  if(id==="year")  return{from:`${n.getFullYear()}-01-01`,to:`${n.getFullYear()}-12-31`};
  return{from:cf||null,to:ct||null};
}
function inRange(x,from,to){
  const fi=x["Fecha inicio"],ff=x["Fecha fin"];
  if(!from&&!to)return true;
  if(from&&ff&&ff<from)return false;
  if(to&&fi&&fi>to)return false;
  return true;
}

/* ═══════════════════════════════════════════════
   DONUT CHART
═══════════════════════════════════════════════ */
const COLORS=["#00e5a0","#5b8fff","#ffb84d","#ff5a7e","#c07dff","#00cfff","#ff9e4a"];
function Donut({ data, t, device }) {
  const narrow = device==="phone";
  const total=data.reduce((a,d)=>a+d.value,0);
  const [hov,setHov]=useState(null);
  if(!total) return <div style={{color:t.textMuted,textAlign:"center",padding:24,fontSize:12}}>Sin datos</div>;
  const SZ=narrow?140:160,CX=narrow?70:80,CY=narrow?70:80,R=narrow?48:56,IN=narrow?28:34;
  let ang=-Math.PI/2;
  const segs=data.map((d,i)=>{
    const sw=(d.value/total)*2*Math.PI;
    const x1=CX+R*Math.cos(ang),y1=CY+R*Math.sin(ang);
    ang+=sw;
    const x2=CX+R*Math.cos(ang),y2=CY+R*Math.sin(ang);
    const xi1=CX+IN*Math.cos(ang-sw),yi1=CY+IN*Math.sin(ang-sw);
    const xi2=CX+IN*Math.cos(ang),yi2=CY+IN*Math.sin(ang);
    const lg=sw>Math.PI?1:0;
    return{path:`M${x1} ${y1} A${R} ${R} 0 ${lg} 1 ${x2} ${y2} L${xi2} ${yi2} A${IN} ${IN} 0 ${lg} 0 ${xi1} ${yi1}Z`,color:COLORS[i%COLORS.length],...d};
  });
  return(
    <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",flexDirection:narrow?"column":"row"}}>
      <svg width={SZ} height={SZ} style={{overflow:"visible",flexShrink:0}}>
        {segs.map((seg,i)=>(
          <path key={i} d={seg.path} fill={seg.color} opacity={hov===null||hov===i?1:0.3}
            style={{cursor:"pointer",transition:"opacity .2s,transform .2s",transformOrigin:`${CX}px ${CY}px`,transform:hov===i?"scale(1.05)":"scale(1)"}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}/>
        ))}
        <text x={CX} y={CY-5} textAnchor="middle" fill={t.text} fontSize={18} fontWeight={800} fontFamily={FF}>{hov!==null?segs[hov].value:total}</text>
        <text x={CX} y={CY+10} textAnchor="middle" fill={t.textMuted} fontSize={8} fontWeight={600} fontFamily={FF} letterSpacing={0.5}>{hov!==null?segs[hov].name.toUpperCase():"HORAS"}</text>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:6,flex:1,minWidth:100}}>
        {segs.map((seg,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",opacity:hov===null||hov===i?1:0.35,transition:"opacity .2s"}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <span style={{width:8,height:8,borderRadius:2,background:seg.color,flexShrink:0}}/>
            <span style={{fontSize:11.5,color:t.textSub,flex:1,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{seg.name}</span>
            <span style={{fontSize:12,fontWeight:700,color:t.text}}>{seg.value}h</span>
            <span style={{fontSize:10,color:t.textMuted,minWidth:26,textAlign:"right"}}>{Math.round(seg.value/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
const fmtD=(f)=>{if(!f)return null;const[y,m,d]=f.split("-");return`${d}/${m}/${y}`;};
function Dashboard({ tareas,t,onNew,onEditTask,setView,device }) {
  const narrow = device==="phone";
  const [chartBy,setChartBy]=useState("proyecto");
  const [range,setRange]=useState("month");
  const [cf,setCF]=useState(""); const [ct,setCT]=useState("");
  const {from,to}=useMemo(()=>getRange(range,cf,ct),[range,cf,ct]);
  const filtered=useMemo(()=>tareas.filter(x=>inRange(x,from,to)),[tareas,from,to]);
  const totalH=filtered.reduce((a,x)=>a+parseHoras(x.Horas),0);
  const stats=[
    {lbl:"Total tareas",val:filtered.length,col:t.text},
    {lbl:"En curso",val:filtered.filter(x=>x.Estado==="En curso").length,col:t.blue},
    {lbl:"Pausadas",val:filtered.filter(x=>x.Estado==="Pausada").length,col:t.orange},
    {lbl:"Realizadas",val:filtered.filter(x=>x.Estado==="Realizada").length,col:t.accent},
    {lbl:"Horas",val:`${totalH}h`,col:t.warn},
  ];
  const horasPor=useMemo(()=>{
    const map={};
    filtered.forEach(x=>{const k=chartBy==="proyecto"?x.Proyecto:x.Responsable;if(!k)return;map[k]=(map[k]||0)+parseHoras(x.Horas);});
    return Object.entries(map).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  },[filtered,chartBy]);
  const recientes=useMemo(()=>filtered.slice().sort((a,b)=>((b["Fecha inicio"]||"")<(a["Fecha inicio"]||""))?-1:1).slice(0,6),[filtered]);
  const bc=ESTADO_CFG(t);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:narrow?"flex-start":"flex-end",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:10.5,color:t.textMuted,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Panel principal</div>
          <h1 style={{margin:0,fontSize:24,fontWeight:700,letterSpacing:-0.5,lineHeight:1.1,color:t.text,fontFamily:FF}}>Resumen de actividad</h1>
          <div style={{marginTop:4,fontSize:13,color:t.textSub}}>Seguimiento y análisis de tareas</div>
        </div>
        <button onClick={onNew} style={{background:`linear-gradient(160deg,${t.accent}f0,${t.accent}88)`,color:"#0c0e16",border:"none",borderRadius:10,padding:"8px 18px",cursor:"pointer",fontSize:12.5,fontWeight:700,display:"flex",alignItems:"center",gap:6,fontFamily:FF,boxShadow:t.accentGlow,flexShrink:0,width:narrow?"100%":undefined}}>
          <IcoPlus/> Nueva tarea
        </button>
      </div>
      <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:12,padding:"12px 16px",boxShadow:t.shadow}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:t.textMuted,display:"flex",alignItems:"center",gap:4,marginRight:3,whiteSpace:"nowrap"}}><IcoCal/> Período</span>
          {RANGES.map(o=>(
            <button key={o.id} onClick={()=>setRange(o.id)} style={{padding:"4px 11px",borderRadius:7,border:`1.5px solid ${range===o.id?t.accent:t.border}`,background:range===o.id?t.accentBg:"none",color:range===o.id?t.accent:t.textSub,fontSize:11.5,fontWeight:range===o.id?700:500,cursor:"pointer",fontFamily:FF,transition:"all .15s",whiteSpace:"nowrap"}}>{o.l}</button>
          ))}
        </div>
        {range==="custom"&&(
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginTop:10}}>
            <input type="date" value={cf} onChange={e=>setCF(e.target.value)} style={{...inS(t,false),padding:"6px 10px",fontSize:12,width:"auto",minWidth:130}}/>
            <span style={{color:t.textMuted,fontSize:12}}>→</span>
            <input type="date" value={ct} onChange={e=>setCT(e.target.value)} style={{...inS(t,false),padding:"6px 10px",fontSize:12,width:"auto",minWidth:130}}/>
          </div>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:narrow?"repeat(3,1fr)":"repeat(auto-fit,minmax(100px,1fr))",gap:narrow?8:9}}>
        {stats.map(({lbl,val,col})=>(
          <div key={lbl} style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 16px",boxShadow:t.shadow}}>
            <div style={{fontSize:26,fontWeight:800,color:col,lineHeight:1,letterSpacing:-1}}>{val}</div>
            <div style={{fontSize:10.5,color:t.textMuted,marginTop:5,fontWeight:600}}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:narrow?"1fr":"minmax(260px,1fr) minmax(240px,1fr)",gap:12}}>
        <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:14,padding:18,boxShadow:t.shadow}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:8,flexWrap:"wrap"}}>
            <div>
              <div style={{fontWeight:700,fontSize:13.5,color:t.text}}>Horas invertidas</div>
              <div style={{fontSize:11,color:t.textMuted,marginTop:2}}>Distribución en el período</div>
            </div>
            <div style={{display:"flex",gap:3,background:t.surface,borderRadius:8,padding:2,border:`1px solid ${t.border}`,flexShrink:0}}>
              {[{k:"proyecto",l:"Proyecto"},{k:"responsable",l:"Responsable"}].map(({k,l})=>(
                <button key={k} onClick={()=>setChartBy(k)} style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:FF,background:chartBy===k?t.accent:"none",color:chartBy===k?"#0c0e16":t.textMuted,transition:"all .15s"}}>{l}</button>
              ))}
            </div>
          </div>
          <Donut data={horasPor} t={t} device={device}/>
        </div>
        <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:14,padding:18,boxShadow:t.shadow,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
            <div style={{fontWeight:700,fontSize:13.5,color:t.text}}>Tareas del período</div>
            <button onClick={()=>setView("table")} style={{background:"none",border:"none",cursor:"pointer",color:t.accent,fontSize:11.5,fontWeight:600,display:"flex",alignItems:"center",gap:3,fontFamily:FF,padding:0}}>
              Ver todas <IcoArrow/>
            </button>
          </div>
          <div style={{fontSize:11,color:t.textMuted,marginBottom:12}}>{filtered.length} tareas</div>
          <div style={{display:"flex",flexDirection:"column",gap:6,flex:1,overflowY:"auto"}}>
            {recientes.length===0&&<div style={{color:t.textMuted,fontSize:12,textAlign:"center",padding:"20px 0"}}>Sin tareas en este período</div>}
            {recientes.map((x,i)=>{
              const c=bc[x.Estado];
              return(
                <div key={i} onClick={()=>onEditTask(x)}
                  style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",background:t.surface,borderRadius:10,border:`1px solid ${t.border}`,cursor:"pointer",transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.background=t.surfaceHover;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.background=t.surface;}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:c?.dot||t.textMuted,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:12.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:t.text}}>{x.Titulo}</div>
                    <div style={{fontSize:10.5,color:t.textMuted,marginTop:1}}>{x.Responsable} · {x.Proyecto}</div>
                  </div>
                  {parseHoras(x.Horas)>0&&<span style={{fontSize:11,color:t.textMuted,whiteSpace:"nowrap"}}>{normalizeHoras(x.Horas)}h</span>}
                  <span style={{color:t.textMuted,opacity:0.4,display:"flex",alignItems:"center"}}><IcoArrow/></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TABLE VIEW — ordenación + selector de vista
═══════════════════════════════════════════════ */
const SORT_COLS = [
  { key:"Id",          get:(x)=>x.Id },
  { key:"Titulo",      get:(x)=>x.Titulo||"" },
  { key:"Proyecto",    get:(x)=>x.Proyecto||"" },
  { key:"Responsable", get:(x)=>x.Responsable||"" },
  { key:"Estado",      get:(x)=>x.Estado||"" },
  { key:"Prioridad",   get:(x)=>({Alta:0,Media:1,Baja:2})[x.Prioridad]??99 },
  { key:"Horas",       get:(x)=>parseHoras(x.Horas) },
  { key:"FechaInicio", get:(x)=>x["Fecha inicio"]||"" },
  { key:"FechaFin",    get:(x)=>x["Fecha fin"]||"" },
];
const ESTADOS_ACTIVOS = ["Sin iniciar","En curso","Pausada"];

function SortTh({ colKey, label, sortCol, sortDir, onSort, t, align="center" }) {
  const active = sortCol===colKey;
  return (
    <th onClick={()=>onSort(colKey)} style={{padding:"11px 14px",textAlign:align,fontSize:9.5,fontWeight:800,letterSpacing:1,textTransform:"uppercase",color:active?t.accent:t.textMuted,background:t.surface,whiteSpace:"nowrap",cursor:"pointer",userSelect:"none",transition:"color .15s"}}>
      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
        {label}
        <span style={{color:active?t.accent:t.textMuted,opacity:active?1:0.4,display:"flex",alignItems:"center"}}>
          {active?(sortDir==="asc"?<IcoSortUp/>:<IcoSortDn/>):<IcoSortNo/>}
        </span>
      </span>
    </th>
  );
}

function TableView({ tareas,proyectos,t,onEdit,onDelete,onNew,device }) {
  const narrow = device==="phone";
  const [showF,setShowF]=useState(false);
  const [tableView,setTableView]=useState("activas");
  const [filters,setFilters]=useState({texto:"",estado:"",prioridad:"",proyecto:"",responsable:"",fechaInicio:"",fechaFin:""});
  const [sortCol,setSortCol]=useState("FechaInicio");
  const [sortDir,setSortDir]=useState("asc");
  const bc=ESTADO_CFG(t); const pc=PRIO_CFG(t);

  const onSort=(key)=>{
    if(sortCol===key) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortCol(key); setSortDir("asc"); }
  };

  const filtered=useMemo(()=>{
    let list=tareas.filter(x=>{
      if(tableView==="activas"&&!ESTADOS_ACTIVOS.includes(x.Estado))return false;
      const txt=filters.texto.toLowerCase();
      if(txt&&!(x.Titulo?.toLowerCase().includes(txt)||x.Descripcion?.toLowerCase().includes(txt)))return false;
      if(filters.estado&&x.Estado!==filters.estado)return false;
      if(filters.prioridad&&x.Prioridad!==filters.prioridad)return false;
      if(filters.proyecto&&x.Proyecto!==filters.proyecto)return false;
      if(filters.responsable&&!x.Responsable?.toLowerCase().includes(filters.responsable.toLowerCase()))return false;
      if(filters.fechaInicio&&x["Fecha inicio"]&&x["Fecha inicio"]<filters.fechaInicio)return false;
      if(filters.fechaFin&&x["Fecha fin"]&&x["Fecha fin"]>filters.fechaFin)return false;
      return true;
    });
    const col=SORT_COLS.find(c=>c.key===sortCol);
    if(col){
      list=[...list].sort((a,b)=>{
        const av=col.get(a),bv=col.get(b);
        if(av<bv)return sortDir==="asc"?-1:1;
        if(av>bv)return sortDir==="asc"?1:-1;
        return 0;
      });
    }
    return list;
  },[tareas,filters,sortCol,sortDir,tableView]);

  const fCount=Object.values(filters).filter(v=>v!=="").length;
  const fi=(key,type,ph)=><input type={type||"text"} value={filters[key]} placeholder={ph} onChange={e=>setFilters(f=>({...f,[key]:e.target.value}))} style={{...inS(t,false),fontSize:12,padding:"7px 10px",minWidth:type==="date"?126:140,maxWidth:type==="date"?155:200}}/>;
  const fs=(key,opts,ph)=>(
    <div style={{position:"relative"}}>
      <select value={filters[key]} onChange={e=>setFilters(f=>({...f,[key]:e.target.value}))} style={{...inS(t,false),fontSize:12,padding:"7px 26px 7px 10px",appearance:"none",cursor:"pointer",minWidth:100}}>
        <option value="">{ph}</option>{opts.map(o=><option key={o}>{o}</option>)}
      </select>
      <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:t.textMuted}}><IcoChev/></span>
    </div>
  );

  const thProps = (key,label,align)=>({colKey:key,label,sortCol,sortDir,onSort,t,align});

  return(
    <div>
      <div style={{display:"flex",justifyContent:narrow?"flex-start":"space-between",alignItems:narrow?"stretch":"center",flexDirection:narrow?"column":"row",marginBottom:14,flexWrap:"wrap",gap:9}}>
        <div>
          <h2 style={{margin:0,fontSize:20,fontWeight:700,letterSpacing:-0.3,color:t.text,textAlign:"left",fontFamily:FF}}>Lista de tareas</h2>
          <div style={{fontSize:11.5,color:t.textMuted,marginTop:3}}>{tareas.length} tareas en total</div>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
          {/* Selector vista */}
          <div style={{display:"flex",gap:2,background:t.surface,borderRadius:9,padding:"3px",border:`1px solid ${t.border}`}}>
            {[{id:"activas",label:"Activas"},{id:"todas",label:"Todas"}].map(v=>(
              <button key={v.id} onClick={()=>setTableView(v.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11.5,fontWeight:tableView===v.id?700:500,fontFamily:FF,background:tableView===v.id?t.accent:"none",color:tableView===v.id?"#0c0e16":t.textSub,transition:"all .15s"}}>
                <IcoEye s={11}/>{v.label}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowF(!showF)} style={{background:showF?t.accentBg:t.cardBg,border:`1.5px solid ${showF?t.accent:t.border}`,borderRadius:9,padding:"6px 13px",cursor:"pointer",color:showF?t.accent:t.textSub,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6,fontFamily:FF,boxShadow:showF?t.accentGlow:"none",transition:"all .2s"}}>
            <IcoFilt/> Filtros {fCount>0&&<span style={{background:t.accent,color:"#0c0e16",borderRadius:20,padding:"1.5px 6px",fontSize:10,fontWeight:800}}>{fCount}</span>}
          </button>
          <button onClick={onNew} style={{background:`linear-gradient(160deg,${t.accent}f0,${t.accent}88)`,color:"#0c0e16",border:"none",borderRadius:9,padding:"7px 16px",cursor:"pointer",fontSize:12.5,fontWeight:700,display:"flex",alignItems:"center",gap:6,fontFamily:FF,boxShadow:t.accentGlow}}>
            <IcoPlus/> Nueva tarea
          </button>
        </div>
      </div>

      {showF&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:7,alignItems:"center",padding:"12px 16px",background:t.cardBg,borderRadius:12,border:`1px solid ${t.border}`,marginBottom:12,boxShadow:t.shadow}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:0.9,textTransform:"uppercase",color:t.textMuted,marginRight:3}}>Filtros</span>
          {fi("texto","text","Buscar…")}
          {fs("estado",ESTADOS,"Estado")}
          {fs("prioridad",PRIORIDADES,"Prioridad")}
          {fs("proyecto",proyectos,"Proyecto")}
          {fi("responsable","text","Responsable")}
          <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:10.5,color:t.textMuted}}>Desde</span>{fi("fechaInicio","date")}</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:10.5,color:t.textMuted}}>Hasta</span>{fi("fechaFin","date")}</div>
          {fCount>0&&<button onClick={()=>setFilters({texto:"",estado:"",prioridad:"",proyecto:"",responsable:"",fechaInicio:"",fechaFin:""})} style={{background:"none",border:`1px solid ${t.borderMed}`,borderRadius:7,padding:"6px 11px",cursor:"pointer",color:t.textSub,fontSize:11.5,fontWeight:500,display:"flex",alignItems:"center",gap:4,fontFamily:FF}}><IcoX/> Limpiar</button>}
        </div>
      )}

      <div style={{background:t.cardBg,borderRadius:14,border:`1px solid ${t.border}`,boxShadow:t.shadowCard,overflow:"hidden"}}>
        {filtered.length===0?(
          <div style={{textAlign:"center",padding:60,color:t.textMuted,fontSize:13}}>{fCount>0?"Ninguna tarea coincide.":"No hay tareas aún."}</div>
        ):(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"auto",minWidth:narrow?560:720}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${t.border}`}}>
                  <SortTh {...thProps("Id","#","left")}/>
                  <SortTh {...thProps("Titulo","Título","left")}/>
                  <SortTh {...thProps("Proyecto","Proyecto","center")}/>
                  <SortTh {...thProps("Responsable","Responsable","center")}/>
                  <SortTh {...thProps("Estado","Estado","center")}/>
                  <SortTh {...thProps("Prioridad","Prioridad","center")}/>
                  <SortTh {...thProps("Horas","Horas","center")}/>
                  <SortTh {...thProps("FechaInicio","Inicio","center")}/>
                  <SortTh {...thProps("FechaFin","Fin","center")}/>
                  <th style={{padding:"11px 14px",background:t.surface}}/>
                </tr>
              </thead>
              <tbody>
                {filtered.map((x,i)=>(
                  <tr key={x.recordId||i} style={{borderBottom:i<filtered.length-1?`1px solid ${t.border}`:"none",transition:"background .12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=t.surfaceHover}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"12px 14px",fontSize:11.5,color:t.textMuted,whiteSpace:"nowrap",textAlign:"left"}}>{x.Id}</td>
                    <td style={{padding:"12px 14px",minWidth:160,maxWidth:240,textAlign:"left"}}>
                      <div style={{fontWeight:600,fontSize:13,letterSpacing:-0.1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:t.text}}>{x.Titulo}</div>
                      {x.Descripcion&&<div style={{fontSize:11,color:t.textMuted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.Descripcion}</div>}
                    </td>
                    <td style={{padding:"12px 14px",whiteSpace:"nowrap",textAlign:"center"}}>
                      {x.Proyecto&&<span style={{background:t.surface,border:`1px solid ${t.borderMed}`,borderRadius:7,padding:"2px 9px",fontSize:11,fontWeight:700,color:t.textSub,display:"inline-block"}}>{x.Proyecto}</span>}
                    </td>
                    <td style={{padding:"12px 14px",fontSize:12.5,color:t.textSub,whiteSpace:"nowrap",textAlign:"center"}}>{x.Responsable||"—"}</td>
                    <td style={{padding:"12px 14px",whiteSpace:"nowrap",textAlign:"center"}}><Badge text={x.Estado} cfg={bc}/></td>
                    <td style={{padding:"12px 14px",whiteSpace:"nowrap",textAlign:"center"}}><Badge text={x.Prioridad} cfg={pc}/></td>
                    <td style={{padding:"12px 14px",whiteSpace:"nowrap",textAlign:"center"}}>
                      {parseHoras(x.Horas)>0?<span style={{display:"inline-flex",alignItems:"center",gap:4,color:t.textSub,fontSize:12,fontWeight:600}}><span style={{color:t.textMuted}}><IcoClock/></span>{normalizeHoras(x.Horas)}h</span>:"—"}
                    </td>
                    <td style={{padding:"12px 14px",fontSize:12,color:t.textSub,whiteSpace:"nowrap",textAlign:"center"}}>{fmtD(x["Fecha inicio"])??"—"}</td>
                    <td style={{padding:"12px 14px",fontSize:12,color:t.textSub,whiteSpace:"nowrap",textAlign:"center"}}>{fmtD(x["Fecha fin"])??"—"}</td>
                    <td style={{padding:"12px 18px 12px 10px",whiteSpace:"nowrap"}}>
                      <div style={{display:"flex",gap:5}}>
                        {[
                          {fn:()=>onEdit(x),ico:<IcoEdit s={14}/>,hc:t.accent},
                          {fn:()=>onDelete(x.Id),ico:<IcoTrash s={14}/>,hc:t.danger}
                        ].map(({fn,ico,hc},bi)=>(
                          <button key={bi} onClick={fn} style={{background:t.surface,border:`1px solid ${t.borderMed}`,borderRadius:8,padding:"6px 9px",cursor:"pointer",color:t.textSub,display:"flex",alignItems:"center",transition:"all .12s"}}
                            onMouseEnter={e=>{e.currentTarget.style.color=hc;e.currentTarget.style.borderColor=hc;e.currentTarget.style.background=`${hc}14`;}}
                            onMouseLeave={e=>{e.currentTarget.style.color=t.textSub;e.currentTarget.style.borderColor=t.borderMed;e.currentTarget.style.background=t.surface;}}>{ico}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {filtered.length>0&&<div style={{textAlign:"left",marginTop:8,fontSize:11.5,color:t.textMuted}}>{filtered.length} {filtered.length===1?"tarea":"tareas"}{fCount>0?" filtradas":""}{tableView==="activas"?" · activas":""}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   KANBAN
═══════════════════════════════════════════════ */
function KanbanView({ tareas,setTareas,t,onEdit,onDelete,onNew,device }) {
  const narrow = device==="phone";
  const pc=PRIO_CFG(t);
  const dragId=useRef(null);
  const [dragOver,setDO]=useState(null);
  const colC={"Sin iniciar":t.gray,"En curso":t.blue,"Pausada":t.orange,"Realizada":t.accent,"Cancelada":t.danger};
  const onDS=(e,id)=>{dragId.current=id;e.dataTransfer.effectAllowed="move";setTimeout(()=>{if(e.target)e.target.style.opacity="0.4";},0);};
  const onDE=(e)=>{if(e.target)e.target.style.opacity="1";dragId.current=null;setDO(null);};
  const onDOC=(e,est)=>{e.preventDefault();e.dataTransfer.dropEffect="move";setDO(est);};
  const onDrop=(e,est)=>{e.preventDefault();const id=dragId.current;if(!id)return;setTareas(p=>p.map(x=>x.recordId===id?{...x,Estado:est}:x));dragId.current=null;setDO(null);};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:9}}>
        <div style={{textAlign:"left"}}>
          <h2 style={{margin:0,fontSize:20,fontWeight:700,letterSpacing:-0.3,color:t.text,fontFamily:FF}}>Kanban</h2>
          <div style={{fontSize:11.5,color:t.textMuted,marginTop:3}}>Arrastra las tarjetas para cambiar estado</div>
        </div>
        <button onClick={onNew} style={{background:`linear-gradient(160deg,${t.accent}f0,${t.accent}88)`,color:"#0c0e16",border:"none",borderRadius:9,padding:"7px 16px",cursor:"pointer",fontSize:12.5,fontWeight:700,display:"flex",alignItems:"center",gap:6,fontFamily:FF,boxShadow:t.accentGlow}}>
          <IcoPlus/> Nueva tarea
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:narrow?"repeat(2,1fr)":"repeat(auto-fit,minmax(185px,1fr))",gap:narrow?8:10,alignItems:"start"}}>
        {ESTADOS.map(est=>{
          const items=tareas.filter(x=>x.Estado===est);
          const col=colC[est]||t.accent;
          const over=dragOver===est;
          return(
            <div key={est} onDragOver={e=>onDOC(e,est)} onDragLeave={()=>setDO(null)} onDrop={e=>onDrop(e,est)}
              style={{background:t.cardBg,borderRadius:14,border:`2px solid ${over?col:t.border}`,overflow:"hidden",boxShadow:over?`0 0 0 3px ${col}22`:t.shadow,transition:"border-color .15s,box-shadow .15s"}}>
              {/* Cabecera columna */}
              <div style={{padding:"9px 12px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:over?`${col}0a`:"none",transition:"background .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:col,boxShadow:`0 0 5px ${col}88`,flexShrink:0}}/>
                  <span style={{fontWeight:700,fontSize:12.5,color:t.text}}>{est}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  {items.reduce((a,x)=>a+parseHoras(x.Horas),0)>0&&<span style={{fontSize:10.5,color:t.textSub,fontWeight:600}}>{items.reduce((a,x)=>a+parseHoras(x.Horas),0)}h</span>}
                  <span style={{background:`${col}18`,color:col,border:`1px solid ${col}28`,borderRadius:20,padding:"1px 7px",fontSize:11,fontWeight:700}}>{items.length}</span>
                </div>
              </div>
              {/* Tarjetas */}
              <div style={{padding:"7px 7px 9px",display:"flex",flexDirection:"column",gap:6,minHeight:50}}>
                {items.length===0&&<div style={{textAlign:"center",padding:"12px 0",color:over?col:t.textMuted,fontSize:11.5,fontWeight:over?600:400,transition:"color .15s"}}>{over?"Soltar aquí":"Sin tareas"}</div>}
                {items.map((x)=>(
                  <div key={x.recordId} draggable onDragStart={e=>onDS(e,x.recordId)} onDragEnd={onDE}
                    style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:10,padding:"9px 10px",cursor:"grab",userSelect:"none",transition:"box-shadow .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=t.borderMed;e.currentTarget.style.boxShadow=t.shadow;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.boxShadow="none";}}>
                    {/* Título + botones */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,marginBottom:4}}>
                      <div style={{fontWeight:600,fontSize:12.5,letterSpacing:-0.1,lineHeight:1.3,flex:1,color:t.text,textAlign:"left"}}>{x.Titulo}</div>
                      <div style={{display:"flex",gap:3,flexShrink:0}}>
                        {[
                          {fn:()=>onEdit(x),hc:t.accent,ico:<IcoEdit s={13}/>},
                          {fn:()=>onDelete(x.Id),hc:t.danger,ico:<IcoTrash s={13}/>}
                        ].map(({fn,hc,ico},bi)=>(
                          <button key={bi} onClick={e=>{e.stopPropagation();fn();}} onMouseDown={e=>e.stopPropagation()}
                            style={{background:t.cardBg,border:`1.5px solid ${t.borderMed}`,borderRadius:6,padding:"4px 6px",cursor:"pointer",color:t.textSub,display:"flex",alignItems:"center",transition:"all .12s"}}
                            onMouseEnter={e=>{e.currentTarget.style.color=hc;e.currentTarget.style.borderColor=hc;e.currentTarget.style.background=`${hc}14`;}}
                            onMouseLeave={e=>{e.currentTarget.style.color=t.textSub;e.currentTarget.style.borderColor=t.borderMed;e.currentTarget.style.background=t.cardBg;}}>{ico}</button>
                        ))}
                      </div>
                    </div>
                    {x.Descripcion&&<div style={{fontSize:11,color:t.textSub,marginBottom:6,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",textAlign:"left"}}>{x.Descripcion}</div>}
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>
                      <Badge text={x.Prioridad} cfg={pc}/>
                      {x.Proyecto&&<span style={{background:t.cardBg,border:`1px solid ${t.borderMed}`,borderRadius:6,padding:"2px 7px",fontSize:10.5,fontWeight:700,color:t.textSub}}>{x.Proyecto}</span>}
                      {parseHoras(x.Horas)>0&&<span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10.5,color:t.textSub,fontWeight:600}}><IcoClock/>{normalizeHoras(x.Horas)}h</span>}
                    </div>
                    {x.Responsable&&<div style={{marginTop:5,paddingTop:5,borderTop:`1px solid ${t.border}`,fontSize:10.5,color:t.textSub,fontWeight:500}}>{x.Responsable}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NAV / SIDEBAR / BARS
═══════════════════════════════════════════════ */
const NAV=[
  {id:"dashboard",label:"Dashboard",Icon:IcoHome},
  {id:"table",    label:"Tareas",   Icon:IcoTable},
  {id:"kanban",   label:"Kanban",   Icon:IcoKanban},
];

function Sidebar({ view,setView,dark,setDark,device,setDevice,t,count }) {
  return(
    <aside style={{width:200,minWidth:200,background:t.sidebar,borderRight:`1px solid ${t.sidebarBorder}`,display:"flex",flexDirection:"column",height:"100%",flexShrink:0}}>
      <div style={{padding:"18px 16px 14px",borderBottom:`1px solid ${t.sidebarBorder}`}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(160deg,${t.accent}f0,${t.accent}88)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:t.accentGlow,flexShrink:0}}><IcoTask/></div>
          <span style={{fontWeight:800,fontSize:15.5,letterSpacing:-0.5,color:t.text,fontFamily:FF}}>Tareas<span style={{color:t.accent}}>Pro</span></span>
        </div>
      </div>
      <nav style={{flex:1,padding:"12px 8px",display:"flex",flexDirection:"column",gap:2}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:t.textMuted,padding:"0 9px",marginBottom:7}}>Navegación</div>
        {NAV.map(({id,label,Icon})=>{
          const a=view===id;
          return(
            <button key={id} onClick={()=>setView(id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:FF,fontWeight:a?700:500,fontSize:13,color:a?t.accent:t.textSub,background:a?t.accentBg:"none",width:"100%",textAlign:"left",transition:"all .15s"}}>
              <span style={{color:a?t.accent:t.textMuted,display:"flex",alignItems:"center"}}><Icon s={15}/></span>
              {label}
              {id==="table"&&count>0&&<span style={{marginLeft:"auto",background:a?t.accent:t.surface,color:a?"#0c0e16":t.textMuted,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700,border:`1px solid ${t.border}`}}>{count}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{padding:"10px 12px 6px",borderTop:`1px solid ${t.sidebarBorder}`}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:t.textMuted,marginBottom:7}}>Vista previa</div>
        <DevSw device={device} setDevice={setDevice} dark={dark}/>
      </div>
      <div style={{padding:"10px 16px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:11.5,color:t.textMuted,fontWeight:500}}>{dark?"Modo oscuro":"Modo claro"}</span>
        <Toggle dark={dark} setDark={setDark} t={t}/>
      </div>
    </aside>
  );
}

function TabBar({ view,setView,dark,setDark,device,setDevice,t }) {
  return(
    <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:50,background:t.navBg,borderTop:`1px solid ${t.sidebarBorder}`,display:"flex",alignItems:"center",padding:"7px 4px 10px",backdropFilter:"blur(10px)"}}>
      {NAV.map(({id,label,Icon})=>{
        const a=view===id;
        return(
          <button key={id} onClick={()=>setView(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 0",border:"none",cursor:"pointer",background:"none",fontFamily:FF,color:a?t.accent:t.textMuted,fontWeight:a?700:400,fontSize:9.5,transition:"color .15s"}}>
            <span style={{display:"flex"}}><Icon s={19}/></span>{label}
          </button>
        );
      })}
      <button onClick={()=>setDark(!dark)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 0",border:"none",cursor:"pointer",background:"none",color:t.textMuted,fontFamily:FF,fontSize:9.5}}>
        <span style={{display:"flex"}}>{dark?<IcoSun s={19}/>:<IcoMoon s={19}/>}</span>{dark?"Claro":"Oscuro"}
      </button>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"4px 0"}}>
        <DevSw device={device} setDevice={setDevice} dark={dark}/>
      </div>
    </div>
  );
}

function MobileBar({ view,setView,dark,setDark,device,setDevice,t,count,drawerOpen,setDrawerOpen }) {
  return(
    <>
      <header style={{position:"absolute",top:0,left:0,right:0,zIndex:50,background:t.headerBg,backdropFilter:"blur(12px)",borderBottom:`1px solid ${t.sidebarBorder}`,height:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px"}}>
        <button onClick={()=>setDrawerOpen(true)} style={{background:"none",border:"none",cursor:"pointer",color:t.text,display:"flex",alignItems:"center",padding:3}}><IcoMenu/></button>
        <span style={{fontWeight:800,fontSize:14.5,letterSpacing:-0.5,color:t.text,fontFamily:FF}}>Tareas<span style={{color:t.accent}}>Pro</span></span>
        <Toggle dark={dark} setDark={setDark} t={t}/>
      </header>
      {drawerOpen&&(
        <div onClick={()=>setDrawerOpen(false)} style={{position:"absolute",inset:0,zIndex:200,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(2px)"}}>
          <nav onClick={e=>e.stopPropagation()} style={{position:"absolute",left:0,top:0,bottom:0,width:220,background:t.sidebar,display:"flex",flexDirection:"column",boxShadow:"4px 0 20px rgba(0,0,0,0.2)"}}>
            <div style={{padding:"18px 16px 14px",borderBottom:`1px solid ${t.sidebarBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:800,fontSize:15,color:t.text,fontFamily:FF}}>Tareas<span style={{color:t.accent}}>Pro</span></span>
              <button onClick={()=>setDrawerOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted}}><IcoX/></button>
            </div>
            <div style={{padding:"12px 8px",flex:1}}>
              {NAV.map(({id,label,Icon})=>{
                const a=view===id;
                return(
                  <button key={id} onClick={()=>{setView(id);setDrawerOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 10px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:FF,fontWeight:a?700:500,fontSize:13,color:a?t.accent:t.textSub,background:a?t.accentBg:"none",width:"100%",textAlign:"left",marginBottom:3}}>
                    <span style={{color:a?t.accent:t.textMuted,display:"flex"}}><Icon s={15}/></span>
                    {label}
                    {id==="table"&&count>0&&<span style={{marginLeft:"auto",background:t.accent,color:"#0c0e16",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800}}>{count}</span>}
                  </button>
                );
              })}
            </div>
            <div style={{padding:"10px 12px",borderTop:`1px solid ${t.sidebarBorder}`}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:t.textMuted,marginBottom:7}}>Vista previa</div>
              <DevSw device={device} setDevice={setDevice} dark={dark}/>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════ */
function GlobalStyles({ scrollThumb }) {
  useEffect(() => {
    if (!document.getElementById("pjs-font")) {
      const link = document.createElement("link");
      link.id = "pjs-font"; link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
    if (!document.getElementById("app-base-styles")) {
      const style = document.createElement("style");
      style.id = "app-base-styles";
      style.textContent = `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;height:100%;overflow:hidden;font-family:'Plus Jakarta Sans','DM Sans','Helvetica Neue',sans-serif}
        body{background:#0c0e16}
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea{resize:vertical}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        input[type="date"]::-webkit-calendar-picker-indicator{opacity:.4;cursor:pointer}
        button{font-family:'Plus Jakarta Sans','DM Sans','Helvetica Neue',sans-serif}
      `;
      document.head.appendChild(style);
    }
  }, []);
  useEffect(() => {
    const s = document.getElementById("app-scrollbar-dyn") || (() => {
      const el=document.createElement("style");el.id="app-scrollbar-dyn";document.head.appendChild(el);return el;
    })();
    s.textContent=`::-webkit-scrollbar-thumb{border-radius:3px;background:${scrollThumb}}`;
  }, [scrollThumb]);
  return null;
}

/* ═══════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════ */
export default function App() {
  const [tareas,setTareas]    = useState([]);
  const [loading,setLoading]  = useState(true);
  const [dark,setDark]        = useState(false);
  const [view,setView]        = useState("dashboard");
  const [modal,setModal]      = useState(null);
  const [form,setForm]        = useState(emptyF(PROY_DEF));
  const [saving,setSaving]    = useState(false);
  const [drawerOpen,setDrawer]= useState(false);
  const [device,setDevice]    = useState("desktop");

  const t = T[dark?"dark":"light"];
  const spec = DEVICES[device];

  const proyectos = useMemo(()=>{
    const extra=tareas.map(x=>x.Proyecto).filter(p=>p&&!PROY_DEF.includes(p));
    return [...new Set([...PROY_DEF,...extra])];
  },[tareas]);

  const load = async () => {
  setLoading(true);
  try {
    const r = await fetch(API);
    if (!r.ok) throw new Error();

    const data = await r.json();

    const mapped = data.map(x => ({
      recordId: x.id.toString(),
      Id: x.id,
      Titulo: x.titulo,
      Descripcion: x.descripcion,
      Proyecto: x.proyecto,
      Responsable: x.responsable,
      Estado: x.estado,
      Prioridad: x.prioridad,
      "Fecha inicio": x.fechaInicio ? x.fechaInicio.split("T")[0] : "",
      "Fecha fin": x.fechaFin ? x.fechaFin.split("T")[0] : "",
      Horas: normalizeHoras(x.horas)
    }));

    setTareas(mapped);
  } catch (err) {
    console.log("Error API, uso MOCK", err);
    setTareas(MOCK);
  }
  setLoading(false);
};
  useEffect(()=>{load();},[]);

  const openNew = ()=>{setForm(emptyF(proyectos));setModal({modo:"crear"});};

  // FIX fechas: siempre mapear "Fecha inicio"/"Fecha fin" → FechaInicio/FechaFin
  const openEdit = (x)=>{
    setForm({
      Titulo:      x.Titulo      || "",
      Proyecto:    x.Proyecto    || "",
      Descripcion: x.Descripcion || "",
      Responsable: x.Responsable || "",
      Estado:      x.Estado      || "Sin iniciar",
      FechaInicio: x["Fecha inicio"] || "",
      FechaFin:    x["Fecha fin"]    || "",
      Prioridad:   x.Prioridad   || "Media",
      Horas:       normalizeHoras(x.Horas),
    });
    setModal({modo:"editar", recordId:x.recordId});
  };

  const save = async()=>{
    setSaving(true);
    const body = {
  titulo: form.Titulo,
  descripcion: form.Descripcion,
  proyecto: form.Proyecto,
  responsable: form.Responsable,
  estado: form.Estado,
  prioridad: form.Prioridad,
  fechaInicio: form.FechaInicio || null,
  fechaFin: form.FechaFin || null,
  horas: parseHoras(form.Horas)
};
    try{
      await fetch(
        modal.modo==="crear"?API:`${API}/${modal.recordId}`,
        {method:modal.modo==="crear"?"POST":"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}
      );
      await load();
    } catch {
  const tareaLocal = {
    recordId: modal.modo === "crear" ? `r${Date.now()}` : modal.recordId,
    Id: modal.modo === "crear" ? tareas.length + 1 : undefined,
    Titulo: body.titulo,
    Descripcion: body.descripcion,
    Proyecto: body.proyecto,
    Responsable: body.responsable,
    Estado: body.estado,
    Prioridad: body.prioridad,
    "Fecha inicio": body.fechaInicio || "",
    "Fecha fin": body.fechaFin || "",
    Horas: normalizeHoras(body.horas)
  };

  if (modal.modo === "crear") {
    setTareas(p => [...p, tareaLocal]);
  } else {
    setTareas(p => p.map(x => x.recordId === modal.recordId ? { ...x, ...tareaLocal, Id: x.Id } : x));
  }
}
    setSaving(false);setModal(null);
  };

  const del = async(id)=>{
    if(!confirm("¿Eliminar esta tarea?"))return;
    try{await fetch(`${API}/${id}`,{method:"DELETE"});await load();}
    catch{setTareas(p=>p.filter(x=>x.recordId!==id));}
  };

  const padTop    = device==="phone" ? 50 : 0;
  const padBottom = device==="tablet" ? 68 : 0;

  const appInner = (
    <div style={{display:"flex",width:"100%",height:"100%",background:t.pageBg,color:t.text,fontFamily:FF,overflow:"hidden",position:"relative"}}>
      {device==="desktop"&&<Sidebar view={view} setView={setView} dark={dark} setDark={setDark} device={device} setDevice={setDevice} t={t} count={tareas.length}/>}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0,position:"relative"}}>
        {device==="phone"&&<MobileBar view={view} setView={setView} dark={dark} setDark={setDark} device={device} setDevice={setDevice} t={t} count={tareas.length} drawerOpen={drawerOpen} setDrawerOpen={setDrawer}/>}
        {device==="tablet"&&<TabBar view={view} setView={setView} dark={dark} setDark={setDark} device={device} setDevice={setDevice} t={t}/>}
        <div style={{flex:1,overflowY:"auto",overflowX:"hidden",paddingTop:padTop+20,paddingBottom:padBottom+20,paddingLeft:device==="phone"?14:22,paddingRight:device==="phone"?14:22,boxSizing:"border-box"}}>
          {loading?(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"50vh",flexDirection:"column",gap:14}}>
              <div style={{width:28,height:28,border:`2px solid ${t.border}`,borderTopColor:t.accent,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
              <span style={{color:t.textMuted,fontSize:13}}>Cargando…</span>
            </div>
          ):view==="dashboard"?(
            <Dashboard tareas={tareas} t={t} onNew={openNew} onEditTask={openEdit} setView={setView} device={device}/>
          ):view==="table"?(
            <TableView tareas={tareas} proyectos={proyectos} t={t} onEdit={openEdit} onDelete={del} onNew={openNew} device={device}/>
          ):(
            <KanbanView tareas={tareas} setTareas={setTareas} t={t} onEdit={openEdit} onDelete={del} onNew={openNew} device={device}/>
          )}
        </div>
      </div>
      {modal&&<TaskModal modal={modal} form={form} setForm={setForm} onSave={save} onClose={()=>setModal(null)} saving={saving} proyectos={proyectos} t={t} device={device}/>}
    </div>
  );

  const isPhone=device==="phone", isTablet=device==="tablet", isFramed=isPhone||isTablet;
  const shellBg=dark?"#08090e":"#c6cad8";

  return (
    <>
      <GlobalStyles scrollThumb={t.scrollThumb}/>
      {!isFramed?(
        <div style={{position:"fixed",inset:0,background:t.pageBg,fontFamily:FF}}>{appInner}</div>
      ):(
        <div style={{width:"100%",height:"100%",overflowY:"auto",overflowX:"hidden",background:shellBg,display:"flex",justifyContent:"center",alignItems:"center",padding:"20px 0",boxSizing:"border-box"}}>
          {isPhone&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,flexShrink:0}}>
              <div style={{background:dark?"#1c1f2e":"#2e3040",borderRadius:44,padding:"14px 7px",boxShadow:"0 32px 80px rgba(0,0,0,0.55),inset 0 0 0 1.5px rgba(255,255,255,0.08)"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:7}}>
                  <div style={{width:80,height:20,background:dark?"#0c0e16":"#0d1020",borderRadius:10}}/>
                </div>
                <div style={{width:spec.W,height:spec.H,borderRadius:26,overflow:"hidden",background:t.pageBg}}>{appInner}</div>
                <div style={{display:"flex",justifyContent:"center",marginTop:9}}>
                  <div style={{width:90,height:4,background:"rgba(255,255,255,0.18)",borderRadius:2}}/>
                </div>
              </div>
              <div style={{fontSize:10.5,color:"rgba(255,255,255,0.35)",fontWeight:500,letterSpacing:0.3}}>{spec.W}×{spec.H}px · {spec.label}</div>
            </div>
          )}
          {isTablet&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,flexShrink:0}}>
              <div style={{background:dark?"#1c1f2e":"#2e3040",borderRadius:20,padding:"9px 7px",boxShadow:"0 24px 60px rgba(0,0,0,0.45),inset 0 0 0 1.5px rgba(255,255,255,0.08)"}}>
                <div style={{width:spec.W,height:spec.H,borderRadius:12,overflow:"hidden",background:t.pageBg}}>{appInner}</div>
              </div>
              <div style={{fontSize:10.5,color:"rgba(255,255,255,0.35)",fontWeight:500,letterSpacing:0.3}}>{spec.W}×{spec.H}px · {spec.label}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}