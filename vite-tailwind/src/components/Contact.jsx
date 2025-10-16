import React from 'react'

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
      <p className="text-lg text-gray-600 mb-8">Get in touch with our team.</p>
      <form className="flex flex-col gap-4 max-w-lg">
        <input 
          type="text" 
          placeholder="Your Name" 
          className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input 
          type="email" 
          placeholder="Your Email" 
          className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <textarea 
          placeholder="Your Message"
          rows="4"
          className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
        ></textarea>
        <button 
          type="submit"
          className="px-3 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer hover:bg-green-600 transition-colors font-medium"
        >
          Send Message
        </button>
      </form>
    </div>
  )
}

export default Contact