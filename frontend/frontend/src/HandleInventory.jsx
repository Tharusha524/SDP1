import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBoxes, FaCheckCircle } from 'react-icons/fa';

// Inventory allocation screen (admin/staff).
// - Loads orders from the backend
// - Lets the user enter raw-material allocations per order
// - Sends allocations to the backend and shows a success toast
// - Also loads previously saved allocation summaries for reference

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

const SearchRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const SearchLabel = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SearchInput = styled(Input)`
  width: 220px;
  text-align: left;
`;

const HandleInventory = () => {
  // UI/feedback state
  const [showSuccess, setShowSuccess] = useState(false);

  // Data state
  const [allocatedData, setAllocatedData] = useState(null);
  const [orders, setOrders] = useState([]);

  // Loading/error state for initial load and actions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Client-side search filter (Order ID)
  const [orderSearch, setOrderSearch] = useState('');

  // Backend base URL used for all fetch calls in this component.
  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    // Guard: this page requires a JWT token in localStorage.
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in as admin or staff to handle inventory.');
      setLoading(false);
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    // Load orders for allocation inputs
    fetch(`${API_BASE}/api/orders`, { headers })
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.orders)) {
          // Normalize backend orders into a UI-friendly shape.
          // The allocation fields (cement/sand/stone) start empty so the user can type them.
          const mapped = data.orders.map(o => ({
            id: o.OrderID,
            customer: o.CustomerName || 'Unknown',
            items: o.Items || '',
            quantity: o.TotalQuantity || 0,
            cement: '',
            sand: '',
            stone: ''
          }));
          setOrders(mapped);
        } else {
          setError('Failed to load orders for inventory handling.');
        }
      })
      .catch(() => setError('Network error while loading orders.'))
      .finally(() => setLoading(false));

    // Load existing allocated inventory summaries so table always shows all allocations
    fetch(`${API_BASE}/api/inventory/allocations`, { headers })
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.allocations)) {
          setAllocatedData(data.allocations);
        }
      })
      .catch(() => {
        // ignore, keep page usable even if summary load fails
      });
  }, []);

  // Updates the allocation input fields for a specific order row.
  const handleInputChange = (orderId, field, value) => {
    // Prevent negative values
    if (value < 0) return;
    
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, [field]: value } : order
    ));
  };

  // Search term normalized for case-insensitive matching.
  const normalizedSearch = orderSearch.trim().toLowerCase();

  // Filtered views used by both tables, based on Order ID.
  const filteredOrders = normalizedSearch
    ? orders.filter(order => String(order.id).toLowerCase().includes(normalizedSearch))
    : orders;

  const filteredAllocatedData = allocatedData && normalizedSearch
    ? allocatedData.filter(row => String(row.OrderID || row.id).toLowerCase().includes(normalizedSearch))
    : allocatedData;

  // Sends the entered allocations to the backend (POST /api/inventory/allocate).
  // Validates that at least one allocation is entered and that values are >= 1.
  const handleAllocate = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to allocate inventory.');
      return;
    }

    // Validation: if a field is filled, it must be a number >= 1.
    const hasInvalidEnteredValue = orders.some(o => {
      const fields = ['cement', 'sand', 'stone'];
      return fields.some(field => {
        const raw = (o[field] ?? '').toString().trim();
        if (!raw) return false;
        const num = Number(raw);
        return !Number.isFinite(num) || num < 1;
      });
    });

    if (hasInvalidEnteredValue) {
      setError('Minimum value for raw material allocation is 1.');
      return;
    }

    // Only send rows where at least one allocation was entered.
    const meaningful = orders.filter(o =>
      (o.cement && parseInt(o.cement || '0', 10) > 0) ||
      (o.sand && parseInt(o.sand || '0', 10) > 0) ||
      (o.stone && parseInt(o.stone || '0', 10) > 0)
    );

    if (meaningful.length === 0) {
      setError('Enter at least one material quantity before allocating.');
      return;
    }

    // Payload format expected by the backend.
    const payload = {
      allocations: meaningful.map(o => ({
        orderId: o.id,
        cement: String(parseInt(o.cement || '0', 10) || 0),
        sand: String(parseInt(o.sand || '0', 10) || 0),
        stone: String(parseInt(o.stone || '0', 10) || 0)
      }))
    };

    fetch(`${API_BASE}/api/inventory/allocate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Backend returns full list of allocations; update table so it always shows all allocated inventory
          if (Array.isArray(data.allocations)) {
            setAllocatedData(data.allocations);
          }
          setError('');

          // Temporary toast-like success message.
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          setError(data.error || 'Failed to save allocation to database.');
        }
      })
      .catch(() => setError('Network error while saving allocation.'));
  };

  return (
    <Container>
      <AnimatePresence>
        {showSuccess && (
          // Success toast anchored at the top-right.
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

      {error && (
        <p style={{ color: '#f97373', marginBottom: '16px' }}>{error}</p>
      )}

      {loading && (
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading orders...</p>
      )}

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
            {filteredOrders.map(order => (
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
        <SearchRow>
          <SearchLabel>Search by Order ID</SearchLabel>
          {/* Filters both the allocation inputs and the summary table below */}
          <SearchInput
            type="text"
            placeholder="Enter Order ID..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
          />
        </SearchRow>
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
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.15)' }}>
                  {order.id}
                </td>
                <td>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    value={order.cement}
                    onChange={(e) => handleInputChange(order.id, 'cement', e.target.value)}
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    value={order.sand}
                    onChange={(e) => handleInputChange(order.id, 'sand', e.target.value)}
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
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
        {filteredAllocatedData && filteredAllocatedData.length > 0 && (
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
                  <th>Summary</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocatedData.map(row => (
                  <tr key={row.AllocationID || row.id}>
                    <td style={{ fontWeight: 600, color: '#c0a062' }}>{row.OrderID || row.id}</td>
                    <td>{row.CustomerName || '-'}</td>
                    <td>{row.SummaryText || row.summary || '-'}</td>
                    <td>{row.Status || '-'}</td>
                    <td>{row.UpdatedAt ? new Date(row.UpdatedAt).toLocaleString() : '-'}</td>
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
