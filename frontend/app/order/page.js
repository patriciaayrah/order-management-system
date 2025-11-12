'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ProductList from '../components/ProductList';
import Cart from '../components/Cart';
import OrderSummary from '../components/OrderSummary';
import OrderList from '../components/OrderList';

const API_PRODUCTS_URL = 'http://oms-backend.test/api/products';
const API_ORDERS_URL = 'http://oms-backend.test/api/orders';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null); // ✅ lifted state


  const router = useRouter();

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [prodRes, orderRes] = await Promise.all([
          fetch(API_PRODUCTS_URL),
          fetch(API_ORDERS_URL),
        ]);

        if (!prodRes.ok) throw new Error('Failed to fetch products');
        if (!orderRes.ok) throw new Error('Failed to fetch orders');

        const prodData = await prodRes.json();
        const orderData = await orderRes.json();

        setProducts(prodData);
        setOrders(orderData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Refresh orders
  const refreshOrders = async () => {
    try {
      const res = await fetch(API_ORDERS_URL);
      if (!res.ok) throw new Error('Failed to refresh orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Utility
  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.unit_price * item.quantity, 0);

  // Add to cart
  const addToCart = (product, quantity) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.product_id === product.id);
      if (existing) {
        return prevCart.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prevCart,
        {
          product_name: product.name,
          product_id: product.id,
          unit_price: parseFloat(product.price),
          quantity,
        },
      ];
    });
    setOrderStatus(null);
  };

  // Update cart item
  const updateCartItem = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.product_id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Create order
  const createOrder = async () => {
    if (cart.length === 0) return alert('Cart is empty');

    const payload = {
      total_amount: calculateTotal(),
      status: 'created',
      items: cart,
    };

    try {
      const res = await fetch(API_ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create order');
      const data = await res.json();

      const newOrder = {
        order_number: data.data.order_number,
        status: 'created',
        total_amount: payload.total_amount,
        items: cart,
      };

      setOrder(newOrder);
      setCart([]);
      await refreshOrders();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
    setOrderStatus('created'); // set order status
  };

  // Checkout order
  const checkout = async () => {
    if (!order) return alert('No order selected');

    const payload = {
      order_number: order.order_number,
      total_amount: order.total_amount,
      status: 'confirmed',
      items: order.items,
    };

    try {
      const res = await fetch(API_ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to confirm order');

      setOrder({ ...order, status: 'confirmed' });
      await refreshOrders();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Cancel order (full payload)
  const cancelOrderWithPayload = async (orderToCancel) => {
    if (!orderToCancel) return alert('No order selected');

    const payload = {
      order_number: orderToCancel.order_number,
      total_amount: orderToCancel.total_amount,
      status: 'cancelled',
      items: orderToCancel.items.map((item) => ({
        product_id: item.product_id,
        unit_price: item.unit_price,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch(API_ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to cancel order');

      if (order?.order_number === orderToCancel.order_number) {
        setOrder({ ...order, status: 'cancelled' });
      }

      await refreshOrders();
    } catch (err) {
      alert(`Error: ₱{err.message}`);
    }
  };

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
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-4">E-Commerce Store</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          <ProductList products={products} addToCart={addToCart} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Cart</h2>
          </div>
          <Cart
            cart={cart}
            updateCartItem={updateCartItem}
            total={calculateTotal()}
            createOrder={createOrder}
            orderStatus={orderStatus}
            setOrderStatus={setOrderStatus} // ✅ provide setter
            checkout={checkout}
            cancelOrder={cancelOrderWithPayload}
          />

          {order && (
            <OrderSummary
              order={order}
              checkout={checkout}
              cancelOrder={cancelOrderWithPayload}
            />
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mt-10 mb-4">All Orders</h2>
        <OrderList orders={orders} refreshOrders={refreshOrders} />
      </div>
    </div>
  );
}
