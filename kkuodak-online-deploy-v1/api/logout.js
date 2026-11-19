import {cookie,method} from '../lib/auth.js';export default function handler(req,res){if(!method(req,res,'POST'))return;res.setHeader('Set-Cookie',cookie('',true));res.json({ok:true})}
