'use client';
import React, { useState } from 'react';
import { formatCurrency } from '../utilities/formatCurrency';

export default function OrderList({ orders, refreshOrders }) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Group orders by order_number
  const groupedOrders = Object.values(
    orders.reduce((acc, order) => {
      if (!acc[order.order_number]) {
        acc[order.order_number] = { ...order, related: [order] };
      } else {
        acc[order.order_number].related.push(order);
      }
      return acc;
    }, {})
  );

  const handleToggle = (orderNumber) => {
    setExpandedOrder(expandedOrder === orderNumber ? null : orderNumber);
  };

  // Cancel order with payload
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    const payload = {
      total_amount: selectedOrder.total_amount,
      status: 'cancelled',
      order_number: selectedOrder.order_number,
      items: selectedOrder.order_item.map((item) => ({
        product_id: item.product_id,
        unit_price: item.unit_price,
        quantity: item.quantity,
      })),
    };

    try {
      setIsLoading(true);
      const res = await fetch('http://oms-backend.test/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to cancel order');

      // Reload orders from parent
      await refreshOrders();

      setShowModal(false);
      setSelectedOrder(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!orders || orders.length === 0)
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No orders found.</p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-indigo-500">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <tr>
            <th className="px-6 py-4 font-semibold">#</th>
            <th className="px-6 py-4 font-semibold">Order Number</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Total</th>
            <th className="px-6 py-4 font-semibold">Created At</th>
          </tr>
        </thead>
        <tbody>
          {groupedOrders.map((order, i) => (
            <React.Fragment key={order.order_number}>
              {/* Summary Row */}
              <tr
                onClick={() => handleToggle(order.order_number)}
                className="border-b border-gray-200 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 text-gray-800">{i + 1}</td>
                <td className="px-6 py-4 font-medium text-blue-600 underline hover:text-blue-800">
                  {order.order_number}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'confirmed'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-green-700 font-semibold">
                  ₱{formatCurrency(order.total_amount)}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(order.created_at).toLocaleString()}
                </td>
              </tr>

              {/* Expanded Details */}
              {expandedOrder === order.order_number && (
                <tr className="bg-indigo-50 border-b border-indigo-200">
                  <td colSpan="5" className="px-8 py-6">
                    <h4 className="font-bold text-xl mb-4 text-indigo-800">
                      Order Details ({order.order_item?.length || 0} items)
                    </h4>

                    {order.order_item && order.order_item.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        {order.order_item.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {item.product?.name || 'Unknown Product'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.product?.description}
                              </p>
                            </div>
                            <div className="text-right text-gray-700 font-medium">
                              <p>
                                ₱{formatCurrency(item.unit_price)} ×{' '}
                                {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic mb-6">
                        No items found for this order.
                      </p>
                    )}

                    {/* Status Timeline */}
                    {order.statuses && order.statuses.length > 0 && (
                      <div className="mb-6">
                        <h5 className="font-semibold text-lg mb-3 text-indigo-700">Status Timeline</h5>
                        <ul className="border border-indigo-200 rounded-lg divide-y divide-indigo-100 bg-white shadow-sm">
                          {order.statuses.map((s, idx) => (
                            <li
                              key={idx}
                              className={`p-4 flex justify-between text-sm font-medium ${
                                s.status === order.status
                                  ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                                  : 'text-gray-600'
                              }`}
                            >
                              <span>{s.status}</span>
                              <span>
                                {new Date(s.created_at).toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cancel Button */}
                    <div className="flex justify-end">
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Cancel Confirmation Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border-l-4 border-red-500">
            <h2 className="text-2xl font-bold mb-6 text-red-700">Cancel Order</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Are you sure you want to cancel order{' '}
              <span className="font-bold text-red-600">{selectedOrder.order_number}</span>?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                disabled={isLoading}
              >
                No, Keep It
              </button>

              <button
                onClick={handleCancelOrder}
                className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 shadow-md ${
                  isLoading
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cancelling...
                  </div>
                ) : (
                  'Yes, Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}