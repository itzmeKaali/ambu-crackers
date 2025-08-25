import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './styles.css'
import Home from './pages/Home'
import Shop from './pages/Shop'
import QuickCheckout from './pages/QuickCheckout'
import PriceList from './pages/PriceList'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

function Shell(){
  return (
    <div>
      <header className='header'>
        <div className='container' style={{display:'flex', alignItems:'center', gap:14}}>
          <h2 style={{marginRight:16}}>AmbuCrackers</h2>
          <nav style={{display:'flex', gap:12}}>
            <Link to='/'>Home</Link>
            <Link to='/shop'>Shop</Link>
            <Link to='/quick-checkout'>Quick Checkout</Link>
            <Link to='/price-list'>Price List</Link>
            <Link to='/contact'>Contact</Link>
            <Link to='/admin'>Admin</Link>
          </nav>
        </div>
      </header>
      <main className='container'>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/shop' element={<Shop/>}/>
          <Route path='/quick-checkout' element={<QuickCheckout/>}/>
          <Route path='/price-list' element={<PriceList/>}/>
          <Route path='/contact' element={<Contact/>}/>
          <Route path='/admin' element={<Admin/>}/>
        </Routes>
      </main>
      <footer className='footer'><div className='container'>© {new Date().getFullYear()} AmbuCrackers — Sivakasi • Best Price • Fast Delivery</div></footer>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Shell/>
    </BrowserRouter>
  </React.StrictMode>
)
