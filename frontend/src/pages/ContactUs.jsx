import { useState } from "react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send message.");
      }
    } catch (err) {
      setError("Failed to send message.");
    }
  };

  return (
    <>
      {/* NavBar */}
      <nav className="w-full px-6 py-6 bg-[#18181b] border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a
            href="/"
            className="text-3xl font-extrabold bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            CodeStreak
          </a>
          <div className="space-x-8 text-lg font-medium hidden sm:flex">
            {[
              { label: "Features", href: "/features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Contact Us", href: "/contact-us" }
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Contact Form */}
      <div className="min-h-[calc(100vh-88px)] bg-[#18181b] flex items-center justify-center px-6 py-16">
        <div className="bg-gray-900 rounded-3xl shadow-xl max-w-3xl w-full p-8 sm:p-10 text-white">
          <h1 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            Contact Us
          </h1>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2 font-semibold">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2 font-semibold">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              {error && <p className="text-red-500 font-medium">{error}</p>}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 rounded-full font-bold text-black hover:scale-105 transition-transform"
              >
                Send Message
              </button>
            </form>
          ) : (
            <div className="text-center text-2xl font-semibold text-lime-400">
              Thank you for contacting us! We'll get back to you soon.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactUs;
