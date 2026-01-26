import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import HandleInventory from "./HandleInventory.js";
import CatalogManage from "./CatalogManage.js";

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
      case 'Completed': return 'background: #d1fae5; color: #047857;';
      case 'Pending': return 'background: #fef3c7; color: #b45309;';
      case 'Cancelled': return 'background: #fee2e2; color: #b91c1c;';
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
};


// --- Views ---

const DashboardView = () => (
  <>
    <StatsGrid>
      <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} color="#3b82f6">
        <StatLabel>Total Orders</StatLabel>
        <StatValue>1,284</StatValue>
        <StatTrend className="positive">↑ 12% from last week</StatTrend>
      </StatCard>
      <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} color="#10b981">
        <StatLabel>Revenue</StatLabel>
        <StatValue>Rs. 1.8M</StatValue>
        <StatTrend className="positive">↑ 8% from last month</StatTrend>
      </StatCard>
      <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} color="#f59e0b">
        <StatLabel>Pending Tasks</StatLabel>
        <StatValue>14</StatValue>
        <StatTrend className="negative">↓ 2 urgent</StatTrend>
      </StatCard>
      <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} color="#6366f1">
        <StatLabel>Active Inventory</StatLabel>
        <StatValue>856</StatValue>
        <StatTrend className="positive">Items in stock</StatTrend>
      </StatCard>
    </StatsGrid>

    <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Orders</h3>
        <ActionButton style={{ fontSize: '0.8rem', padding: '6px 12px' }}>View All</ActionButton>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {[{ id: 'ORD-1043', name: 'Kavindu H.', item: 'Luxury Sofa Set', price: 'Rs 85,000', status: 'Pending' },
          { id: 'ORD-1042', name: 'Nisansala G.', item: 'Ceramic Vase x2', price: 'Rs 4,600', status: 'Completed' },
          { id: 'ORD-1041', name: 'Amal Perera', item: 'Office Desk', price: 'Rs 15,500', status: 'Completed' },
          { id: 'ORD-1040', name: 'Ruwan S.', item: 'Dining Table', price: 'Rs 42,000', status: 'Cancelled' }
          ].map(order => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.name}</td>
              <td>{order.item}</td>
              <td>{order.price}</td>
              <td><StatusChip status={order.status}>{order.status}</StatusChip></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ContentCard>
  </>
);

const OrdersView = () => (
  <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h3>Orders Management</h3>
    <Table>
      <thead>
        <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Quantity</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr><td>101</td><td>Kavindu Herath</td><td>Flower Vases</td><td>20</td><td><StatusChip status="Pending">Pending</StatusChip></td></tr>
        <tr><td>102</td><td>Nisansala Gamage</td><td>Chairs</td><td>50</td><td><StatusChip status="Completed">Completed</StatusChip></td></tr>
        <tr><td>103</td><td>Sandaruwan Perera</td><td>Sofas</td><td>2</td><td><StatusChip status="Pending">Pending</StatusChip></td></tr>
      </tbody>
    </Table>
  </ContentCard>
);

const StaffView = () => (
  <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h3>Staff Directory</h3>
    <Table>
      <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Contact</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>S01</td><td>Saman Rathnasiri</td><td>Manager</td><td>0712345678</td><td><StatusChip status="Completed">Active</StatusChip></td></tr>
        <tr><td>S02</td><td>Harsha Thennakoon</td><td>Logistics</td><td>0723456789</td><td><StatusChip status="Completed">Active</StatusChip></td></tr>
        <tr><td>S03</td><td>Madhura Roopasinghe</td><td>Sales</td><td>0734567890</td><td><StatusChip status="Pending">Leave</StatusChip></td></tr>
      </tbody>
    </Table>
  </ContentCard>
);

const InventoryView = () => (
  <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h3>Current Inventory Levels</h3>
    <Table>
      <thead><tr><th>ID</th><th>Material/Item</th><th>Quantity</th><th>Last Updated</th></tr></thead>
      <tbody>
        <tr><td>INV-101</td><td>Cement</td><td>120 bags</td><td>2025-10-19</td></tr>
        <tr><td>INV-102</td><td>Sand</td><td>10 cubes</td><td>2025-10-19</td></tr>
        <tr><td>INV-103</td><td>Stone Powder</td><td>15 cubes</td><td>2025-10-19</td></tr>
      </tbody>
    </Table>
  </ContentCard>
);

const ReportsView = () => (
  <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h3>Business Analytics</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', margin: '24px 0' }}>
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
        [Revenue Chart Placeholder]
      </div>
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
        [Orders Growth Chart Placeholder]
      </div>
    </div>
    <Table>
      <thead><tr><th>Period</th><th>Orders</th><th>Revenue</th><th>Growth</th></tr></thead>
      <tbody>
        <tr><td>This Week</td><td>45</td><td>Rs. 850,000</td><td style={{ color: '#10b981' }}>+12.5%</td></tr>
        <tr><td>This Month</td><td>180</td><td>Rs. 3,250,000</td><td style={{ color: '#10b981' }}>+18.2%</td></tr>
      </tbody>
    </Table>
  </ContentCard>
);

// Main Component
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Task Allocation State
  const [taskForm, setTaskForm] = useState({
    staff: 'Saman Rathnasiri',
    description: ''
  });
  const [existingTasks, setExistingTasks] = useState([
    { staff: 'Saman Rathnasiri', description: 'Mix the sand and stone powder', status: 'Pending' },
    { staff: 'Harsha Thennakoon', description: 'Apply the coating', status: 'Pending' },
    { staff: 'Madhura Rajapaksa', description: 'Mix all ingredients', status: 'Pending' }
  ]);

  // Auto-close sidebar on mobile nav
  useEffect(() => {
    if (window.innerWidth <= 1024) setSidebarOpen(false);
  }, [activeTab]);

  // Handle task form input changes
  const handleTaskInputChange = (field, value) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle assign task button click
  const handleAssignTask = () => {
    if (!taskForm.description.trim()) {
      alert('Please enter a task description');
      return;
    }

    const newTask = {
      staff: taskForm.staff,
      description: taskForm.description,
      status: 'Pending'
    };

    setExistingTasks(prev => [...prev, newTask]);
    
    // Reset form
    setTaskForm({
      staff: 'Saman Rathnasiri',
      description: ''
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard": return <DashboardView />;
      case "Orders": return <OrdersView />;
      case "Staff": return <StaffView />;
      case "Inventory": return <InventoryView />;
      case "Handle Inventory": return <HandleInventory />;
      case "Manage Catalog": return <CatalogManage />;
      case "Stock Alerts": return (
        <ContentCard>
          <h3>Stock Alerts</h3>
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <div style={{ padding: '16px', background: 'rgba(249, 115, 22, 0.15)', borderLeft: '4px solid #f97316', borderRadius: '4px', color: '#f3f4f6' }}>
              <strong>Low Stock Warning</strong>: Cement is below 20% threshold.
            </div>
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.15)', borderLeft: '4px solid #ef4444', borderRadius: '4px', color: '#f3f4f6' }}>
              <strong>Critical</strong>: Fine Sand out of stock.
            </div>
          </div>
        </ContentCard>
      );
      case "Reports": return <ReportsView />;
      case "Allocate Task": return (
        <>
          <ContentCard style={{ maxWidth: '600px', background: 'rgba(255,255,255,0.03)' }}>
            <h3>Allocate Task</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Select Staff</label>
              <select 
                value={taskForm.staff}
                onChange={(e) => handleTaskInputChange('staff', e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: '#fff',
                  outline: 'none'
                }}>
                <option>Saman Rathnasiri</option>
                <option>Harsha Thennakoon</option>
                <option>Madhura Rajapaksa</option>
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Task Description</label>
              <textarea 
                rows="4"
                value={taskForm.description}
                onChange={(e) => handleTaskInputChange('description', e.target.value)}
                placeholder="Enter task description..."
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: '#fff',
                  outline: 'none',
                  resize: 'none'
                }}></textarea>
            </div>
            <ActionButton onClick={handleAssignTask}>Assign Task</ActionButton>
          </ContentCard>

          <ContentCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3>Existing Task Allocations</h3>
            <Table>
              <thead>
                <tr>
                  <th>Assigned Staff</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {existingTasks.map((task, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{task.staff}</td>
                    <td>{task.description}</td>
                    <td><StatusChip status={task.status}>{task.status}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ContentCard>
        </>
      );
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
            <NavItem $active={activeTab === "Stock Alerts"} onClick={() => setActiveTab("Stock Alerts")}>
              <Icons.Alerts /> Stock Alerts
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
