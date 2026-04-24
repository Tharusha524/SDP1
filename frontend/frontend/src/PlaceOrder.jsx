import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { FaShoppingBag, FaUser, FaListUl, FaLayerGroup, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const MAX_ORDER_QUANTITY = 50;

// --- Global Aesthetics ---
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

  body {
    background: #0c0c0c;
    color: #fdfcf0;
    font-family: 'Manrope', sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
`;

// --- Styled Components ---

const Container = styled.div`
  min-height: 100vh;
  padding: 60px;
  background: radial-gradient(circle at top right, rgba(192, 160, 98, 0.05), transparent),
              radial-gradient(circle at bottom left, rgba(192, 160, 98, 0.05), transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 40px 25px;
  }
`;

const Header = styled.div`
  width: 100%;
  max-width: 800px;
  margin-bottom: 60px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const TitleSection = styled.div``;

const Subtitle = styled(motion.p)`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: #c0a062;
  margin-bottom: 10px;
`;

const Title = styled(motion.h1)`
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: -1px;
  color: #fff;
`;

const OrderCard = styled(motion.div)`
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 15px;
  color: #fff;
  border-radius: 12px;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #c0a062;
    background: rgba(255, 255, 255, 0.12);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 15px;
  color: #fff;
  border-radius: 12px;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #c0a062;
    background: rgba(255, 255, 255, 0.12);
  }

  option {
    color: #111827;
  }
`;

const RowActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const SmallButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.78rem;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const PriceBox = styled.div`
  background: rgba(192, 160, 98, 0.08);
  padding: 25px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(192, 160, 98, 0.15);
  margin: 10px 0;
`;

const PriceLabel = styled.div`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #c0a062;
  margin-bottom: 8px;
  opacity: 0.8;
`;

const PriceValue = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: #c0a062;
`;

const SubmitButton = styled(motion.button)`
  background: #c0a062;
  color: #000;
  border: none;
  padding: 20px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(192, 160, 98, 0.2);

  &:hover {
    background: #d4b886;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(192, 160, 98, 0.3);
  }
`;

const PlaceOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = (location && location.state) || {};

  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([
    {
      productId: preselected.productId || '',
      quantity: 1
    }
  ]);
  const [details, setDetails] = useState(preselected.productDesc || '');
  const [totalPrice, setTotalPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const advanceAmount = totalPrice > 0 ? Math.round(totalPrice * 0.4) : 0;
  const remainingAmount = totalPrice - advanceAmount;

  const customerName = (() => {
    try { return JSON.parse(localStorage.getItem('user'))?.name || ''; }
    catch { return ''; }
  })();

  // Page responsibilities:
  // - Let customer select one or more products + quantities
  // - Calculate total price and 40% advance amount client-side
  // - Validate inputs and then navigate to the payment checkout route with session state

  // Fetch real products from DB on mount (used for price lookup)
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(r => r.json())
      .then(data => { if (data.success) setProducts(data.products); })
      .catch(() => {});
  }, []);

  // Recalculate total from all selected product items.
  useEffect(() => {
    let total = 0;

    orderItems.forEach((item, index) => {
      if (!item.productId || !item.quantity || item.quantity <= 0) return;

      let unitPrice = 0;
      const found = products.find(p => p.ProductID === item.productId);
      if (found && found.Price != null) {
        unitPrice = Number(found.Price) || 0;
      }

      // Price fallback for the first pre-selected item from catalog navigation.
      if (!unitPrice && index === 0 && item.productId === preselected.productId) {
        const fallbackPrice = preselected.unitPrice ?? preselected.productPrice;
        if (typeof fallbackPrice === 'number') {
          unitPrice = fallbackPrice;
        } else if (typeof fallbackPrice === 'string') {
          const numeric = fallbackPrice.replace(/[^0-9.]/g, '');
          unitPrice = Number(numeric) || 0;
        }
      }

      total += unitPrice * item.quantity;
    });

    setTotalPrice(total);
  }, [orderItems, products, preselected.productId, preselected.unitPrice, preselected.productPrice]);

  const handleItemChange = (index, field, value) => {
    setOrderItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === 'quantity' ? (parseInt(value, 10) || 0) : value
      };
      return next;
    });
  };

  const addItemRow = () => {
    setOrderItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const removeItemRow = (index) => {
    setOrderItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    // Basic validation: require at least one item and valid quantities
    if (!orderItems.length) {
      setError('Add at least one product item.');
      return;
    }

    const invalidItem = orderItems.find((item) => (
      !item.productId || !item.quantity || item.quantity <= 0 || item.quantity > MAX_ORDER_QUANTITY
    ));

    if (invalidItem) {
      setError(`Each item must have a product and quantity between 1 and ${MAX_ORDER_QUANTITY}.`);
      return;
    }

    if (totalPrice <= 0) {
      setError('Please select valid products and quantities before paying the advance.');
      return;
    }

    // Build a user-friendly product name summary for the payment screen
    const displayNames = orderItems
      .map((item) => products.find((p) => p.ProductID === item.productId)?.Name)
      .filter(Boolean);

    setSubmitting(true);
    navigate('/customer/payment', {
      state: {
        items: orderItems,
        details,
        productName: displayNames.length ? displayNames.join(', ') : (preselected.productName || ''),
        totalPrice,
        advanceAmount,
        remainingAmount
      }
    });
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <TitleSection>
            <Subtitle
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              Customer Portal
            </Subtitle>
            <Title
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Place Order
            </Title>
          </TitleSection>
          <motion.div
            whileHover={{ x: -5 }}
            onClick={() => navigate('/customer/catalog')}
            style={{ cursor: 'pointer', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <FaArrowLeft style={{ fontSize: '0.7rem' }} /> BACK
          </motion.div>
        </Header>

        <OrderCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Form id="orderForm" onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="customername"><FaUser size={12} /> Customer Name</Label>
              <Input
                id="customername"
                type="text"
                value={customerName}
                readOnly
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </FormGroup>

            <FormGroup>
              <Label><FaListUl size={12} /> Products</Label>
              {orderItems.map((item, index) => (
                <div key={`order-item-${index}`} style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
                  <Select
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.ProductID} value={product.ProductID}>
                        {product.Name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    placeholder="Quantity"
                    min="1"
                    max={MAX_ORDER_QUANTITY}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                  <SmallButton type="button" onClick={() => removeItemRow(index)} disabled={orderItems.length <= 1}>
                    Remove Item
                  </SmallButton>
                </div>
              ))}
              <RowActions>
                <SmallButton type="button" onClick={addItemRow}>+ Add Another Product</SmallButton>
              </RowActions>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="details"><FaLayerGroup size={12} /> Product Details</Label>
              <Input
                type="text"
                id="details"
                placeholder="e.g. custom finish, special notes, etc."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
                Maximum quantity per item: {MAX_ORDER_QUANTITY}
              </div>
            </FormGroup>

            <PriceBox>
              <PriceLabel>Order Summary</PriceLabel>
              <PriceValue>
                {totalPrice > 0 ? `Total: Rs. ${totalPrice.toLocaleString()}` : '—'}
              </PriceValue>
              {totalPrice > 0 && (
                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                  <div>Advance (40%): <span style={{ color: '#c0a062', fontWeight: 600 }}>Rs. {advanceAmount.toLocaleString()}</span></div>
                  <div>Remaining (60% on pickup): <span style={{ color: '#f9fafb' }}>Rs. {remainingAmount.toLocaleString()}</span></div>
                </div>
              )}
            </PriceBox>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <SubmitButton
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              type="submit"
              disabled={submitting}
              style={{ opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Processing Advance Payment...' : <><FaShoppingBag /> Pay 40% Advance & Confirm</>}
            </SubmitButton>
          </Form>
        </OrderCard>
      </Container>
    </>
  );
};

export default PlaceOrder;
