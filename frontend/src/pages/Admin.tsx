import { useEffect, useState } from 'react'
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from '../firebase'
import { g, j } from '../api'
import { Product } from '../types'

export default function Admin(){
  const [user,setUser] = useState<any>(null)
  const [token,setToken] = useState<string>('')
  const [me,setMe] = useState<any>(null)
  const [products,setProducts] = useState<Product[]>([])
  const [form,setForm] = useState<Partial<Product>>({ is_active: true })
  const [file,setFile] = useState<File|null>(null)

  useEffect(()=> onAuthStateChanged(auth, async u=>{
    setUser(u)
    if(u) {
      const t = await u.getIdToken()
      setToken(t)
      const m = await g('/api/me', t).catch(()=>null)
      setMe(m)
      const list = await g('/api/products')
      setProducts(list)
    } else {
      setMe(null); setToken('')
    }
  }),[])

  if(!user){
    return <AuthBox/>
  }

  if(!me?.admin){
    return (
      <div className="container">
        <div className="admin-error">
          <p>Logged in as {user.email}. This account is not an admin.</p>
          <button className='btn' onClick={()=>signOut(auth)}>Logout</button>
        </div>
      </div>
    )
  }

  async function uploadImage(): Promise<string|undefined>{
    if(!file) return undefined
    const meta = await j('/api/admin/upload-url','POST',{filename:file.name}, token)
    await fetch(meta.upload_url, { method:'PUT', headers:{'Content-Type':'application/octet-stream'}, body:file })
    return meta.public_url as string
  }

  async function save(){
    const image_url = await uploadImage()
    const payload:any = {...form, image_url}
    const p = await j('/api/admin/products','POST', payload, token)
    setProducts([p, ...products])
    setForm({ is_active: true }); setFile(null)
  }

  async function update(p: Product){
    const payload:any = { name:p.name, description:p.description, price:p.price, mrp:p.mrp, category:p.category, is_active:p.is_active }
    await j(`/api/admin/products/${p.id}`,'PUT', payload, token)
    alert('Updated')
  }

  async function remove(id:string){
    await j(`/api/admin/products/${id}`,'DELETE',{}, token)
    setProducts(products.filter(x=> x.id!==id))
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h2>Admin — Products</h2>
        <p className="admin-user-info">
          Logged in as {user.email} 
          <button className='btn secondary' onClick={()=>signOut(auth)}>Logout</button>
        </p>
      </div>
      
      <div className="admin-grid">
        <div className="admin-section">
          <h3>Create New Product</h3>
          <form className="admin-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <div className="form-group">
              <input 
                placeholder='Product Name' 
                value={form.name||''} 
                onChange={e=>setForm({...form, name:e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <textarea 
                placeholder='Description' 
                value={form.description||''} 
                onChange={e=>setForm({...form, description:e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <input 
                  type='text' 
                  placeholder='Category' 
                  value={form.category||''} 
                  onChange={e=>setForm({...form, category:e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <input 
                  type='number' 
                  placeholder='MRP' 
                  value={form.mrp||0} 
                  onChange={e=>setForm({...form, mrp: parseFloat(e.target.value)})}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <input 
                  type='number' 
                  placeholder='Ambu Price' 
                  value={form.price||0} 
                  onChange={e=>setForm({...form, price: parseFloat(e.target.value)})}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type='checkbox' 
                  checked={!!form.is_active} 
                  onChange={e=>setForm({...form, is_active: e.target.checked})}
                />
                <span>Active</span>
              </label>
            </div>
            
            <div className="form-group">
              <input 
                type='file' 
                onChange={e=> setFile(e.target.files?.[0]||null)} 
                accept="image/*"
              />
            </div>
            
            <button className='btn admin-save-btn' type="submit">Save Product</button>
          </form>
        </div>
        
        <div className="admin-section">
          <h3>Existing Products</h3>
          <div className="products-list">
            {products.map(p=> (
              <div key={p.id} className='admin-product-card'>
                <div className="product-form-grid">
                  <div className="form-group">
                    <input 
                      value={p.name} 
                      onChange={e=> (p.name=e.target.value, setProducts([...products]))} 
                      placeholder="Product name"
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      value={p.category||''} 
                      onChange={e=> (p.category=e.target.value, setProducts([...products]))} 
                      placeholder="Category"
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type='number' 
                      value={p.mrp} 
                      onChange={e=> (p.mrp=parseFloat(e.target.value), setProducts([...products]))} 
                      placeholder="MRP"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type='number' 
                      value={p.price} 
                      onChange={e=> (p.price=parseFloat(e.target.value), setProducts([...products]))} 
                      placeholder="Price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input 
                        type='checkbox' 
                        checked={p.is_active} 
                        onChange={e=> (p.is_active=e.target.checked, setProducts([...products]))}
                      />
                      <span>Active</span>
                    </label>
                  </div>
                </div>
                <div className="product-actions">
                  <button className='btn' onClick={()=>update(p)}>Update</button>
                  <button className='btn secondary' onClick={()=>remove(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthBox(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  
  async function login(e:any){ 
    e.preventDefault(); 
    await signInWithEmailAndPassword(auth, email, password) 
  }
  
  return (
    <div className="container">
      <div className="auth-container">
        <form onSubmit={login} className="auth-form">
          <h2>Admin Login</h2>
          <div className="form-group">
            <input 
              placeholder='Email' 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              type="email"
              required
            />
          </div>
          <div className="form-group">
            <input 
              placeholder='Password' 
              type='password' 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required
            />
          </div>
          <button className='btn auth-btn' type='submit'>Login</button>
        </form>
      </div>
    </div>
  )
}
