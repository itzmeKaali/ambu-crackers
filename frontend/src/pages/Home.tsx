import { Link } from 'react-router-dom'
export default function Home(){
  return (
    <div>
      <section className='card' style={{background:'linear-gradient(90deg,#fff8e1,#ffe8e8)'}}>
        <div style={{padding:24, display:'grid', gridTemplateColumns:'1.2fr 0.8fr', alignItems:'center', gap:16}}>
          <div>
            <h1>Celebrate Bright with AmbuCrackers</h1>
            <p>Premium Sivakasi fireworks at wholesale prices. Fast delivery, assured quality.</p>
            <div style={{display:'flex', gap:10}}>
              <Link className='btn' to='/shop'>Shop Now</Link>
              <Link className='btn secondary' to='/quick-checkout'>Quick Checkout</Link>
            </div>
          </div>
          <img src='https://images.unsplash.com/photo-1541009179028-2f1a3b83c8f8?q=80&w=1200' alt='Fireworks' style={{width:'100%', borderRadius:12}}/>
        </div>
      </section>
      <section style={{marginTop:16}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
          <div className='card' style={{padding:16}}><b>Best Price</b><p>Massive festive discounts.</p></div>
          <div className='card' style={{padding:16}}><b>Fast Delivery</b><p>Reliable shipping partners.</p></div>
          <div className='card' style={{padding:16}}><b>100% Genuine</b><p>Made in Sivakasi. Quality assured.</p></div>
        </div>
      </section>
    </div>
  )
}
