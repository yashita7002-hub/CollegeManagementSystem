import React from 'react'

function forgotPassword() {
    
  return (
    <>
   

      {/* Card */}
      <div className="relative z-10 bg-white w-[400px] p-8 rounded-xl shadow-2xl text-center">

        {/* Logo */}
        <img src="/NitLogo.jpg" className="w-24 mx-auto mb-4" alt="logo" />

        {/* 👇 Clickable Heading */}
        <h1 
         
        >
          National Institute of Technology
        </h1>

        <p className="text-sm text-gray-500 mb-4">JAMSHEDPUR</p>

        {/* Radio Buttons */}
      
        <button className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition">
          Continue
        </button>
      </div>

      

 
    </>
  )
}

export default forgotPassword