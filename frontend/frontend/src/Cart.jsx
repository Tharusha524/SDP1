// React and library imports
// - React hooks used: useEffect, useState
import React, { useEffect, useState } from 'react';
// Programmatic navigation between routes
import { useNavigate } from 'react-router-dom';
// Icon used for the back button
import { FaArrowLeft } from 'react-icons/fa';
// CSS-in-JS library for styled components
import styled from 'styled-components';

// Page: top-level page wrapper (background, font, spacing)
const Page = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  background: radial-gradient(circle at top left, #1a1a1a, #0d0d0d);
  color: #f3f4f6;
  font-family: 'Manrope', sans-serif;
`;

// Card: central glassmorphism container for cart content
const Card = styled.div`
  max-width: 980px;
  margin: 0 auto;
  background: linear-gradient(180deg, rgba(10,11,12,0.6), rgba(6,6,8,0.45));
  border-radius: 18px;
  padding: 28px;
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
`;

// Row: grid layout for each cart item (name, qty, price, actions)
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 110px 140px 90px;
  gap: 14px;
  align-items: center;
  padding: 14px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: background 0.15s ease, transform 0.12s ease;
  &:hover {
    background: linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.008));
    transform: translateY(-2px);
  }
`;

// Title: main page heading style
const Title = styled.h1`
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
  color: #fcfbf8;
`;

// TitleRow: horizontal layout containing title and back button
const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;

// BackBtn: small button to navigate back to catalog
const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.04);
  background: rgba(223, 164, 36, 0.02);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.12s ease, background 0.12s ease;
  &:hover { transform: translateY(-2px); background: rgba(255,255,255,0.03); }
`;

// Name: product name text in the row
const Name = styled.div`
  font-weight: 600;
`;

// QtyInput: numeric input for item quantity
const QtyInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
`;

// PrimaryButton: primary CTA styling (Proceed to Pay)
const PrimaryButton = styled.button`
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(180deg, #c9b07a, #b88f4e);
  color: #111;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 6px 18px rgba(184,143,78,0.15);
`;

// ClearButton: secondary action (Clear Cart)
const ClearButton = styled.button`
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  background: transparent;
  color: #f3f4f6;
  cursor: pointer;
`;

// RemoveBtn: per-item remove button style
const RemoveBtn = styled.button`
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  color: #fff;
  cursor: pointer;
  &:hover { background: rgba(255,255,255,0.04); transform: translateY(-1px); }
`;

// TextArea: notes / special instructions input
const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  color: #fff;
  font-family: inherit;
`;

// FooterRow: layout for summary and action buttons
const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

// SummaryText: subtotal and advance display styling
const SummaryText = styled.div`
  color: rgba(255,255,255,0.9);
`;

// ActionGroup: holds the Proceed + Clear buttons
const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;

export default function Cart() {
  // navigation helper for route changes
  const navigate = useNavigate();
  // `cart`: array of items stored locally for the current user/session
  const [cart, setCart] = useState([]);
  // `productsMap`: holds product metadata fetched from backend keyed by ProductID
  const [productsMap, setProductsMap] = useState({});
  // `notes`: optional customer instructions for the order
  const [notes, setNotes] = useState('');

  // Load cart from localStorage when component mounts
  useEffect(() => {
    const raw = localStorage.getItem('cart');
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      setCart(parsed);
    } catch {
      // if parsing fails (corrupt JSON), reset to empty cart
      setCart([]);
    }
  }, []);

  // Whenever cart changes, refresh product metadata (name, price)
  useEffect(() => {
    if (!cart.length) return;
    // (ids were previously collected here if needed by a filtered fetch)
    // fetch product list from backend (endpoint returns all / filtered products)
    fetch(`http://localhost:5000/api/products`)
      .then(r => r.json())
      .then(data => {
        if (data && data.success && data.products) {
          const map = {};
          data.products.forEach(p => { map[p.ProductID] = p; });
          setProductsMap(map);
        }
      }).catch(() => {});
  }, [cart]);

  // Persist cart state both in React state and in localStorage
  const updateCart = (next) => {
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  // Update quantity for a specific cart row (index)
  const changeQty = (idx, qty) => {
    const next = [...cart];
    // enforce minimum quantity of 1 and coerce to Number
    next[idx] = { ...next[idx], quantity: Math.max(1, Number(qty) || 1) };
    updateCart(next);
  };

  // Remove an item from the cart by index
  const removeItem = (idx) => {
    const next = cart.filter((_, i) => i !== idx);
    updateCart(next);
  };

  // Compute subtotal using latest server-side product prices when available
  const subtotal = cart.reduce((s, it) => {
    const price = (productsMap[it.productId] && Number(productsMap[it.productId].Price)) || 0;
    return s + price * (it.quantity || 0);
  }, 0);

  // Business rule: advance = 40% of subtotal
  const advance = Number((subtotal * 0.4).toFixed(2));

  // Proceed to payment: prepare payload and navigate to payment route
  const proceed = () => {
    if (!cart.length) return;
    const items = cart.map(it => ({ productId: it.productId, quantity: it.quantity }));
    navigate('/customer/payment', { state: {
      items,
      details: notes,
      totalPrice: subtotal,
      advanceAmount: advance,
      remainingAmount: subtotal - advance,
      // Concatenate product names for quick reference on payment page
      productName: cart.map(ci => (productsMap[ci.productId]?.Name || '')).join(', ')
    } });
  };

  return (
    <Page>
      <Card>
        {/* Title + back button row */}
        <TitleRow>
          <Title>Your Cart</Title>
          <BackBtn onClick={() => navigate('/customer/catalog')} aria-label="Back to catalog">
            <FaArrowLeft /> Back
          </BackBtn>
        </TitleRow>

        {/* Empty cart placeholder shown when no items */}
        {cart.length === 0 && <div>Your cart is empty. Browse products to add items.</div>}

        {/* Cart item rows */}
        {cart.map((it, idx) => (
          <Row key={`${it.productId}-${idx}`}>
            <div>
              <Name>{(productsMap[it.productId] && productsMap[it.productId].Name) || it.productId}</Name>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{(productsMap[it.productId] && `Rs. ${Number(productsMap[it.productId].Price).toLocaleString()}`) || 'Price unavailable'}</div>
            </div>
            <div>
              <QtyInput type="number" value={it.quantity} min={1} onChange={(e) => changeQty(idx, e.target.value)} />
            </div>
            <div style={{ textAlign: 'right' }}>
              Rs. {(((productsMap[it.productId] ? Number(productsMap[it.productId].Price) : 0) * (it.quantity || 0))).toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <RemoveBtn onClick={() => removeItem(idx)}>Remove</RemoveBtn>
            </div>
          </Row>
        ))}

        {cart.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Notes / Special Instructions</strong>
            </div>
            <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            <FooterRow>
              <SummaryText>Subtotal: Rs. {subtotal.toLocaleString()} &nbsp; | &nbsp; Advance (40%): Rs. {advance.toLocaleString()}</SummaryText>
              <ActionGroup>
                <PrimaryButton onClick={proceed}>Proceed to Pay</PrimaryButton>
                <ClearButton onClick={() => { localStorage.removeItem('cart'); setCart([]); }}>Clear Cart</ClearButton>
              </ActionGroup>
            </FooterRow>
          </div>
        )}
      </Card>
    </Page>
  );
}
