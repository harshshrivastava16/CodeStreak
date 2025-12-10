import React from "react";
import PublicNavbar from "../components/PublicNavbar";

const ContactUs = () => {
  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#0A0A0C] text-white overflow-x-hidden"
      style={{ fontFamily: "'Space Grotesk', 'Noto Sans', sans-serif" }}
    >
      <PublicNavbar />

      {/* APPLE-STYLE LIGHTING */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-white/10 via-blue-400/10 to-purple-500/10 blur-[180px] opacity-70"></div>
      <div className="absolute top-20 left-1/3 w-[600px] h-[600px] bg-white/10 rounded-full blur-[200px] opacity-40" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-[180px] opacity-40" />

      <main className="flex-1 px-6 sm:px-10 lg:px-20 pt-[5rem] pb-28 max-w-7xl mx-auto relative z-10">

        {/* HEADING */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-gray-400 text-lg mt-5 max-w-2xl mx-auto">
            We’d love to hear from you. Whether you have questions, suggestions, or need help — we're here for you.
          </p>
        </div>

        {/* GRID */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-14 max-w-5xl mx-auto">

          {/* FORM */}
          <form className="
            space-y-6 p-10 rounded-3xl bg-white/5 border border-white/10 
            backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.5)]
          ">

            <input
              type="text"
              placeholder="Your Name"
              className="
                w-full rounded-xl px-4 py-3 bg-zinc-900 border border-white/10 text-white
                placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:outline-none
              "
            />

            <input
              type="email"
              placeholder="Your Email"
              className="
                w-full rounded-xl px-4 py-3 bg-zinc-900 border border-white/10 text-white
                placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none
              "
            />

            <input
              type="text"
              placeholder="Subject"
              className="
                w-full rounded-xl px-4 py-3 bg-zinc-900 border border-white/10 text-white
                placeholder-gray-500 focus:ring-2 focus:ring-lime-400 focus:outline-none
              "
            />

            <textarea
              placeholder="Your Message"
              className="
                w-full h-40 resize-none rounded-xl px-4 py-3 bg-zinc-900 border border-white/10 text-white
                placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:outline-none
              "
            />

            <button
              type="submit"
              className="
                w-full rounded-xl py-3 text-lg font-semibold text-black 
                bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500
                hover:opacity-90 transition-all
              "
            >
              Send Message
            </button>
          </form>

          {/* CONTACT INFO */}
          <div className="space-y-8">

            {/* Card */}
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-[0_12px_50px_rgba(0,0,0,0.4)]">
              <h3 className="text-2xl font-semibold mb-2">Reach Out</h3>
              <p className="text-gray-400">
                Fill out the form and we’ll respond within 24 hours.  
                We’re here to help with anything you need.
              </p>
            </div>

            {/* Email */}
            <a
              href="mailto:support@codestreak.com"
              className="flex items-center gap-4 group"
            >
              <div className="
                w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center 
                text-gray-400 group-hover:bg-lime-400 group-hover:text-black transition-all
              ">
                <svg
                  fill="currentColor"
                  height="22"
                  width="22"
                  viewBox="0 0 256 256"
                >
                  <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z" />
                </svg>
              </div>
              <span className="text-gray-400 group-hover:text-white transition-all">
                support@codestreak.com
              </span>
            </a>

            {/* Help Center */}
            <a
              href="#"
              className="flex items-center gap-4 group"
            >
              <div className="
                w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center 
                text-gray-400 group-hover:bg-blue-400 group-hover:text-black transition-all
              ">
                <svg
                  fill="currentColor"
                  height="22"
                  width="22"
                  viewBox="0 0 256 256"
                >
                  <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                </svg>
              </div>
              <span className="text-gray-400 group-hover:text-white transition-all">
                Help Center
              </span>
            </a>

            {/* Socials */}
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-[0_12px_50px_rgba(0,0,0,0.4)]">
              <h3 className="text-2xl font-semibold mb-4">Follow Us</h3>
              <div className="flex items-center gap-4">
                <a className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all" href="#">
                  <svg fill="currentColor" height="22" width="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all" href="#">
                  <svg fill="currentColor" height="22" width="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
