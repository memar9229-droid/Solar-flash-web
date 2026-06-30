    export default function handler(req, res) {
  res.setHeader("Content-Type","application/json");
  res.setHeader("Access-Control-Allow-Origin","*");
  return res.status(200).json({ok:true,route:req.url,ts:new Date().toISOString(),
    env:{supabase:!!process.env.SUPABASE_URL,helius:!!process.env.HELIUS_API_KEY}});
}

    
