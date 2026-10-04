import { env } from 'cloudflare:workers';
import { defaults, type Config, type Court, price, today, validDate, timeAllowed, hour, addDays } from './domain';
import { getChatGPTUser } from '../app/chatgpt-auth';
class ApiError extends Error { constructor(public status:number,message:string){super(message);} }
function fail(status:number,msg:string):never {throw new ApiError(status,msg);}
const db=()=>{if(!env.DB)fail(503,'A agenda está temporariamente indisponível. Tente novamente.');return env.DB!;};
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
async function config():Promise<Config> { const row=await db().prepare('SELECT value FROM settings WHERE key = ?').bind('arena').first<{value:string}>();return {...defaults,...(row?JSON.parse(row.value):{})}; }
async function user() { const u=await getChatGPTUser();if(!u)fail(401,'Entre na sua conta para continuar.');return u!; }
async function session() {
 const u=await getChatGPTUser();if(!u)return {user:null,admin:false};
 // Bootstrap is enabled only for the initial owner-private review deployment.
 if((env as unknown as Record<string,string>).PRIVATE_REVIEW==='1') await db().prepare("INSERT OR IGNORE INTO staff (key,user,role) VALUES ('owner',?,'admin')").bind(u.userId).run();
 const invitation=await db().prepare('SELECT role FROM invitations WHERE email = ?').bind(u.email.toLowerCase()).first<{role:string}>();
 if(invitation)await db().prepare('INSERT INTO staff (key,user,role) VALUES (?,?,?) ON CONFLICT(user) DO UPDATE SET role = excluded.role WHERE staff.key != ?').bind('team:'+u.email.toLowerCase(),u.userId,invitation.role,'owner').run();
 const role=await db().prepare('SELECT role FROM staff WHERE user = ?').bind(u.userId).first<{role:string}>();
 return {user:{name:u.displayName,email:u.email},admin:!!role,role:role?.role};
}
async function admin() { const u=await user();const row=await db().prepare('SELECT role FROM staff WHERE user = ?').bind(u.userId).first<{role:string}>();if(!row)fail(403,'Este acesso é exclusivo da equipe Mayer.');return {...u,role:row.role}; }
const log=(actor:string,action:string,subject:string)=>db().prepare('INSERT INTO audit (id,actor,action,subject,created) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),actor,action,subject,new Date().toISOString());
async function reserve(body:Record<string,unknown>,actor:string,adminMode=false) {
 const cfg=await config(), court=body.court as Court,date=String(body.date||''),start=Number(body.start),duration=Number(body.duration),weeks=adminMode?Number(body.weeks||1):1;
 if(!Number.isInteger(weeks)||weeks<1||weeks>12)fail(400,'Escolha entre 1 e 12 semanas.');
 if(!['fut5','fut7'].includes(court)||!timeAllowed(date,start,duration,cfg))fail(400,'Escolha um horário futuro disponível, dentro do funcionamento da arena.');
 const blocked=adminMode&&body.kind==='blocked',name=String(body.name||'').trim(),phone=String(body.phone||'').replace(/\D/g,''),email=String(body.email||'').trim();
 if(!blocked&&(name.length<3||name.length>100||!/^(\d{10,13})$/.test(phone)||!/^\S+@\S+\.\S+$/.test(email)||email.length>150))fail(400,'Confira seu nome, telefone com DDD e e-mail.');
 const statements:D1PreparedStatement[]=[],rows=[];
 for(let w=0;w<weeks;w++) {
  const day=addDays(date,w*7);if(!timeAllowed(day,start,duration,cfg))fail(400,'Uma das datas da recorrência está fora do período permitido.');
  const id=crypto.randomUUID(),code='MYR-'+crypto.randomUUID().slice(0,8).toUpperCase(),total=blocked?0:Math.round(price(court,start,duration,cfg)*100);
  const row={id,code,court,date:day,start,duration,name:blocked?'Horário bloqueado':name,phone:blocked?'':phone,email:blocked?'':email,total,status:blocked?'blocked':'confirmed',payment:blocked?'none':'pending',kind:blocked?'blocked':'booking',note:String(body.note||'').slice(0,300),created:new Date().toISOString()};rows.push(row);
  statements.push(db().prepare('INSERT INTO bookings (id,code,owner,court,date,start,duration,name,phone,email,total,status,payment,kind,note,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,code,actor,court,day,start,duration,row.name,row.phone,row.email,total,row.status,row.payment,row.kind,row.note,row.created));
  for(let i=start;i<start+duration;i++)statements.push(db().prepare('INSERT INTO occupancy (court,date,slot,booking) VALUES (?,?,?,?)').bind(court,day,i,id));
  statements.push(log(actor,blocked?'block':'reserve',id));
 }
 try {await db().batch(statements);}catch(e){if(/UNIQUE|constraint/i.test(String(e)))fail(409,'Um dos horários acabou de ser reservado. Escolha outro horário. Nenhuma reserva desta operação foi criada.');throw e;}
 return {...rows[0],recurrences:rows.length};
}
export async function handle(req:Request) {
 try {
 const url=new URL(req.url),path=url.pathname.replace(/^\/api\//,''),method=req.method;
 if(method!=='GET') {const origin=req.headers.get('origin');if(!origin||origin!==url.origin)fail(403,'Origem da solicitação inválida.');if(!req.headers.get('content-type')?.includes('application/json'))fail(415,'Envie os dados em JSON.');const len=Number(req.headers.get('content-length')||0);if(len>16000)fail(413,'Solicitação muito grande.');}
 if(method==='GET'&&path==='session')return json(await session());
 if(method==='GET'&&path==='config')return json(await config());
 if(method==='GET'&&path==='availability') {
  const cfg=await config(),court=url.searchParams.get('court') as Court,date=url.searchParams.get('date')||today(),duration=Number(url.searchParams.get('duration')||1);
  if(!['fut5','fut7'].includes(court)||!validDate(date)||date>addDays(today(),90)||!Number.isInteger(duration)||duration<1||duration>3)fail(400,'Campo, data ou duração inválida.');
  const occupied=await db().prepare('SELECT slot FROM occupancy WHERE court = ? AND date = ?').bind(court,date).all<{slot:number}>();
  const slots=[];for(let start=cfg.open;start<cfg.close;start++){const allowed=timeAllowed(date,start,duration,cfg),busy=Array.from({length:duration},(_,i)=>start+i).some(i=>occupied.results.some(r=>r.slot===i));slots.push({start,available:allowed&&!busy,busy,price:price(court,start,duration,cfg)});}
  return json({slots});
 }
 if(method==='GET'&&path==='bookings') {const u=await user();return json((await db().prepare("SELECT id,code,court,date,start,duration,name,phone,email,total,status,payment,kind,note,created FROM bookings WHERE owner = ? AND kind = 'booking' ORDER BY date DESC,start DESC").bind(u.userId).all()).results);}
 if(method==='POST'&&path==='bookings') {const u=await user();return json(await reserve(await req.json(),u.userId),201);}
 if(path.startsWith('bookings/')&&method==='PATCH') {
  const u=await user(),id=path.split('/')[1],row=await db().prepare('SELECT * FROM bookings WHERE id = ? AND owner = ?').bind(id,u.userId).first<Record<string,unknown>>();if(!row)fail(404,'Reserva não encontrada.');
  const cfg=await config();if(row.status==='cancelled')return json({ok:true});
  if(row.payment==='paid')fail(400,'Para cancelar uma reserva paga e acertar o reembolso, entre em contato com a arena.');
  if(Date.parse(`${row.date}T${hour(Number(row.start))}:00-03:00`)-Date.now()<cfg.cancelHours*3600000)fail(400,`O cancelamento online exige ${cfg.cancelHours} horas de antecedência. Entre em contato com a arena.`);
  await db().batch([db().prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").bind(id),db().prepare('DELETE FROM occupancy WHERE booking = ?').bind(id),log(u.userId,'cancel',id)]);return json({ok:true});
 }
 if(path.startsWith('admin/')) {
  const u=await admin();
  if((path==='admin/config'||path==='admin/team'||path==='admin/audit')&&u.role!=='admin')fail(403,'Apenas o administrador pode gerenciar configurações e equipe.');
  if(path==='admin/team'&&method==='GET')return json((await db().prepare('SELECT email,role FROM invitations ORDER BY email').all()).results);
  if(path==='admin/team'&&method==='POST') {
   const b=await req.json() as {email:string;role:string},email=String(b.email||'').trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email)||email.length>150||!['admin','staff'].includes(b.role))fail(400,'Informe um e-mail válido e o nível de acesso.');
   if(email===u.email.toLowerCase())fail(400,'O acesso do proprietário é permanente.');
   await db().batch([db().prepare('INSERT INTO invitations (email,role) VALUES (?,?) ON CONFLICT(email) DO UPDATE SET role = excluded.role').bind(email,b.role),db().prepare("UPDATE staff SET role = ? WHERE key = ? AND key != 'owner'").bind(b.role,'team:'+email),log(u.userId,'invite',email)]);return json({ok:true});
  }
  if(path==='admin/team'&&method==='PATCH') {const b=await req.json() as {email:string},email=String(b.email||'').toLowerCase();await db().batch([db().prepare('DELETE FROM invitations WHERE email = ?').bind(email),db().prepare("DELETE FROM staff WHERE key = ? AND key != 'owner'").bind('team:'+email),log(u.userId,'remove-staff',email)]);return json({ok:true});}
  if(method==='GET'&&path==='admin/bookings') {const date=url.searchParams.get('date'),days=Number(url.searchParams.get('days')||1);if(date&&(!validDate(date)||![1,7].includes(days)))fail(400,'Período inválido.');const stmt=db().prepare(date?'SELECT * FROM bookings WHERE date BETWEEN ? AND ? ORDER BY date,start,court':'SELECT * FROM bookings ORDER BY date DESC,start DESC LIMIT 500');return json((await(date?stmt.bind(date,addDays(date,days-1)):stmt).all()).results);}
  if(method==='POST'&&path==='admin/bookings')return json(await reserve(await req.json(),u.userId,true),201);
  if(method==='PUT'&&path==='admin/config') {
   const b=await req.json() as Config;
   if(!Number.isInteger(b.open)||!Number.isInteger(b.close)||b.open<0||b.close>24||b.open>=b.close||!Array.isArray(b.days)||!b.days.length||b.days.some(d=>!Number.isInteger(d)||d<0||d>6)||[b.fut5,b.fut7,b.fut5Peak,b.fut7Peak].some(v=>!Number.isFinite(v)||v<0||v>10000)||!Number.isInteger(b.peak)||b.peak<0||b.peak>24||!Number.isInteger(b.minNotice)||b.minNotice<0||b.minNotice>72||!Number.isInteger(b.cancelHours)||b.cancelHours<0||b.cancelHours>168)fail(400,'Confira os horários, dias de funcionamento e valores.');
   const value={...b,address:String(b.address||'').slice(0,250),phone:String(b.phone||'').replace(/\D/g,'').slice(0,13),hero:String(b.hero||defaults.hero),demo:Boolean(b.demo)};
   if(!value.hero.startsWith('/images/')&&!/^https:\/\//.test(value.hero))fail(400,'Use uma imagem HTTPS ou um arquivo da pasta images.');
   await db().batch([db().prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind('arena',JSON.stringify(value)),log(u.userId,'settings','arena')]);return json(value);
  }
  if(method==='PATCH'&&path.startsWith('admin/bookings/')) {
   const id=path.split('/')[2],b=await req.json() as Record<string,unknown>,row=await db().prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first<Record<string,unknown>>();if(!row)fail(404,'Reserva não encontrada.');
   if(b.action==='cancel') {await db().batch([db().prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").bind(id),db().prepare('DELETE FROM occupancy WHERE booking = ?').bind(id),log(u.userId,'admin-cancel',id)]);return json({ok:true});}
   if(b.action==='payment') {if(row.status!=='confirmed'||row.kind!=='booking')fail(400,'Esta reserva não permite receber pagamento.');await db().batch([db().prepare('UPDATE bookings SET payment = ? WHERE id = ?').bind(b.paid?'paid':'pending',id),log(u.userId,'payment',id)]);return json({ok:true});}
   if(b.action==='reschedule') {
    if(row.status==='cancelled')fail(400,'Uma reserva cancelada não pode ser remarcada.');
    const cfg=await config(),date=String(b.date),start=Number(b.start),duration=Number(row.duration),court=row.court as Court;
    if(!timeAllowed(date,start,duration,cfg))fail(400,'O novo horário está fora do funcionamento ou antecedência permitida.');
    const statements=[db().prepare('DELETE FROM occupancy WHERE booking = ?').bind(id)];for(let i=start;i<start+duration;i++)statements.push(db().prepare('INSERT INTO occupancy (court,date,slot,booking) VALUES (?,?,?,?)').bind(court,date,i,id));
    const total=row.kind==='blocked'?0:Math.round(price(court,start,duration,cfg)*100);if(row.payment==='paid'&&total!==row.total)fail(400,'Para alterar o valor de uma reserva paga, ajuste o pagamento primeiro.');
    statements.push(db().prepare('UPDATE bookings SET date = ?, start = ?, total = ? WHERE id = ?').bind(date,start,total,id),log(u.userId,'reschedule',id));
    try{await db().batch(statements);}catch(e){if(/UNIQUE|constraint/i.test(String(e)))fail(409,'O novo horário já está ocupado. A reserva original foi mantida.');throw e;}return json({ok:true});
   }
  }
  if(method==='GET'&&path==='admin/audit')return json((await db().prepare('SELECT action,subject,created FROM audit ORDER BY created DESC LIMIT 30').all()).results);
 }
 fail(404,'Página não encontrada.');
 }catch(e){if(e instanceof ApiError)return json({error:e.message},e.status);console.error('Mayer API',e);return json({error:'Não foi possível concluir. Tente novamente em instantes.'},500);}
}
