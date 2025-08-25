import { useEffect, useState } from 'react'
import { g } from '../api'
export default function PriceList(){
  const [url,setUrl] = useState<string>('')
  useEffect(()=>{ g('/api/price-list-url').then(r=> setUrl(r.url)) },[])
  return (
    <div>
      <h2>Price List</h2>
      {url ? <iframe src={url} style={{width:'100%', height:600, border:'1px solid #eee', borderRadius:8}}/> : <p>Loading…</p>}
      {url && <p style={{marginTop:10}}><a className='btn' href={url}>Download PDF</a></p>}
    </div>
  )
}
