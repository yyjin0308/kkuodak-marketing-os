import {gate,method} from '../lib/auth.js';
export default async function handler(req,res){
 if(!gate(req,res)||!method(req,res,'POST'))return;
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'OPENAI_API_KEY 설정이 필요합니다.'});
 const prompt=String(req.body?.prompt||'').trim().slice(0,1200);
 const mood=String(req.body?.mood||'cream').slice(0,30);
 if(!prompt)return res.status(400).json({error:'배경 제작 요청을 입력하세요.'});
 const palette={cream:'warm cream, soft ivory and beige',dark:'deep navy, dramatic studio lighting',mint:'fresh mint and pastel green'}[mood]||'warm cream';
 const instruction=`Create a polished, premium 4:5 portrait background plate for a Korean healthy snack Instagram advertisement. ${palette} color palette. Campaign concept: ${prompt}. Photorealistic commercial art direction, sophisticated food-brand styling, elegant composition, depth, subtle light and shadows. Keep the TOP 40 percent mostly quiet and low-detail for Korean headline typography. Keep a generous clear area in the center-bottom for a real product package to be composited later. IMPORTANT: NO product packages, NO logos, NO brand names, NO text, NO letters, NO numbers, NO watermarks, NO mockups of packaging. Background only.`;
 try{
  const response=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-image-1-mini',prompt:instruction,size:'1024x1536',quality:'low',output_format:'jpeg'}),signal:AbortSignal.timeout(115000)});
  const data=await response.json();if(!response.ok)return res.status(response.status===429?429:502).json({error:'이미지 API 오류 '+response.status+': '+String(data?.error?.message||'요청 실패').slice(0,200)});
  const b64=data?.data?.[0]?.b64_json;if(!b64)return res.status(502).json({error:'이미지 데이터가 반환되지 않았습니다.'});
  return res.status(200).json({image:'data:image/jpeg;base64,'+b64});
 }catch(e){console.error('design-image:',e.message,e.cause?.code);return res.status(502).json({error:'이미지 생성 연결 실패: '+e.message})}
}
