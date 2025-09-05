import { useState } from "react";
import { j } from "../api";
import Contactimg from "../assets/contactimg.jpg";

export default function Contact() {
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [err, setErr] = useState<any>({});
  const [success, setSuccess] = useState("");

  async function submit() {
    let e: any = {};
    if (!f.name.trim()) e.name = "Name is required";
    if (!f.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      e.email = "Enter a valid email";
    if (!f.phone.trim()) e.phone = "Phone is required";
    if (!f.message.trim()) e.message = "Message is required";

    setErr(e);
    setSuccess("");
    if (Object.keys(e).length > 0) return;

    await j("/api/enquiry", "POST", f);
    setF({ name: "", email: "", phone: "", message: "" });
    setErr({});
    setSuccess("✅ Thank you! We will reach out shortly.");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 px-3 py-8">
      <div className="w-full max-w-2xl md:max-w-4xl mx-auto">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-red-700 mb-6">
          Contact Us
        </h2>

        {/* Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image (show on all devices now) */}
          <div className="h-40 md:h-auto">
            <img
              src={Contactimg}
              alt="Contact"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Right Side Form */}
          <div className="p-5 md:p-7 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              Get in Touch
            </h3>

            <div className="flex flex-col gap-3">
              {/* Name */}
              <div>
                <input
                  className={`w-full rounded-md px-3 py-2 text-sm border ${
                    err.name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-1 focus:ring-red-400`}
                  placeholder="Your Name"
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                />
                {err.name && (
                  <p className="text-red-500 text-xs mt-1">{err.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  className={`w-full rounded-md px-3 py-2 text-sm border ${
                    err.email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-1 focus:ring-red-400`}
                  placeholder="Your Email"
                  value={f.email}
                  onChange={(e) => setF({ ...f, email: e.target.value })}
                />
                {err.email && (
                  <p className="text-red-500 text-xs mt-1">{err.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <input
                  className={`w-full rounded-md px-3 py-2 text-sm border ${
                    err.phone ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-1 focus:ring-red-400`}
                  placeholder="Your Phone"
                  value={f.phone}
                  onChange={(e) => setF({ ...f, phone: e.target.value })}
                />
                {err.phone && (
                  <p className="text-red-500 text-xs mt-1">{err.phone}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <textarea
                  rows={3}
                  className={`w-full rounded-md px-3 py-2 text-sm border ${
                    err.message ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-1 focus:ring-red-400 resize-none`}
                  placeholder="Your Message"
                  value={f.message}
                  onChange={(e) => setF({ ...f, message: e.target.value })}
                />
                {err.message && (
                  <p className="text-red-500 text-xs mt-1">{err.message}</p>
                )}
              </div>

              {/* Success */}
              {success && (
                <p className="text-green-600 text-sm mt-1">{success}</p>
              )}

              {/* Button */}
              <button
                className="mt-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm font-medium rounded-md shadow hover:shadow-md hover:scale-[1.02] active:scale-95 transition-transform"
                onClick={submit}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
