import React from 'react'
import { Link } from 'react-router-dom'

const Products = () => {
  const products = [
    { id: 1, name: 'Product 1', price: '$99' },
    { id: 2, name: 'Product 2', price: '$149' },
    { id: 3, name: 'Product 3', price: '$199' }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {products.map(product => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{product.name}</h3>
            <p className="text-2xl font-bold text-blue-600 mb-4">{product.price}</p>
            <Link 
              to={`/products/${product.id}`}
              className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white no-underline rounded-md hover:bg-blue-600 transition-colors"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products