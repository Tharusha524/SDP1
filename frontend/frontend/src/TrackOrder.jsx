import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaSearch, FaClock, FaInfoCircle, FaArrowRight, FaBoxOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// --- Global Aesthetics ---
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

  body {
    background: radial-gradient(circle at top left, #1a1a1a, #0d0d0d);
    color: #f3f4f6;
    font-family: 'Manrope', sans-serif;
    margin: 0;
    padding: 0;
  }
`;

// --- Styled Components ---

const Container = styled.div`
  min-height: 100vh;
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-x: hidden;

  /* Subtle aurora effect background */
  &::before {
    content: '';
    position: fixed;
    top: -10%;
    right: -10%;
    width: 40%;
    height: 40%;
    background: radial-gradient(circle, rgba(192, 160, 98, 0.08) 0%, transparent 70%);
    filter: blur(80px);
    z-index: -1;
  }

  @media (max-width: 768px) {
    padding: 40px 25px;
  }
`;

const Header = styled.div`
  width: 100%;
  max-width: 1000px;
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
  color: #f3f4f6;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  width: 100%;
  max-width: 1000px;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 40px;
  border-radius: 20px;
  height: fit-content;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.5);
    border-color: rgba(192, 160, 98, 0.3);
  }
`;

const CardTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #f3f4f6;
  font-weight: 400;
  
  svg {
    color: #c0a062;
    font-size: 1.2rem;
  }
`;

// --- Notification Center ---
const NotifList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05); 
  }
  &::-webkit-scrollbar-thumb {
    background: #c0a062;
    border-radius: 10px;
  }
`;

const NotifItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid #c0a062;
  padding: 15px 20px;
  border-radius: 4px;
  display: flex;
  gap: 15px;
  align-items: flex-start;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const NotifContent = styled.div`
  flex: 1;
`;

const NotifMsg = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
  margin-top: 0;

  b {
    color: #f3f4f6;
    font-weight: 600;
  }
`;

const NotifTime = styled.span`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  font-size: 0.9rem;
`;

// --- Search Section ---
const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 40px;
`;

const Input = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 15px;
  color: #fff;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #c0a062;
    background: rgba(255, 255, 255, 0.12);
  }
`;

const SearchBtn = styled(motion.button)`
  background: #c0a062;
  color: #000;
  border: none;
  padding: 0 25px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  
  &:hover {
    background: #d4b886;
  }
`;

const ResultTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
  margin-top: 20px;

  th {
    padding: 15px 10px;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }

  td {
    padding: 20px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.9rem;
    color: rgba(243, 244, 246, 0.85);
  }
  
  tr:last-child td {
      border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  background: rgba(192, 160, 98, 0.15);
  color: #c0a062;
  padding: 6px 12px;
  font-size: 0.7rem;
  border-radius: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid rgba(192, 160, 98, 0.3);
`;

const TrackOrder = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  // `trackedOrder` - populated when an order ID is successfully fetched
  // `notifications` - recent user notifications shown in the panel
  // `trackError` - user-facing error for lookup failures
  // `searching` - UI loading flag while the order lookup is in progress
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [trackError, setTrackError] = useState(null);
  const [searching, setSearching] = useState(false);

  // Load notifications for the logged-in user (uses notification.DateTime as created timestamp)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    // Fetch latest notifications for the authenticated user and normalize
    // them into a compact shape for display. We limit to the first 50 items
    // to avoid overwhelming the UI.
    fetch('http://localhost:5000/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.notifications)) {
          setNotifications(
            data.notifications
              .slice(0, 50)
              .map(n => ({
                id: n.NotificationID,
                orderId: n.RelatedID,
                message: n.Message,
                type: n.Type,
                time: n.DateTime ? new Date(n.DateTime).toLocaleString() : ''
              }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setTrackError(null);
    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      // Lookup order by ID using authenticated API. On success transform the
      // server payload into `trackedOrder` used by the ResultTable below.
      const res = await fetch(`http://localhost:5000/api/orders/${orderId.trim()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const o = data.order;
        setTrackedOrder({
          id: o.OrderID,
          status: o.Status,
          time: new Date(o.StatusUpdatedAt || o.UpdatedAt || o.OrderDate || o.CreatedAt).toLocaleString(),
          items: o.Items,
          estimated: o.EstimatedCompletionDate
            ? new Date(o.EstimatedCompletionDate).toLocaleDateString()
            : null
        });
        setOrderId('');
      } else {
        setTrackError(data.error || 'Order not found');
        setTrackedOrder(null);
      }
    } catch {
      setTrackError('Network error. Please try again.');
      setTrackedOrder(null);
    } finally {
      setSearching(false);
    }
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
             
            </Subtitle>
            <Title
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Track Status
            </Title>
          </TitleSection>
          <motion.div
            whileHover={{ x: 5 }}
            onClick={() => navigate('/customer/catalog')}
            style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            CATALOG <FaArrowRight style={{ fontSize: '0.7rem', color: '#c0a062' }} />
          </motion.div>
        </Header>

        <ContentGrid>
          {/* Left card: Notification Center (recent user notifications) */}
          <GlassCard
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <CardTitle><FaBell /> Notification Center</CardTitle>
            <NotifList>
              <AnimatePresence initial={false}>
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <motion.div
                      key={n.id} // NotifItem needs direct Key or Wrapper
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <NotifItem>
                        <FaInfoCircle style={{ color: '#c0a062', marginTop: '2px' }} />
                        <NotifContent>
                          <NotifMsg>
                            {n.orderId ? (
                              <>
                                <b>Order #{n.orderId}</b>: {n.message}
                              </>
                            ) : (
                              <>{n.message}</>
                            )}
                          </NotifMsg>
                          <NotifTime>{n.time}</NotifTime>
                        </NotifContent>
                      </NotifItem>
                    </motion.div>
                  ))
                ) : (
                  <EmptyState>
                    <FaBoxOpen size={30} />
                    <p>No new transmissions detected.</p>
                  </EmptyState>
                )}
              </AnimatePresence>
            </NotifList>
          </GlassCard>

          {/* Right card: Order lookup form and result table */}
          <GlassCard
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <CardTitle><FaSearch /> Identify Order</CardTitle>
            <SearchForm onSubmit={handleTrack}>
              <Input
                type="text"
                placeholder="Enter Order ID (e.g., ORD-0004)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
              <SearchBtn
                whileHover={{ scale: searching ? 1 : 1.05 }}
                whileTap={{ scale: searching ? 1 : 0.95 }}
                type="submit"
                disabled={searching}
              >
                <FaSearch />
              </SearchBtn>
            </SearchForm>

            {/* Show lookup error when present */}
            {trackError && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px', padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                {trackError}
              </div>
            )}

            {/* Display the most recently fetched order or an instruction/empty state */}
            <ResultTable>
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Date</th>
                  <th>Estimated Completion</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {trackedOrder ? (
                    <motion.tr
                      key={trackedOrder.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td style={{ color: '#f3f4f6', fontWeight: 600 }}>{trackedOrder.id}</td>
                      <td><StatusBadge>{trackedOrder.status}</StatusBadge></td>
                      <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{trackedOrder.items || '—'}</td>
                      <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}><FaClock size={10} style={{ marginRight: '5px' }} />{trackedOrder.time}</td>
                      <td style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                        {trackedOrder.estimated || '—'}
                      </td>
                    </motion.tr>
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.15)', fontSize: '0.85rem' }}>
                        {searching ? 'Searching...' : 'Enter an Order ID to look up its status.'}
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </ResultTable>
          </GlassCard>
        </ContentGrid>
      </Container>
    </>
  );
};

export default TrackOrder;
