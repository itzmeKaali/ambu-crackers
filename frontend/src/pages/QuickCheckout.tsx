import { useEffect, useState } from 'react'
import { g, j } from '../api'
import { Product } from '../types'
import TableQty from '../components/TableQty'

export default function QuickCheckout(){
  const [products,setProducts] = useState<Product[]>([])
  const [qty,setQty] = useState<Record<string, number>>({})
  const [cust,setCust] = useState({name:'', email:'', phone:'', address:''})

  useEffect(()=>{ g('/api/products').then(setProducts) },[])

  const rows = products.map(p=> ({...p, quantity: qty[p.id]||0, amount: (qty[p.id]||0)*p.price }))
  const total = rows.reduce((s,r)=> s + r.amount, 0)

  async function placeOrder(){
    const items = rows.filter(r=> r.quantity>0).map(r=> ({ id:r.id, name:r.name, mrp:r.mrp, price:r.price, quantity:r.quantity }))
    if(items.length===0){ alert('Add at least one item'); return }
    const payload = {
      customer_name: cust.name,
      customer_email: cust.email,
      customer_phone: cust.phone,
      customer_address: cust.address,
      items, total
    }
    const res = await j('/api/orders/quick-checkout','POST',payload)
    alert(`Order placed! ID: ${res.order_id}`)
  }

  return (
    <div>
      <h2>Quick Checkout</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <div>
          <h3>Customer Details</h3>
          <input placeholder='Name' value={cust.name} onChange={e=>setCust({...cust, name:e.target.value})}/>
          <input placeholder='Email' value={cust.email} onChange={e=>setCust({...cust, email:e.target.value})}/>
          <input placeholder='Phone' value={cust.phone} onChange={e=>setCust({...cust, phone:e.target.value})}/>
          <textarea placeholder='Address' value={cust.address} onChange={e=>setCust({...cust, address:e.target.value})}/>
        </div>
        <div>
          <h3>Items</h3>
          <table className='table'>
            <thead><tr><th>Product</th><th>MRP</th><th>Ambu Price</th><th>Qty</th><th>Amount</th></tr></thead>
            <tbody>
              {rows.map(r=> (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>₹{r.mrp}</td>
                  <td>₹{r.price}</td>
                  <td><TableQty value={r.quantity} onChange={(n)=> setQty(q=> ({...q, [r.id]: n}))}/></td>
                  <td>₹{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className='sticky-total'><b>Total: ₹{total}</b> <button className='btn' onClick={placeOrder}>Place Order</button></div>
        </div>
      </div>
    </div>
  )
}
