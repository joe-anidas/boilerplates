import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate('/products')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Product Detail</h1>
      <p className="text-lg text-gray-600 mb-8">Showing details for product ID: {id}</p>
      <button 
        onClick={handleGoBack}
        className="px-4 py-2 bg-gray-500 text-white border-none rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
      >
        Back to Products
      </button>
    </div>
  )
}

export default ProductDetail