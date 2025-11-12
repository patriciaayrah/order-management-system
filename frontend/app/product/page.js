'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '../utilities/formatCurrency';

const API = {
  PRODUCTS: 'http://oms-backend.test/api/products',
  INVENTORY_LOGS: 'http://oms-backend.test/api/inventory-logs',
};

async function apiRequest(url, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock_quantity: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock_quantity: '' });
    setEditingProduct(null);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(API.PRODUCTS);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const { name, description, price, stock_quantity } = formData;
    if (!name || !description || !price || !stock_quantity) return alert('Please fill all fields.');

    try {
      await apiRequest(API.PRODUCTS, 'POST', {
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity),
      });
      await fetchProducts();
      resetForm();
    } catch (err) {
      alert(`Error adding product: ${err.message}`);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
    });
  };

  const handleUpdate = async () => {
    const { name, description, price, stock_quantity } = formData;
    if (!editingProduct || !name || !description || !price || !stock_quantity) return alert('All fields required.');

    const isStockChanged = parseInt(stock_quantity) !== editingProduct.stock_quantity;

    try {
      if (isStockChanged) {
        await apiRequest(API.INVENTORY_LOGS, 'POST', {
          product_id: editingProduct.id,
          quantity: parseInt(stock_quantity),
        });
      }

      await apiRequest(`${API.PRODUCTS}/${editingProduct.id}`, 'PUT', {
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity),
      });

      await fetchProducts();
      resetForm();
    } catch (err) {
      alert(`Error updating product: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiRequest(`${API.PRODUCTS}/${id}`, 'DELETE');
      await fetchProducts();
    } catch (err) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  const handleShowInventory = async (product) => {
    setSelectedProduct(product);
    setShowInventoryModal(true);
    setInventoryLoading(true);
    setCurrentPage(1); // Reset pagination
    try {
      const data = await apiRequest(`${API.INVENTORY_LOGS}/${product.id}`);
      setInventoryLogs(data);
    } catch (err) {
      alert(`Error fetching inventory logs: ${err.message}`);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Pagination calculations
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = inventoryLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(inventoryLogs.length / logsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-blue-700">Loading products...</p>
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
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-10 text-indigo-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Product Management
      </h1>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-500">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {['name', 'description', 'price', 'stock_quantity'].map((field) => (
            <input
              key={field}
              type={field.includes('price') || field.includes('quantity') ? 'number' : 'text'}
              step={field === 'price' ? '0.01' : undefined}
              placeholder={field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={editingProduct ? handleUpdate : handleAdd}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold shadow-md"
          >
            {editingProduct ? 'Update' : 'Add'} Product
          </button>
          {editingProduct && (
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold shadow-md"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-x-auto border-l-4 border-green-500">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              {['Product Name', 'Description', 'Price', 'Stock Quantity', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-4 text-left font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-800">{product.name}</td>
                <td className="px-6 py-4 text-gray-600">{product.description}</td>
                <td className="px-6 py-4 text-green-700 font-semibold">₱{formatCurrency(product.price)}</td>
                <td className="px-6 py-4 text-blue-700 font-semibold">{product.stock_quantity}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleShowInventory(product)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm"
                  >
                    Inventory Logs
                  </button>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500 font-medium">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-4xl p-8 relative max-h-[90vh] overflow-y-auto border-l-4 border-orange-500">
            <h2 className="text-3xl font-bold mb-6 text-orange-700">
              Inventory Logs - {selectedProduct?.name}
            </h2>
            <button
              onClick={() => setShowInventoryModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold text-2xl transition-colors"
            >
              &times;
            </button>

            {inventoryLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-lg text-orange-700">Loading inventory logs...</p>
              </div>
            ) : inventoryLogs.length ? (
              <>
                <table className="w-full table-auto border border-gray-300 rounded-lg overflow-hidden mb-6">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                      {['Change Type', 'Quantity', 'Reason', 'Date'].map((h) => (
                        <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-200 hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4 text-gray-800">{log.change_type}</td>
                        <td className="px-6 py-4 text-blue-700 font-semibold">{log.quantity_change}</td>
                        <td className="px-6 py-4 text-gray-600">{log.reason}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Previous
                  </button>
                  <span className="text-lg font-semibold text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 font-medium">No inventory logs found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
