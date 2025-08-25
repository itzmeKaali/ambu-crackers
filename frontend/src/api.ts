export const API_BASE = import.meta.env.VITE_API_BASE || '/'
export const j = async (path:string, method:string, body?:any, token?:string)=>{
  const res = await fetch(API_BASE+path,{ method, headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) }, body: body?JSON.stringify(body):undefined })
  if(!res.ok) throw new Error(await res.text()); return res.json()
}
export const g = async (path:string, token?:string)=> j(path,'GET',undefined,token)
