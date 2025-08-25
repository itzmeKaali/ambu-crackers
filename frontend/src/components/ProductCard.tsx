import { Product } from '../types'
export default function ProductCard({p, onAdd}:{p:Product, onAdd:(p:Product)=>void}){
  return (
    <div className='card'>
      {p.image_url && <img src={p.image_url} alt={p.name}/>} 
      <div style={{padding:12}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <h3 style={{margin:'6px 0'}}>{p.name}</h3>
          {p.category && <span className='badge'>{p.category}</span>}
        </div>
        <p style={{minHeight:40}}>{p.description}</p>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <b>₹{p.price}</b>
          {p.mrp ? <s style={{color:'#888'}}>₹{p.mrp}</s> : null}
          <button className='btn' style={{marginLeft:'auto'}} onClick={()=>onAdd(p)}>Add</button>
        </div>
      </div>
    </div>
  )
}
