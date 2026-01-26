import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingBag, FaUser, FaListUl, FaLayerGroup, FaHashtag, FaCheckCircle, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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

const priceMap = {
  chairs: 5000,
  tables: 15000,
  sofas: 20000,
  beds: 30000,
  flower_vases: 2500
};

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    product: '',
    details: '',
    quantity: 1
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    if (formData.product && formData.quantity > 0) {
      setTotalPrice(priceMap[formData.product] * formData.quantity);
    } else {
      setTotalPrice(0);
    }
  }, [formData.product, formData.quantity]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const randomNum = Math.floor(Math.random() * 9000) + 1;
    const orderId = `ORD-${String(randomNum).padStart(4, '0')}`;
    setOrderSuccess(orderId);
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
              <Label htmlFor="fullname"><FaUser size={12} /> Full Name</Label>
              <Input
                type="text"
                id="fullname"
                placeholder="Enter your full name"
                value={formData.fullname}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="product"><FaListUl size={12} /> Product Type</Label>
              <Select
                id="product"
                value={formData.product}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>-- Select Product --</option>
                <option value="chairs">Chairs</option>
                <option value="tables">Tables</option>
                <option value="sofas">Sofas</option>
                <option value="beds">Beds</option>
                <option value="flower_vases">Flower Vases</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="details"><FaLayerGroup size={12} /> Product Details</Label>
              <Input
                type="text"
                id="details"
                placeholder="e.g. cherry wood, velvet blue, etc."
                value={formData.details}
                onChange={handleInputChange}
                required
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
              <PriceLabel>Total Investment</PriceLabel>
              <PriceValue>
                {totalPrice > 0 ? `Rs. ${totalPrice.toLocaleString()}` : '—'}
              </PriceValue>
            </PriceBox>

            <SubmitButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
            >
              Confirm Order <FaShoppingBag />
            </SubmitButton>
          </Form>

          <AnimatePresence>
            {orderSuccess && (
              <SuccessOverlay
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.5 }}
              >
                <FaCheckCircle size={30} style={{ marginBottom: '15px' }} />
                <div>Your order has been secured.</div>
                <OrderId>{orderSuccess}</OrderId>
                <Subtitle style={{ marginTop: '15px', fontSize: '0.6rem' }}>Save this ID for tracking.</Subtitle>
              </SuccessOverlay>
            )}
          </AnimatePresence>
        </OrderCard>
      </Container>
    </>
  );
};

export default PlaceOrder;
