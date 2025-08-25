import { useState } from 'react'
import { j } from '../api'
export default function Contact(){
  const [f,setF] = useState({name:'', email:'', phone:'', message:''})
  async function submit(){
    await j('/api/enquiry','POST', f)
    alert('Thanks! We will reach out shortly.')
    setF({name:'', email:'', phone:'', message:''})
  }
  return (
    <div>
      <h2>Contact / Enquiry</h2>
      <div style={{maxWidth:520}}>
        <input placeholder='Name' value={f.name} onChange={e=>setF({...f, name:e.target.value})}/>
        <input placeholder='Email' value={f.email} onChange={e=>setF({...f, email:e.target.value})}/>
        <input placeholder='Phone' value={f.phone} onChange={e=>setF({...f, phone:e.target.value})}/>
        <textarea placeholder='Message' value={f.message} onChange={e=>setF({...f, message:e.target.value})}/>
        <button className='btn' onClick={submit}>Send</button>
      </div>
    </div>
  )
}
