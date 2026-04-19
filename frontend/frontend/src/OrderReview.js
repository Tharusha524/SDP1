import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OrderReview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Failed to load order');
        }
      } catch (e) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#e5e7eb' }}>Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#e5e7eb', flexDirection: 'column', gap: '16px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#ef4444' }}>Unable to load order</h1>
        <div>{error}</div>
        <button
          onClick={() => navigate('/customer/catalog')}
          style={{ marginTop: '12px', padding: '10px 20px', borderRadius: '999px', border: 'none', background: '#eab308', color: '#000', fontWeight: 600, cursor: 'pointer' }}
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#e5e7eb' }}>
      <div style={{ background: '#020617', border: '1px solid #1f2937', borderRadius: '16px', padding: '24px 28px', maxWidth: '640px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '12px', color: '#eab308' }}>Order Review</h1>
        <div style={{ marginBottom: '8px' }}><strong>Order ID:</strong> {order.OrderID}</div>
        <div style={{ marginBottom: '8px' }}><strong>Status:</strong> {order.Status}</div>
        <div style={{ marginBottom: '8px' }}><strong>Placed on:</strong> {new Date(order.OrderDate || order.CreatedAt).toLocaleString()}</div>
        {order.Items && (
          <div style={{ marginBottom: '8px' }}><strong>Items:</strong> {order.Items}</div>
        )}
        <div style={{ marginBottom: '8px' }}><strong>Total quantity:</strong> {order.TotalQuantity}</div>
        <div style={{ marginBottom: '8px' }}><strong>Total price:</strong> Rs. {Number(order.TotalPrice).toFixed(2)}</div>
        <div style={{ marginBottom: '16px' }}><strong>Advance paid (40%):</strong> Rs. {Number(order.AdvancePaid).toFixed(2)}</div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button
            onClick={() => navigate('/customer/catalog')}
            style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: '#eab308', color: '#000', fontWeight: 600, cursor: 'pointer' }}
          >
            Go to Catalog
          </button>
          <button
            onClick={() => navigate('/customer/track-order')}
            style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid #4b5563', background: 'transparent', color: '#e5e7eb', fontWeight: 500, cursor: 'pointer' }}
          >
            Track this Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;
