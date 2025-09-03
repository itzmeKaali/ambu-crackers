import { useState } from 'react'
import { j } from '../api'
import img1 from '../assets/contact-image.jpg';

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' });
  async function submit() {
    await j('/api/enquiry', 'POST', f);
    alert('Thanks! We will reach out shortly.');
    setF({ name: '', email: '', phone: '', message: '' });
  }
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-red-50 via-yellow-50 to-orange-100 py-8 px-2">
      <div className="w-full max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold text-red-600 mb-8 text-center drop-shadow">Contact / Enquiry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/80 rounded-3xl shadow-lg p-6 md:p-10">
          <div className="flex flex-col gap-4">
            <input className="rounded-lg border border-red-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white shadow" placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
            <input className="rounded-lg border border-red-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white shadow" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
            <input className="rounded-lg border border-red-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white shadow" placeholder="Phone" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
            <textarea className="rounded-lg border border-red-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white shadow resize-none min-h-[80px]" placeholder="Message" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} />
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300" onClick={submit}>Send</button>
          </div>
          <div className="flex justify-center items-center">
            <img src={img1} alt="Contact AmbuCrackers" className="rounded-2xl shadow-lg w-full max-w-xs md:max-w-sm object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
