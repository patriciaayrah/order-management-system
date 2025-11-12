import { formatCurrency } from '../utilities/formatCurrency';

export default function OrderSummary({ order, checkout, cancelOrder }) {
  return (
    <div className="mt-8 border rounded-lg p-4 bg-gray-50 shadow-sm">
      <h3 className="text-xl font-semibold mb-3">Order Summary</h3>

      <p>
        <strong>Order Number:</strong> {order.order_number}
      </p>
      <p>
        <strong>Status:</strong>
        <span
          className={`ml-1 font-medium ${
            order.status === 'created'
              ? 'text-yellow-600'
              : order.status === 'confirmed'
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {order.status}
        </span>
      </p>
      <p>
        <strong>Total:</strong> ₱{formatCurrency(order.total_amount)}
      </p>

      {order.items && order.items.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-medium mb-2">Items</h4>
          <table className="min-w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-center">Qty</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.product_id} className="border-b">
                  <td className="px-3 py-2">{item.product_name}</td>
                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">
                    ₱{formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ₱{formatCurrency((item.unit_price * item.quantity))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {order.status === 'created' && (
          <>
            <button
              onClick={checkout}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Checkout
            </button>
            <button
              onClick={() => cancelOrder(order)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </>
        )}
        {order.status === 'confirmed' && (
          <p className="text-green-700 font-semibold">✅ Order Confirmed!</p>
        )}
        {order.status === 'cancelled' && (
          <p className="text-red-700 font-semibold">❌ Order Cancelled</p>
        )}
      </div>
    </div>
  );
}
