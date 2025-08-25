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
    return <div><p>Logged in as {user.email}. This account is not an admin.</p><button className='btn' onClick={()=>signOut(auth)}>Logout</button></div>
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
    <div>
      <h2>Admin — Products</h2>
      <p>Logged in as {user.email} (<button className='btn secondary' onClick={()=>signOut(auth)}>Logout</button>)</p>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <div>
          <h3>Create</h3>
          <input placeholder='Name' value={form.name||''} onChange={e=>setForm({...form, name:e.target.value})}/>
          <textarea placeholder='Description' value={form.description||''} onChange={e=>setForm({...form, description:e.target.value})}/>
          <input type='text' placeholder='Category' value={form.category||''} onChange={e=>setForm({...form, category:e.target.value})}/>
          <input type='number' placeholder='MRP' value={form.mrp||0} onChange={e=>setForm({...form, mrp: parseFloat(e.target.value)})}/>
          <input type='number' placeholder='Ambu Price' value={form.price||0} onChange={e=>setForm({...form, price: parseFloat(e.target.value)})}/>
          <label><input type='checkbox' checked={!!form.is_active} onChange={e=>setForm({...form, is_active: e.target.checked})}/> Active</label>
          <input type='file' onChange={e=> setFile(e.target.files?.[0]||null)} />
          <button className='btn' onClick={save}>Save</button>
        </div>
        <div>
          <h3>Existing</h3>
          {products.map(p=> (
            <div key={p.id} className='card' style={{padding:10, marginBottom:10}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                <input value={p.name} onChange={e=> (p.name=e.target.value, setProducts([...products]))} />
                <input value={p.category||''} onChange={e=> (p.category=e.target.value, setProducts([...products]))} />
                <input type='number' value={p.mrp} onChange={e=> (p.mrp=parseFloat(e.target.value), setProducts([...products]))} />
                <input type='number' value={p.price} onChange={e=> (p.price=parseFloat(e.target.value), setProducts([...products]))} />
                <label><input type='checkbox' checked={p.is_active} onChange={e=> (p.is_active=e.target.checked, setProducts([...products]))}/> Active</label>
              </div>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button className='btn' onClick={()=>update(p)}>Update</button>
                <button className='btn secondary' onClick={()=>remove(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AuthBox(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  async function login(e:any){ e.preventDefault(); await signInWithEmailAndPassword(auth, email, password) }
  return (
    <form onSubmit={login} style={{maxWidth:360}}>
      <h2>Admin Login</h2>
      <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} />
      <button className='btn' type='submit'>Login</button>
    </form>
  )
}
