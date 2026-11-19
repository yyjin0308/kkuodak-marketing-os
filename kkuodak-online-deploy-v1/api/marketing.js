import {gate} from '../lib/auth.js';
import {readState,writeState} from '../lib/db.js';
const initial=()=>({goals:{},contents:[],campaigns:[],daily:[],reports:[]});
const clean=s=>({goals:s?.goals&&typeof s.goals==='object'&&!Array.isArray(s.goals)?s.goals:{},contents:Array.isArray(s?.contents)?s.contents:[],campaigns:Array.isArray(s?.campaigns)?s.campaigns:[],daily:Array.isArray(s?.daily)?s.daily:[],reports:Array.isArray(s?.reports)?s.reports:[]});
export default async function handler(req,res){if(!gate(req,res))return;res.setHeader('Cache-Control','no-store');try{
 if(req.method==='GET'){const s=await readState();return res.json(clean(s.marketing||initial()))}
 if(req.method!=='POST')return res.status(405).json({error:'허용되지 않은 요청'});
 const incoming=req.body;if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))return res.status(400).json({error:'잘못된 입력'});
 const d=clean(incoming);if(['contents','campaigns','daily','reports'].some(k=>d[k].length>1000))return res.status(400).json({error:'데이터 수 제한 초과'});
 if(Buffer.byteLength(JSON.stringify(d),'utf8')>350000)return res.status(413).json({error:'저장 데이터가 너무 큽니다.'});
 const s=await readState();s.marketing=d;await writeState(s);return res.json({ok:true});
 }catch(e){console.error('marketing:',e);return res.status(500).json({error:'마케팅 데이터 처리에 실패했습니다.'})}}
