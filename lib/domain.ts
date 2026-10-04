export type Court = 'fut5' | 'fut7';
export type Config = { open: number; close: number; minNotice: number; cancelHours: number; days: number[]; fut5: number; fut7: number; fut5Peak: number; fut7Peak: number; peak: number; address: string; phone: string; demo: boolean; hero: string; };
export const defaults: Config = { open: 8, close: 23, minNotice: 1, cancelHours: 24, days: [0,1,2,3,4,5,6], fut5: 120, fut7: 180, fut5Peak: 150, fut7Peak: 220, peak: 18, address: '', phone: '', demo: true, hero: '/images/mayer-arena.png' };
export type Booking = { id: string; code: string; court: Court; date: string; start: number; duration: number; name: string; phone: string; email: string; total: number; status: string; payment: string; kind: string; note: string; created: string; };
export const money = (n: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n);
export const hour = (n: number) => `${String(n).padStart(2,'0')}:00`;
export const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const dateLabel = (s: string, long = false) => new Date(s+'T12:00:00-03:00').toLocaleDateString('pt-BR',long?{weekday:'long',day:'numeric',month:'long'}:{day:'2-digit',month:'short'});
export function addDays(s: string, n: number) { const d=new Date(s+'T12:00:00-03:00');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10); }
export function price(c: Court,start: number,duration: number,cfg: Config) { let total=0;for(let i=start;i<start+duration;i++)total+=i>=cfg.peak?cfg[c==='fut5'?'fut5Peak':'fut7Peak']:cfg[c];return total; }
export function validDate(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s+'T12:00:00-03:00')) && new Date(s+'T12:00:00-03:00').toISOString().slice(0,10)===s; }
export function timeAllowed(date:string,start:number,duration:number,cfg:Config,now=Date.now()) { return validDate(date) && Number.isInteger(start) && Number.isInteger(duration) && duration>=1 && duration<=3 && start>=cfg.open && start+duration<=cfg.close && cfg.days.includes(new Date(date+'T12:00:00-03:00').getDay()) && Date.parse(`${date}T${hour(start)}:00-03:00`)>=now+cfg.minNotice*3600000 && date<=addDays(today(),90); }
