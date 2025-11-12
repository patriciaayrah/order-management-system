'use client';

import { useState } from 'react';
import { formatCurrency } from '../utilities/formatCurrency';

export default function ProductList({ products, addToCart }) {
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, quantity) => {
    setQuantities({
      ...quantities,
      [productId]: quantity
    });
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > product.stock_quantity) {
      alert('Not enough stock available');
      return;
    }
    addToCart(product, quantity);
    setQuantities({
      ...quantities,
      [product.id]: 1 // Reset to 1 after adding
    });
  };

  return (
    <div className="space-y-6">
      {products.map(product => {
        const isOutOfStock = product.stock_quantity === 0;
        return (
          <div
            key={product.id}
            className={`bg-white rounded-xl shadow-lg p-6 border-l-4 transition-all duration-300 hover:shadow-xl ${
              isOutOfStock ? 'border-red-500 bg-red-50 opacity-75' : 'border-blue-500 hover:border-blue-600'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${isOutOfStock ? 'text-red-700' : 'text-indigo-800'}`}>
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-3 leading-relaxed">{product.description}</p>
                <p className="text-2xl font-semibold text-green-700 mb-2">₱{formatCurrency(product.price)}</p>
                <p className={`font-medium ${isOutOfStock ? 'text-red-600' : 'text-blue-600'}`}>
                  Stock: {product.stock_quantity}
                  {isOutOfStock && <span className="ml-2 text-red-500">(Out of Stock)</span>}
                </p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-start md:items-end gap-4">
                <div className="flex items-center gap-4">
                  <label className="text-gray-700 font-medium">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock_quantity}
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                    className={`border rounded-lg px-3 py-2 w-20 text-center focus:outline-none focus:ring-2 transition-colors ${
                      isOutOfStock
                        ? 'border-red-300 bg-red-100 text-red-700 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    disabled={isOutOfStock}
                  />
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md ${
                    isOutOfStock
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
                  }`}
                  disabled={isOutOfStock}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}