export default function TableQty({value,onChange}:{value:number,onChange:(n:number)=>void}){
  return (
    <div style={{display:'inline-flex', gap:6}}>
      <button className='btn secondary' onClick={()=>onChange(Math.max(0, value-1))}>-</button>
      <input style={{width:70}} type='number' value={value} onChange={e=>onChange(Math.max(0, parseInt(e.target.value||'0')))} />
      <button className='btn' onClick={()=>onChange(value+1)}>+</button>
    </div>
  )
}
