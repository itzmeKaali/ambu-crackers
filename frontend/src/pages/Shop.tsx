import { useEffect, useState } from 'react'
import { g } from '../api'
import { Product } from '../types'
import ProductCard from '../components/ProductCard'

export default function Shop(){
  const [products,setProducts] = useState<Product[]>([])
  const [category,setCategory] = useState('')
  const [cart,setCart] = useState<Record<string, number>>({})

  useEffect(()=>{ 
    g('/api/products'+(category?`?category=${encodeURIComponent(category)}`:''))
      .then(setProducts) 
  },[category])

  function add(p:Product){ setCart(c=> ({...c, [p.id]:(c[p.id]||0)+1})) }

  const items = products.filter(p=> (cart[p.id]||0)>0).map(p=> ({...p, quantity: cart[p.id]||0}))

  return (
    <div>
      <h2>Shop</h2>
      <div style={{display:'flex', gap:10, marginBottom:10}}>
        <select value={category} onChange={e=>setCategory(e.target.value)}>
          <option value=''>All Categories</option>
          <option value='Sparklers'>Sparklers</option>
          <option value='Flower Pots'>Flower Pots</option>
          <option value='Rockets'>Rockets</option>
          <option value='Chakkars'>Chakkars</option>
          <option value='Bombs'>Bombs</option>
          <option value='Fancy'>Fancy</option>
          <option value='Gift Box'>Gift Box</option>
          <option value='One Sound'>One Sound</option>
          <option value='Lakshmi'>Lakshmi</option>
        </select>
      </div>

      <div className='grid' style={{gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))'}}>
        {products.map(p=> <ProductCard key={p.id} p={p} onAdd={add} />)}
      </div>

      <div style={{marginTop:16, borderTop:'1px solid #eee', paddingTop:12}}>
        <h3>Cart</h3>
        {items.length===0 ? <p>No items yet.</p> : (
          <ul>
            {items.map(it=> <li key={it.id}>{it.name} × {it.quantity}</li>)}
          </ul>
        )}
        <p style={{color:'#666'}}>Proceed to Quick Checkout to finalize your quantities and place order.</p>
      </div>
    </div>
  )
}
