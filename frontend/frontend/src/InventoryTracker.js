import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaDollyFlatbed, FaClock, FaCheckCircle, FaChartLine, FaSignOutAlt } from 'react-icons/fa';
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
    min-height: 100vh;
  }
`;

// --- Styled Components ---

const Container = styled.div`
  min-height: 100vh;
  padding: 60px;
  background: transparent;
  position: relative;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 40px 25px;
  }
`;

const Header = styled.div`
  margin-bottom: 60px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

const LowStockBanner = styled(motion.div)`
  background: rgba(192, 57, 43, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(192, 57, 43, 0.3);
  color: #ff6b6b;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(192, 57, 43, 0.1);
`;

const GlassTable = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 14px 36px rgba(0,0,0,0.3);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: 20px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.6);
    border-bottom: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.08);
  }

  td {
    padding: 25px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    font-size: 0.95rem;
    color: rgba(255,255,255,0.85);
    vertical-align: middle;
  }
`;

const StockValue = styled.span`
  font-weight: 700;
  color: ${props => props.isLow ? '#ff6b6b' : '#c0a062'};
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 10px;
  color: #fff;
  width: 100px;
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

const UpdateButton = styled(motion.button)`
  background: #c0a062;
  color: #111827;
  border: none;
  padding: 18px 40px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(192, 160, 98, 0.2);

  &:hover {
    background: #d4b886;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(192, 160, 98, 0.3);
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  color: #f3f4f6;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 12px 24px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Manrope', sans-serif;

  &:hover {
    background: rgba(192, 160, 98, 0.15);
    border-color: #c0a062;
    color: #c0a062;
    transform: translateY(-2px);
  }
`;

const AlertToast = styled(motion.div)`
  position: fixed;
  bottom: 40px;
  right: 40px;
  background: #c0a062;
  color: #111827;
  padding: 20px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1000;
  font-weight: 700;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InventoryTracker = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/catalog');
    };

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLowStockMsg, setShowLowStockMsg] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: '' });

    const token = localStorage.getItem('token');
    const authHeader = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        fetch('http://localhost:5000/api/inventory', { headers: authHeader })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const mapped = data.inventory.map(i => ({
                        id: i.InventoryID,
                        name: i.InventoryName,
                        stock: i.AvailableQuantity,
                        threshold: i.MinimumThreshold,
                        alertTime: i.LastUpdated ? new Date(i.LastUpdated).toLocaleString() : 'N/A',
                        update: ''
                    }));
                    setMaterials(mapped);
                    if (mapped.some(m => m.stock <= m.threshold)) setShowLowStockMsg(true);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (id, value) => {
        setMaterials(prev => prev.map(m => m.id === id ? { ...m, update: value } : m));
    };

    const updateStock = async () => {
        const itemsToUpdate = materials.filter(m => m.update !== '' && !isNaN(parseInt(m.update)));
        if (itemsToUpdate.length === 0) {
            setToast({ show: true, msg: 'Enter a quantity in at least one row to update.' });
            setTimeout(() => setToast({ show: false, msg: '' }), 4000);
            return;
        }
        try {
            await Promise.all(itemsToUpdate.map(m =>
                fetch(`http://localhost:5000/api/inventory/${m.id}`, {
                    method: 'PATCH',
                    headers: authHeader,
                    body: JSON.stringify({ quantity: parseInt(m.update) })
                })
            ));
            // Refresh from DB
            const res = await fetch('http://localhost:5000/api/inventory', { headers: authHeader });
            const data = await res.json();
            if (data.success) {
                const mapped = data.inventory.map(i => ({
                    id: i.InventoryID,
                    name: i.InventoryName,
                    stock: i.AvailableQuantity,
                    threshold: i.MinimumThreshold,
                    alertTime: i.LastUpdated ? new Date(i.LastUpdated).toLocaleString() : 'N/A',
                    update: ''
                }));
                setMaterials(mapped);
                const lowFound = mapped.some(m => m.stock <= m.threshold);
                if (lowFound) {
                    setShowLowStockMsg(true);
                    setTimeout(() => setShowLowStockMsg(false), 5000);
                }
            }
            setToast({ show: true, msg: 'Inventory updated successfully.' });
        } catch {
            setToast({ show: true, msg: 'Network error. Please try again.' });
        }
        setTimeout(() => setToast({ show: false, msg: '' }), 4000);
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
                            Real-Time Tracker
                        </Title>
                    </TitleSection>
                    <LogoutButton onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </LogoutButton>
                </Header>

                <AnimatePresence>
                    {showLowStockMsg && (
                        <LowStockBanner
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                        >
                            <FaExclamationTriangle /> Critical Warning: Automated low stock alerts have been dispatched.
                        </LowStockBanner>
                    )}
                </AnimatePresence>

                <GlassTable>
                    <Table>
                        <thead>
                            <tr>
                                <th>Inventory ID</th>
                                <th><FaDollyFlatbed style={{ marginRight: '10px' }} /> Inventory Name</th>
                                <th>Current Stock</th>
                                <th>Threshold</th>
                                <th><FaClock style={{ marginRight: '10px' }} /> Last Sync</th>
                                <th>Adjustment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)' }}>Loading inventory...</td></tr>
                            ) : materials.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)' }}>No inventory items found.</td></tr>
                            ) : materials.map((mat, idx) => (
                                <motion.tr
                                    key={mat.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.1 }}
                                >
                                    <td style={{ color: '#c0a062', fontWeight: 700, letterSpacing: '0.5px' }}>{mat.id}</td>
                                    <td style={{ color: '#ffffff', fontWeight: 600 }}>{mat.name}</td>
                                    <td>
                                        <StockValue isLow={mat.stock <= mat.threshold}>
                                            {mat.stock} kg
                                            {mat.stock <= mat.threshold && <FaExclamationTriangle style={{ fontSize: '0.8rem' }} />}
                                        </StockValue>
                                    </td>
                                    <td style={{ opacity: 0.4 }}>{mat.threshold}</td>
                                    <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', opacity: 0.6 }}>{mat.alertTime}</td>
                                    <td>
                                        <Input
                                            type="number"
                                            placeholder="Set qty..."
                                            value={mat.update}
                                            onChange={(e) => handleInputChange(mat.id, e.target.value)}
                                        />
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </Table>
                </GlassTable>

                <UpdateButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={updateStock}
                >
                    Update Inventory & Send Alert <FaChartLine />
                </UpdateButton>

                <AnimatePresence>
                    {toast.show && (
                        <AlertToast
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <FaCheckCircle /> {toast.msg}
                        </AlertToast>
                    )}
                </AnimatePresence>
            </Container>
        </>
    );
};

export default InventoryTracker;
