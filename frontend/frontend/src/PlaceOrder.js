import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingBag, FaUser, FaListUl, FaLayerGroup, FaHashtag, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

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
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #c0a062;
    background: rgba(255, 255, 255, 0.12);
  }

  option {
    background: #1a1a1a;
    color: #fff;
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

const SuccessOverlay = styled(motion.div)`
  margin-top: 30px;
  padding: 30px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  text-align: center;
  color: #10b981;
`;

const OrderId = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 10px;
  letter-spacing: 2px;
  color: #fff;
`;

const PlaceOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = (location && location.state) || {};

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product: preselected.productId || '',
    details: preselected.productDesc || '',
    quantity: 1
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const advanceAmount = totalPrice > 0 ? Math.round(totalPrice * 0.4) : 0;
  const remainingAmount = totalPrice - advanceAmount;

  const customerName = (() => {
    try { return JSON.parse(localStorage.getItem('user'))?.name || ''; }
    catch { return ''; }
  })();

  // Fetch real products from DB on mount (used for price lookup)
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(r => r.json())
      .then(data => { if (data.success) setProducts(data.products); })
      .catch(() => {});
  }, []);

  // Recalculate price from product price (DB first, then numeric price from catalog state)
  useEffect(() => {
    if (formData.quantity <= 0) {
      setTotalPrice(0);
      return;
    }

    let unitPrice = 0;

    // Prefer real price from DB when productId is known
    if (formData.product && products && products.length > 0) {
      const found = products.find(p => p.ProductID === formData.product);
      if (found && found.Price != null) {
        unitPrice = Number(found.Price) || 0;
      }
    }

    // Fallback: use numeric price passed from catalog (unitPrice), then productPrice
    if (!unitPrice) {
      const fallbackPrice = preselected.unitPrice ?? preselected.productPrice;
      if (typeof fallbackPrice === 'number') {
        unitPrice = fallbackPrice;
      } else if (typeof fallbackPrice === 'string') {
        const numeric = fallbackPrice.replace(/[^0-9.]/g, '');
        unitPrice = Number(numeric) || 0;
      }
    }

    setTotalPrice(unitPrice > 0 ? unitPrice * formData.quantity : 0);
  }, [formData.product, formData.quantity, products, preselected.unitPrice, preselected.productPrice]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  const selectedProductName = (() => {
    if (preselected.productName) return preselected.productName;
    const found = products.find(p => p.ProductID === formData.product);
    return found ? found.Name : '';
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    if (totalPrice <= 0 || !formData.product) {
      setError('Please select a product and valid quantity before paying the advance.');
      return;
    }
    setSubmitting(true);
    navigate('/customer/payment', {
      state: {
        productId: formData.product,
        quantity: formData.quantity,
        details: formData.details,
        productName: selectedProductName,
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
              <Label htmlFor="productname"><FaListUl size={12} /> Product Name</Label>
              <Input
                id="productname"
                type="text"
                value={selectedProductName}
                readOnly
                style={{ opacity: 0.85, cursor: 'not-allowed' }}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="details"><FaLayerGroup size={12} /> Product Details</Label>
              <Input
                type="text"
                id="details"
                placeholder="e.g. custom finish, special notes, etc."
                value={formData.details}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="quantity"><FaHashtag size={12} /> Quantity</Label>
              <Input
                type="number"
                id="quantity"
                placeholder="Enter quantity"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
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
