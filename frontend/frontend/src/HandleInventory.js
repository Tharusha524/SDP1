import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBoxes, FaCheckCircle } from 'react-icons/fa';

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 2px solid rgba(192, 160, 98, 0.2);
`;

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: #f3f4f6;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  
  svg {
    color: #c0a062;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
  margin: 0;
  letter-spacing: 0.5px;
`;

const ContentCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #f3f4f6;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: #c0a062;
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  th {
    text-align: left;
    padding: 18px 20px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(0, 0, 0, 0.3);
    &:first-child { border-top-left-radius: 12px; }
    &:last-child { border-top-right-radius: 12px; }
  }
  
  td {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 14px;
  color: #fff;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  width: 100px;
  text-align: center;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #c0a062;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  /* Remove spinner arrows */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const AllocateButton = styled(motion.button)`
  background: linear-gradient(135deg, #c0a062 0%, #d4b886 100%);
  color: #000;
  border: none;
  padding: 18px 48px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(192, 160, 98, 0.25);
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 32px auto 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(192, 160, 98, 0.35);
  }
  &:active {
    transform: translateY(0);
  }
`;

const SuccessMessage = styled(motion.div)`
  position: fixed;
  top: 24px;
  right: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  padding: 16px 28px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HandleInventory = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [allocatedData, setAllocatedData] = useState(null);
  
  // Orders data
  const [orders, setOrders] = useState([
    { id: 'ORD-0101', customer: 'Kavindu Herath', items: 'Flower Vases', quantity: 20, cement: '', sand: '', stone: '' },
    { id: 'ORD-0102', customer: 'Nisansala Gamage', items: 'Chairs', quantity: 50, cement: '', sand: '', stone: '' },
    { id: 'ORD-0103', customer: 'Sandaruwan Perera', items: 'Sofas', quantity: 2, cement: '', sand: '', stone: '' },
  ]);

  const handleInputChange = (orderId, field, value) => {
    // Prevent negative values
    if (value < 0) return;
    
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, [field]: value } : order
    ));
  };

  const handleAllocate = () => {
    // Create allocated data snapshot
    const allocated = orders.map(order => ({
      ...order,
      cement: order.cement || '0',
      sand: order.sand || '0',
      stone: order.stone || '0'
    }));
    
    setAllocatedData(allocated);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <Container>
      <AnimatePresence>
        {showSuccess && (
          <SuccessMessage
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FaCheckCircle /> Inventory allocated successfully!
          </SuccessMessage>
        )}
      </AnimatePresence>

      <Header>
        <Title>
          <FaBoxes /> Handle Inventory with Orders
        </Title>
        <Subtitle>
          Allocate raw materials (Cement, Sand, Stone Powder) to customer orders
        </Subtitle>
      </Header>

      {/* Orders Display Table */}
      <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <SectionTitle>Customer Orders</SectionTitle>
        <Table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600, color: '#c0a062' }}>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.items}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{order.quantity} units</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ContentCard>

      {/* Allocation Input Table */}
      <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <SectionTitle>Allocate Raw Materials</SectionTitle>
        <Table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Cement (kg)</th>
              <th>Sand (kg)</th>
              <th>Stone Powder (kg)</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.15)' }}>
                  {order.id}
                </td>
                <td>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={order.cement}
                    onChange={(e) => handleInputChange(order.id, 'cement', e.target.value)}
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={order.sand}
                    onChange={(e) => handleInputChange(order.id, 'sand', e.target.value)}
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={order.stone}
                    onChange={(e) => handleInputChange(order.id, 'stone', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <AllocateButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAllocate}
        >
          <FaCheckCircle /> Allocate Inventory
        </AllocateButton>
      </ContentCard>

      {/* Allocated Inventory Display Table */}
      <AnimatePresence>
        {allocatedData && (
          <ContentCard 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
          >
            <SectionTitle>Allocated Inventory Summary</SectionTitle>
            <Table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Cement (units)</th>
                  <th>Sand (units)</th>
                  <th>Stone Powder (units)</th>
                </tr>
              </thead>
              <tbody>
                {allocatedData.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: '#c0a062' }}>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.items}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#10b981' }}>
                      {order.cement}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#10b981' }}>
                      {order.sand}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#10b981' }}>
                      {order.stone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ContentCard>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default HandleInventory;
