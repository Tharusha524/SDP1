import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HandleInventory from "./HandleInventory.js";
import CatalogManage from "./CatalogManage.js";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE = 'http://localhost:5000';
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

// --- Global Styles for Admin ---
const GlobalStyle = createGlobalStyle`
  body {
    background: radial-gradient(circle at top left, #1a1a1a, #0d0d0d);
    font-family: 'Manrope', 'Segoe UI', sans-serif;
    margin: 0;
    padding: 0;
    color: #f3f4f6;
    min-height: 100vh;
  }
  
  * {
    box-sizing: border-box;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05); 
  }
  ::-webkit-scrollbar-thumb {
    background: #c0a062; /* Gold scrollbar */
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #d4b886; 
  }
`;

// --- Styled Components ---

const AdminLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: transparent;
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
    background: radial-gradient(circle, rgba(192, 160, 98, 0.06) 0%, transparent 70%);
    filter: blur(70px);
    z-index: -1;
  }
`;

// Sidebar
const SidebarPanel = styled(motion.aside)`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: rgba(17, 17, 17, 0.95);
  backdrop-filter: blur(16px);
  color: #f3f4f6;
  z-index: 200;
  display: flex;
  flex-direction: column;
  box-shadow: 6px 0 24px rgba(0,0,0,0.5);
  padding: 24px;
  overflow-y: auto;
  border-right: 1px solid rgba(255,255,255,0.05);

  @media (max-width: 1024px) {
    transform: translateX(-100%);
  }
  
  &.open {
    transform: translateX(0);
  }
`;

const SidebarOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5); z-index: 150; backdrop-filter: blur(4px);
`;

const Brand = styled.div`
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoText = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #c0a062; /* Gold Logo */
  margin: 0;
  letter-spacing: 1px;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const NavItem = styled.button`
  background: ${props => props.$active ? 'rgba(192, 160, 98, 0.15)' : 'transparent'};
  color: ${props => props.$active ? '#c0a062' : 'rgba(255,255,255,0.6)'};
  border: none;
  border-radius: 12px;
  padding: 14px 16px;
  text-align: left;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: 'Manrope', sans-serif;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(255,255,255,0.05);
    color: #f3f4f6;
    transform: translateX(4px);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: ${props => props.$active ? '60%' : '0'};
    width: 4px;
    background: #c0a062;
    border-radius: 0 4px 4px 0;
    transition: height 0.3s ease;
  }
`;

const UserProfile = styled.div`
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.img`
  width: 40px; height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #c0a062;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  span.name { color: #f3f4f6; font-weight: 600; font-size: 0.9rem; }
  span.role { color: #c0a062; font-size: 0.75rem; font-weight: 600; }
`;

// Main Content
const MainArea = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 32px;
  min-height: 100vh;
  
  @media (max-width: 1024px) {
    margin-left: 0;
    padding: 20px;
  }
`;

const TopBar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const PageHeader = styled.div`
  h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 600;
    color: #f3f4f6;
    margin: 0;
  }
  p {
    color: rgba(255,255,255,0.5);
    margin: 4px 0 0;
    font-size: 0.95rem;
    letter-spacing: 0.5px;
  }
`;

const MobileMenuBtn = styled.button`
  display: none;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  color: #f3f4f6;
  font-size: 1.25rem;
  backdrop-filter: blur(6px);

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// Dashboard Cards
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);

  &::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 80px;
    background: ${props => props.color || '#3b82f6'};
    opacity: 0.08;
    filter: blur(20px);
    border-bottom-left-radius: 50%;
  }
  @apply glass-animated;
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
`;

const StatValue = styled.span`
  color: #f3f4f6;
  font-size: 2.25rem;
  font-weight: 700;
  font-family: 'Manrope', sans-serif;
  letter-spacing: -0.5px;
`;

const StatTrend = styled.span`
  margin-top: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &.positive { color: #10b981; }
  &.negative { color: #ef4444; }
`;

// Tables and Content Containers
const ContentCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  margin-bottom: 24px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 24px;
  
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

const StatusChip = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  
  ${props => {
    switch (props.status) {
      case 'Completed':
      case 'Available': return 'background: #d1fae5; color: #047857;';
      case 'Pending':
      case 'Busy': return 'background: #fef3c7; color: #b45309;';
      case 'Cancelled':
      case 'Offline': return 'background: #fee2e2; color: #b91c1c;';
      case 'In Progress': return 'background: #dbeafe; color: #1d4ed8;';
      default: return 'background: #e5e7eb; color: #374151;';
    }
  }}
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #c0a062 0%, #d4b886 100%);
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(192, 160, 98, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(192, 160, 98, 0.35);
  }
  &:active {
    transform: translateY(0);
  }
`;

// --- SVGs ---
const Icons = {
  Dashboard: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
  Orders: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>,
  Staff: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
  Inventory: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>,
  Reports: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>,
  Catalog: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>,
  Alerts: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>,
  Tasks: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>,
  Logout: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>,
};


// --- Views ---

const DashboardView = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/stats`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmtRevenue = (n) => {
    const num = Number(n || 0);
    if (num >= 1000000) return `Rs. ${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `Rs. ${(num / 1000).toFixed(0)}K`;
    return `Rs. ${num.toLocaleString()}`;
  };

  return (
    <>
      <StatsGrid>
        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} color="#3b82f6">
          <StatLabel>Total Orders</StatLabel>
          <StatValue>{loading ? '...' : Number(stats?.totalOrders || 0).toLocaleString()}</StatValue>
          <StatTrend className="positive">All time orders</StatTrend>
        </StatCard>
        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} color="#10b981">
          <StatLabel>Revenue</StatLabel>
          <StatValue>{loading ? '...' : fmtRevenue(stats?.totalRevenue)}</StatValue>
          <StatTrend className="positive">Cumulative revenue</StatTrend>
        </StatCard>
        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} color="#f59e0b">
          <StatLabel>Pending Tasks</StatLabel>
          <StatValue>{loading ? '...' : Number(stats?.pendingTasks || 0)}</StatValue>
          <StatTrend className="negative">Awaiting completion</StatTrend>
        </StatCard>
        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} color="#6366f1">
          <StatLabel>Active Inventory</StatLabel>
          <StatValue>{loading ? '...' : Number(stats?.activeInventory || 0).toLocaleString()}</StatValue>
          <StatTrend className="positive">Total units in stock</StatTrend>
        </StatCard>
      </StatsGrid>

      <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Orders</h3>
        </div>
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>Loading...</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No orders yet</td></tr>
              ) : recentOrders.map(order => (
                <tr key={order.OrderID}>
                  <td>{order.OrderID}</td>
                  <td>{order.CustomerName}</td>
                  <td>{order.Items || '—'}</td>
                  <td>Rs. {Number(order.TotalPrice || 0).toLocaleString()}</td>
                  <td><StatusChip status={order.Status}>{order.Status}</StatusChip></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </ContentCard>
    </>
  );
};

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/orders`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrders(data.orders || []);
        else setError(data.message || 'Failed to load orders');
      })
      .catch(() => setError('Could not connect to server. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3>Orders Management</h3>
      {loading && <p style={{ color: 'rgba(255,255,255,0.4)', padding: '20px 0' }}>Loading orders...</p>}
      {error && <p style={{ color: '#ef4444', padding: '12px 0' }}>{error}</p>}
      {!loading && !error && (
        <Table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Qty</th>
              <th>Total Price</th>
              <th>Estimated Completion</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No orders found</td></tr>
            ) : orders.map(order => (
              <tr key={order.OrderID}>
                <td>{order.OrderID}</td>
                <td>{order.CustomerName || '—'}</td>
                <td>{order.Items || '—'}</td>
                <td>{order.TotalQuantity ?? 0}</td>
                <td>Rs. {Number(order.TotalPrice || 0).toLocaleString()}</td>
                <td>{order.EstimatedCompletionDate ? new Date(order.EstimatedCompletionDate).toLocaleDateString() : '—'}</td>
                <td><StatusChip status={order.Status}>{order.Status}</StatusChip></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </ContentCard>
  );
};

const StaffView = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/staff`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.success) setStaff(data.staff || []);
        else setError(data.message || 'Failed to load staff');
      })
      .catch(() => setError('Could not connect to server'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3>Staff Directory</h3>
      {loading && <p style={{ color: 'rgba(255,255,255,0.4)', padding: '20px 0' }}>Loading staff...</p>}
      {error && <p style={{ color: '#ef4444', padding: '12px 0' }}>{error}</p>}
      {!loading && !error && (
        <Table>
          <thead><tr><th>Staff ID</th><th>Name</th><th>Contact</th><th>Status</th></tr></thead>
          <tbody>
            {staff.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No staff found</td></tr>
            ) : staff.map(s => (
              <tr key={s.StaffID}>
                <td>{s.StaffID}</td>
                <td>{s.Name}</td>
                <td>{s.ContactNo || '—'}</td>
                <td><StatusChip status={s.Status}>{s.Status}</StatusChip></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </ContentCard>
  );
};

const InventoryView = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/inventory`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.success) setInventory(data.inventory || []);
        else setError(data.message || 'Failed to load inventory');
      })
      .catch(() => setError('Could not connect to server'))
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toISOString().split('T')[0]; } catch { return '—'; }
  };

  return (
    <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3>Current Inventory Levels</h3>
      {loading && <p style={{ color: 'rgba(255,255,255,0.4)', padding: '20px 0' }}>Loading inventory...</p>}
      {error && <p style={{ color: '#ef4444', padding: '12px 0' }}>{error}</p>}
      {!loading && !error && (
        <Table>
          <thead>
            <tr><th>Inventory ID</th><th>Product</th><th>Available Qty</th><th>Min. Threshold</th><th>Last Updated</th></tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No inventory records found</td></tr>
            ) : inventory.map(item => (
              <tr key={item.InventoryID}>
                <td>{item.InventoryID}</td>
                <td>{item.ProductName}</td>
                <td style={{ color: item.AvailableQuantity <= item.MinimumThreshold ? '#ef4444' : 'inherit' }}>
                  {item.AvailableQuantity}
                </td>
                <td>{item.MinimumThreshold}</td>
                <td>{fmtDate(item.LastUpdated)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </ContentCard>
  );
};

const AllocateTaskView = () => {
  const [staffList, setStaffList] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ staffId: '', description: '', orderId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const loadTasks = () => {
    fetch(`${API_BASE}/api/admin/tasks`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => { if (data.success) setTasks(data.tasks || []); })
      .catch(console.error);
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/staff`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.staff.length > 0) {
          setStaffList(data.staff);
          setForm(prev => ({ ...prev, staffId: data.staff[0].StaffID }));
        }
      })
      .catch(console.error);
    loadTasks();
  }, []);

  const handleAssign = () => {
    if (!form.staffId || !form.description.trim()) {
      setSubmitMsg('Please select a staff member and enter a description.');
      return;
    }
    setSubmitting(true);
    fetch(`${API_BASE}/api/admin/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ staffId: form.staffId, description: form.description.trim(), orderId: form.orderId || null })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSubmitMsg(`Task ${data.taskId} assigned successfully!`);
          setForm(prev => ({ ...prev, description: '', orderId: '' }));
          loadTasks();
        } else {
          setSubmitMsg(data.error || 'Failed to assign task');
        }
      })
      .catch(() => setSubmitMsg('Could not connect to server'))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <ContentCard style={{ maxWidth: '600px', background: 'rgba(255,255,255,0.03)' }}>
        <h3>Allocate Task</h3>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Select Staff</label>
          <select
            value={form.staffId}
            onChange={(e) => setForm(prev => ({ ...prev, staffId: e.target.value }))}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none' }}>
            {staffList.map(s => (
              <option key={s.StaffID} value={s.StaffID}>{s.Name}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Task Description</label>
          <textarea
            rows="4"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter task description..."
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none', resize: 'none' }}
          />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Related Order ID (optional)</label>
          <input
            type="text"
            value={form.orderId}
            onChange={(e) => setForm(prev => ({ ...prev, orderId: e.target.value }))}
            placeholder="e.g., OR-0001"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none' }}
          />
        </div>
        {submitMsg && (
          <p style={{ marginBottom: '12px', color: submitMsg.includes('successfully') ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>{submitMsg}</p>
        )}
        <ActionButton onClick={handleAssign} disabled={submitting}>
          {submitting ? 'Assigning...' : 'Assign Task'}
        </ActionButton>
      </ContentCard>

      <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h3>Existing Task Allocations</h3>
        <Table>
          <thead>
            <tr><th>Task ID</th><th>Order ID</th><th>Assigned Staff</th><th>Description</th><th>Status</th></tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No tasks found</td></tr>
            ) : tasks.map(task => (
              <tr key={task.TaskID}>
                <td>{task.TaskID}</td>
                <td>{task.OrderID || '-'}</td>
                <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{task.StaffName}</td>
                <td>{task.Description}</td>
                <td><StatusChip status={task.Status}>{task.Status}</StatusChip></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ContentCard>
    </>
  );
};

const StockAlertsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]= useState(true);

  const fetchNotifs = () => {
    fetch(`${API_BASE}/api/notifications`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => { if (data.success) setNotifications(data.notifications); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markAllRead = async () => {
    await fetch(`${API_BASE}/api/notifications/read-all`, { method: 'PATCH', headers: getAuthHeaders() });
    setNotifications(prev => prev.map(n => ({ ...n, IsRead: 1 })));
  };

  const markRead = async (id) => {
    await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PATCH', headers: getAuthHeaders() });
    setNotifications(prev => prev.map(n => n.NotificationID === id ? { ...n, IsRead: 1 } : n));
  };

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  const typeColor = (type) => {
    if (type === 'Low Stock Alert') return { border: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
    if (type === 'Order Update') return { border: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
    if (type === 'Task Assignment') return { border: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { border: '#c0a062', bg: 'rgba(192,160,98,0.1)' };
  };

  return (
    <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0 }}>
          Stock Alerts &amp; Notifications
          {unreadCount > 0 && (
            <span style={{ marginLeft: '12px', background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '3px 9px', borderRadius: '12px', fontWeight: 700 }}>
              {unreadCount} unread
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#c0a062', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>No notifications.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map(n => {
            const c = typeColor(n.Type);
            return (
              <div key={n.NotificationID} style={{ padding: '14px 18px', background: n.IsRead ? 'rgba(255,255,255,0.03)' : c.bg, borderLeft: `4px solid ${n.IsRead ? 'rgba(255,255,255,0.15)' : c.border}`, borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', opacity: n.IsRead ? 0.5 : 1 }}>
                <div>
                  <div style={{ fontWeight: n.IsRead ? 400 : 700, marginBottom: '4px', color: '#f3f4f6' }}>{n.Message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    {n.Type} &bull; {new Date(n.DateTime).toLocaleString()}
                    {n.RelatedID && <span style={{ marginLeft: '8px', color: '#c0a062' }}>{n.RelatedID}</span>}
                  </div>
                </div>
                {!n.IsRead && (
                  <button onClick={() => markRead(n.NotificationID)} style={{ flexShrink: 0, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem' }}>
                    Dismiss
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ContentCard>
  );
};

const ReportsView = () => {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const headers = getAuthHeaders();
    Promise.all([
      fetch(`${API_BASE}/api/admin/reports/orders`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/inventory`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/tasks`, { headers }).then(r => r.json()),
    ]).then(([ord, inv, tsk]) => {
      if (ord.success) setOrders(ord.orders);
      if (inv.success) setInventory(inv.inventory);
      if (tsk.success) setTasks(tsk.tasks);
    }).catch(() => setError('Failed to load report data.'))
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = (type) => {
    const doc = new jsPDF();
    const now = new Date().toLocaleString();

    doc.setFontSize(20);
    doc.setTextColor(192, 160, 98);
    doc.text('Marukawa Concrete Works', 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text(`Generated: ${now}`, 14, 26);
    doc.setDrawColor(192, 160, 98);
    doc.setLineWidth(0.5);
    doc.line(14, 30, 196, 30);

    if (type === 'orders') {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Orders Report', 14, 40);
      autoTable(doc, {
        startY: 46,
        head: [['Order ID', 'Customer', 'Date', 'Status', 'Total (Rs.)']],
        body: orders.map(o => [
          o.OrderID,
          o.CustomerName,
          o.OrderDate ? new Date(o.OrderDate).toLocaleDateString() : 'N/A',
          o.Status,
          Number(o.TotalPrice).toLocaleString()
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [192, 160, 98], textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 245, 240] },
      });
      doc.save('orders-report.pdf');

    } else if (type === 'inventory') {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Inventory Report', 14, 40);
      autoTable(doc, {
        startY: 46,
        head: [['ID', 'Inventory Name', 'Qty Available', 'Min Threshold', 'Status', 'Last Updated']],
        body: inventory.map(i => [
          i.InventoryID,
          i.InventoryName,
          i.AvailableQuantity,
          i.MinimumThreshold,
          i.AvailableQuantity <= i.MinimumThreshold ? 'LOW STOCK' : 'OK',
          i.LastUpdated ? new Date(i.LastUpdated).toLocaleDateString() : 'N/A'
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [192, 160, 98], textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 245, 240] },
      });
      doc.save('inventory-report.pdf');

    } else if (type === 'tasks') {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Staff Tasks Report', 14, 40);
      autoTable(doc, {
        startY: 46,
        head: [['Task ID', 'Staff', 'Description', 'Priority', 'Status', 'Assigned']],
        body: tasks.map(t => [
          t.TaskID,
          t.StaffName,
          t.Description,
          t.Priority,
          t.Status,
          t.AssignedDate ? new Date(t.AssignedDate).toLocaleDateString() : 'N/A'
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [192, 160, 98], textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 245, 240] },
      });
      doc.save('staff-tasks-report.pdf');
    }
  };

  if (loading) return (
    <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading report data...</p>
    </ContentCard>
  );

  if (error) return (
    <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p style={{ color: '#ef4444' }}>{error}</p>
    </ContentCard>
  );

  const completedOrders = orders.filter(o => o.Status === 'Completed').length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.TotalPrice), 0);
  const lowStockCount = inventory.filter(i => i.AvailableQuantity <= i.MinimumThreshold).length;
  const pendingTasks = tasks.filter(t => t.Status === 'Pending').length;

  const summaryStats = [
    { label: 'Total Orders', value: orders.length },
    { label: 'Completed Orders', value: completedOrders },
    { label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}` },
    { label: 'Low Stock Items', value: lowStockCount },
    { label: 'Pending Tasks', value: pendingTasks },
    { label: 'Total Tasks', value: tasks.length },
  ];

  const reportCards = [
    { type: 'orders', title: 'Orders Report', desc: `${orders.length} total orders — ${completedOrders} completed`, file: 'orders-report.pdf' },
    { type: 'inventory', title: 'Inventory Report', desc: `${inventory.length} items — ${lowStockCount} below threshold`, file: 'inventory-report.pdf' },
    { type: 'tasks', title: 'Staff Tasks Report', desc: `${tasks.length} total tasks — ${pendingTasks} pending`, file: 'tasks-report.pdf' },
  ];

  return (
    <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3 style={{ marginBottom: '30px', fontSize: '1.5rem' }}>Report Generation</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '40px' }}>
        {summaryStats.map(s => (
          <div key={s.label} style={{ background: 'rgba(192,160,98,0.08)', border: '1px solid rgba(192,160,98,0.2)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#c0a062' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {reportCards.map(r => (
          <div key={r.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>{r.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>{r.desc}</div>
            </div>
            <button
              onClick={() => downloadPDF(r.type)}
              style={{ background: '#c0a062', color: '#111827', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: '700', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </ContentCard>
  );
};

// Main Component
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/catalog');
  };

  // Auto-close sidebar on mobile nav
  useEffect(() => {
    if (window.innerWidth <= 1024) setSidebarOpen(false);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard": return <DashboardView />;
      case "Orders": return <OrdersView />;
      case "Staff": return <StaffView />;
      case "Inventory": return <InventoryView />;
      case "Handle Inventory": return <HandleInventory />;
      case "Manage Catalog": return <CatalogManage />;
      case "Stock Alerts": return <StockAlertsView />;
      case "Reports": return <ReportsView />;
      case "Allocate Task": return <AllocateTaskView />;
      default: return <DashboardView />;
    }
  };

  return (
    <>
      <GlobalStyle />
      <AdminLayout>
        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <SidebarOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <SidebarPanel className={sidebarOpen ? 'open' : ''} initial={false}>
          <Brand>
            <div style={{ width: '32px', height: '32px', background: '#c0a062', borderRadius: '6px' }}></div>
            <LogoText>Marukawa</LogoText>
          </Brand>

          <NavList>
            <NavItem $active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")}>
              <Icons.Dashboard /> Dashboard
            </NavItem>
            <NavItem $active={activeTab === "Orders"} onClick={() => setActiveTab("Orders")}>
              <Icons.Orders /> Orders
            </NavItem>
            <NavItem $active={activeTab === "Staff"} onClick={() => setActiveTab("Staff")}>
              <Icons.Staff /> Staff Management
            </NavItem>
            <NavItem $active={activeTab === "Inventory"} onClick={() => setActiveTab("Inventory")}>
              <Icons.Inventory /> Inventory
            </NavItem>
            <NavItem $active={activeTab === "Handle Inventory"} onClick={() => setActiveTab("Handle Inventory")}>
              <Icons.Tasks /> Handle Inventory
            </NavItem>
            <NavItem $active={activeTab === "Manage Catalog"} onClick={() => setActiveTab("Manage Catalog")}>
              <Icons.Catalog /> Manage Catalog
            </NavItem>
            <NavItem $active={activeTab === "Allocate Task"} onClick={() => setActiveTab("Allocate Task")}>
              <Icons.Tasks /> Allocate Task
            </NavItem>
            <NavItem $active={activeTab === "Reports"} onClick={() => setActiveTab("Reports")}>
              <Icons.Reports /> Reports
            </NavItem>
            <NavItem $active={activeTab === "Stock Alerts"} onClick={() => setActiveTab("Stock Alerts")}>
              <Icons.Alerts /> Stock Alerts
            </NavItem>
            <NavItem onClick={handleLogout} style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', color: '#ef4444' }}>
              <Icons.Logout /> Logout
            </NavItem>
          </NavList>

          <UserProfile>
            <Avatar src="https://ui-avatars.com/api/?name=Admin+User&background=c0a062&color=fff" />
            <UserInfo>
              <span className="name">Admin User</span>
              <span className="role">Super Admin</span>
            </UserInfo>
          </UserProfile>
        </SidebarPanel>

        {/* Main Area */}
        <MainArea>
          <TopBar>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <MobileMenuBtn onClick={() => setSidebarOpen(true)}>☰</MobileMenuBtn>
              <PageHeader>
                <h2>{activeTab}</h2>
                <p>Welcome back, here's what's happening today.</p>
              </PageHeader>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Header Actions like Notifications could go here */}
            </div>
          </TopBar>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </MainArea>
      </AdminLayout>
    </>
  );
}
