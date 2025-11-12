'use client';
import { useState, useEffect } from 'react';
import { formatCurrency } from '../utilities/formatCurrency';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://oms-backend.test/api/reports')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-blue-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <p className="text-lg text-red-600 bg-red-100 p-4 rounded-lg shadow-md">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-10 text-indigo-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Dashboard
      </h1>

      <section className="mb-10 bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Total Orders Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 shadow-md rounded-lg p-5 border border-blue-200 hover:shadow-lg transition-shadow">
            <strong className="text-blue-800 block mb-2">Total:</strong>
            <span className="text-2xl font-bold text-blue-900">{data.orders_summary.total}</span>
          </div>
          <div className="bg-green-50 shadow-md rounded-lg p-5 border border-green-200 hover:shadow-lg transition-shadow">
            <strong className="text-green-800 block mb-2">Created:</strong>
            <span className="text-2xl font-bold text-green-900">{data.orders_summary.created}</span>
          </div>
          <div className="bg-yellow-50 shadow-md rounded-lg p-5 border border-yellow-200 hover:shadow-lg transition-shadow">
            <strong className="text-yellow-800 block mb-2">Confirmed:</strong>
            <span className="text-2xl font-bold text-yellow-900">{data.orders_summary.confirmed}</span>
          </div>
          <div className="bg-red-50 shadow-md rounded-lg p-5 border border-red-200 hover:shadow-lg transition-shadow">
            <strong className="text-red-800 block mb-2">Cancelled:</strong>
            <span className="text-2xl font-bold text-red-900">{data.orders_summary.cancelled}</span>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
        <h2 className="text-2xl font-semibold mb-6 text-green-700">Revenue Calculations</h2>
        <div className="bg-green-50 shadow-md rounded-lg p-5 border border-green-200 w-fit hover:shadow-lg transition-shadow">
          <strong className="text-green-800 block mb-2">Total Revenue:</strong>
          <span className="text-3xl font-bold text-green-900">₱{formatCurrency(data.revenue.total_revenue)}</span>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
        <h2 className="text-2xl font-semibold mb-6 text-orange-700">Inventory Status Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-orange-50 shadow-md rounded-lg p-5 border border-orange-200 hover:shadow-lg transition-shadow">
            <strong className="text-orange-800 block mb-2">Total Products:</strong>
            <span className="text-2xl font-bold text-orange-900">{data.inventory.total_products}</span>
          </div>
          <div className="bg-yellow-50 shadow-md rounded-lg p-5 border border-yellow-200 hover:shadow-lg transition-shadow">
            <strong className="text-yellow-800 block mb-2">Low Stock Count:</strong>
            <span className="text-2xl font-bold text-yellow-900">{data.inventory.low_stock_count}</span>
          </div>
          <div className="bg-red-50 shadow-md rounded-lg p-5 border border-red-200 hover:shadow-lg transition-shadow">
            <strong className="text-red-800 block mb-2">Out of Stock Count:</strong>
            <span className="text-2xl font-bold text-red-900">{data.inventory.out_of_stock_count}</span>
          </div>
        </div>

        <h3 className="text-xl font-medium mb-4 text-yellow-700">Low Stock Products</h3>
        <ul className="list-none p-0 space-y-3">
          {data.inventory.low_stock_products.map((product) => (
            <li key={product.id} className="bg-yellow-50 shadow-sm rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-shadow">
              <strong className="text-yellow-800">{product.name}</strong> - Stock: <span className="font-semibold text-yellow-900">{product.stock_quantity}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-xl font-medium mb-4 mt-8 text-red-700">Out of Stock Products</h3>
        <ul className="list-none p-0 space-y-3">
          {data.inventory.out_of_stock_products.map((product) => (
            <li key={product.id} className="bg-red-50 shadow-sm rounded-lg p-4 border border-red-200 hover:shadow-md transition-shadow">
              <strong className="text-red-800">{product.name}</strong> - Stock: <span className="font-semibold text-red-900">{product.stock_quantity}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}