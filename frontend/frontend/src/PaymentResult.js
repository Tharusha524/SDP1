import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentResult = ({ success }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#e5e7eb', flexDirection: 'column', gap: '16px' }}>
      {success ? (
        <>
          <h1 style={{ fontSize: '1.8rem', color: '#22c55e' }}>Payment successful</h1>
          {orderId && <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>Order ID: {orderId}</div>}

          <button
            onClick={() => navigate('/customer/catalog')}
            style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '999px', border: 'none', background: '#eab308', color: '#000', fontWeight: 600, cursor: 'pointer' }}
          >
            Go to Catalog
          </button>
        </>
      ) : (
        <>
          <h1 style={{ fontSize: '1.8rem', color: '#ef4444' }}>Payment failed or cancelled</h1>
          <button
            onClick={() => navigate('/customer/place-order')}
            style={{ marginTop: '12px', padding: '10px 20px', borderRadius: '999px', border: 'none', background: '#eab308', color: '#000', fontWeight: 600, cursor: 'pointer' }}
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
};

export default PaymentResult;
