'use client';

import { useEffect } from 'react';
import { formatCurrency } from '../utilities/formatCurrency';

export default function Cart({
  cart,
  updateCartItem,
  total,
  orderStatus,
  setOrderStatus,   // 💡 setter from parent
  createOrder,
  checkout,
  cancelOrder,
}) {
  // Reset orderStatus if new items are added to the cart
  useEffect(() => {
    if (cart.length > 0 && orderStatus) {
      setOrderStatus(null);
    }
  }, [cart, orderStatus, setOrderStatus]);

  // Hide all buttons if cart is empty
  const showButtons = cart.length > 0 && !orderStatus;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-lg">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div
                key={item.product_id}
                className="flex flex-col md:flex-row md:justify-between md:items-center bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 mb-2 md:mb-0">
                  <span className="text-gray-800 font-medium">{item.product_name}</span>
                  <span className="text-gray-600 ml-2">
                    - ₱{formatCurrency(item.unit_price)} x {item.quantity}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartItem(item.product_id, item.quantity - 1)}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>

                  <span className="px-3 py-1 bg-white border rounded-lg font-medium text-gray-800">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateCartItem(item.product_id, item.quantity + 1)}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                  >
                    +
                  </button>

                  <button
                    onClick={() => updateCartItem(item.product_id, 0)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors font-semibold ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="text-right">
              <strong className="text-2xl text-green-700">
                Total: ₱{formatCurrency(total)}
              </strong>
            </div>
          </div>

          {/* Buttons */}
          {showButtons && (
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button
                onClick={createOrder}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
              >
                Create Order
              </button>
            </div>
          )}

          {/* Status Message */}
          {orderStatus && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-indigo-800 font-medium">
                Order Status: <strong className="text-indigo-900">{orderStatus}</strong>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
