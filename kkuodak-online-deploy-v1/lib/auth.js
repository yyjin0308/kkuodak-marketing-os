import crypto from 'node:crypto';
const secret=()=>process.env.SESSION_SECRET||'';
const safe=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
export function verifyPassword(value){return Boolean(process.env.ADMIN_PASSWORD)&&safe(value,process.env.ADMIN_PASSWORD)}
export function token(){const expiry=String(Date.now()+7*86400000);const mac=crypto.createHmac('sha256',secret()).update(expiry).digest('hex');return expiry+'.'+mac}
export function authed(req){if(!secret())return false;const cookie=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('kkuodak_session='));if(!cookie)return false;const [expiry,mac]=(cookie.split('=')[1]||'').split('.');if(!expiry||!mac||!/^\d+$/.test(expiry)||Number(expiry)<Date.now())return false;return safe(mac,crypto.createHmac('sha256',secret()).update(expiry).digest('hex'))}
export function gate(req,res){if(!authed(req)){res.status(401).json({error:'로그인이 필요합니다.'});return false}return true}
export function cookie(value,clear=false){return `kkuodak_session=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; ${clear?'Max-Age=0':'Max-Age=604800'}`}
export function method(req,res,allowed){if(req.method!==allowed){res.status(405).json({error:'허용되지 않은 요청입니다.'});return false}return true}
