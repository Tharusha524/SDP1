import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Page = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at top left, #1a1a1a, #0b0b0f);
  color: #f3f4f6;
  font-family: 'Manrope', sans-serif;
`;

const TopBar = styled.header`
  padding: 24px 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 15, 20, 0.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  z-index: 20;
`;

const Title = styled.h1`
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 1.7rem;
  letter-spacing: 1px;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  border-radius: 999px;
  border: 1px solid rgba(192, 160, 98, 0.6);
  background: transparent;
  color: #e5d8b0;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(192, 160, 98, 0.18);
    border-color: #c0a062;
    color: #fffbe6;
  }
`;

const Content = styled.main`
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 6%;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.6fr);
  gap: 28px;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Card = styled(motion.div)`
  background: radial-gradient(circle at top left, rgba(32, 32, 40, 0.98), rgba(15, 15, 22, 0.98));
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.55);
  padding: 22px 22px 24px;
`;

const CardTitle = styled.h2`
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #e2d3b2;
  margin: 0 0 16px;
`;

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const AvatarInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const AvatarCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #facc6b, #c28b39);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: #111827;
  box-shadow: 0 12px 30px rgba(251, 191, 36, 0.35);
`;

const AvatarText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Greeting = styled.div`
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.75);
`;

const PrimaryName = styled.div`
  font-size: 1.05rem;
  font-weight: 600;
  color: #f9fafb;
`;

const MetricsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const MetricCard = styled.div`
  min-width: 120px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.45);
`;

const MetricLabel = styled.div`
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.9);
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 0.98rem;
  font-weight: 600;
  color: #e5e7eb;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px 0;
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(248, 250, 252, 0.6);
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 0.98rem;
  font-weight: 600;
  color: #f9fafb;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const OrdersWrapper = styled.div`
  overflow-x: auto;
  margin-top: 6px;
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const OrdersHeadCell = styled.th`
  text-align: left;
  padding: 10px 10px;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.75);
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
`;

const OrdersRow = styled.tr`
  cursor: pointer;
  transition: background 0.18s ease, transform 0.12s ease;

  &:nth-child(even) {
    background: rgba(15, 23, 42, 0.45);
  }

  &:hover {
    background: rgba(30, 64, 175, 0.45);
    transform: translateY(-1px);
  }
`;

const OrdersCell = styled.td`
  padding: 9px 10px;
  color: #e5e7eb;
  white-space: nowrap;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: ${({ $status }) =>
    $status === 'PENDING'
      ? 'rgba(250, 204, 21, 0.1)'
      : $status === 'COMPLETED'
      ? 'rgba(22, 163, 74, 0.16)'
      : 'rgba(148, 163, 184, 0.16)'};
  border: 1px solid
    ${({ $status }) =>
      $status === 'PENDING'
        ? 'rgba(250, 204, 21, 0.7)'
        : $status === 'COMPLETED'
        ? 'rgba(34, 197, 94, 0.8)'
        : 'rgba(148, 163, 184, 0.7)'};
  color: ${({ $status }) =>
    $status === 'PENDING'
      ? '#facc15'
      : $status === 'COMPLETED'
      ? '#bbf7d0'
      : '#e5e7eb'};
`;

const MessageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #1a1a1a, #0b0b0f);
  color: #e5e7eb;
  font-family: 'Manrope', sans-serif;
`;

function CustomerProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    let parsedUser = null;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      navigate('/login');
      return;
    }

    if (!parsedUser || parsedUser.role !== 'customer') {
      navigate('/customer/catalog');
      return;
    }

    setUser(parsedUser);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, ordersRes] = await Promise.all([
          fetch('http://localhost:5000/api/customers/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/orders/my', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileRes.json();
        const ordersData = await ordersRes.json();

        if (!profileData.success) {
          throw new Error(profileData.error || 'Failed to load profile');
        }
        if (!ordersData.success) {
          throw new Error(ordersData.error || 'Failed to load orders');
        }

        setProfile(profileData.customer);
        setOrders(ordersData.orders || []);
      } catch (e) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const displayName = profile?.Name || user?.name || 'Customer';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.TotalPrice || 0), 0);
  const pendingCount = orders.filter((o) => o.Status === 'PENDING').length;

  if (loading) {
    return (
      <MessageWrapper>
        <p>Loading your profile...</p>
      </MessageWrapper>
    );
  }

  if (error) {
    return (
      <MessageWrapper>
        <div>
          <p style={{ marginBottom: '12px', color: '#fecaca' }}>{error}</p>
          <BackButton onClick={() => navigate('/customer/catalog')}>Back to Catalog</BackButton>
        </div>
      </MessageWrapper>
    );
  }

  return (
    <Page>
      <TopBar>
        <Title>My Profile</Title>
        <BackButton onClick={() => navigate('/customer/catalog')}>Back to Catalog</BackButton>
      </TopBar>

      <Content>
        <Card
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <CardTitle>Customer Details</CardTitle>
          <AvatarRow>
            <AvatarInfo>
              <AvatarCircle>{initials}</AvatarCircle>
              <AvatarText>
                <Greeting>Welcome back</Greeting>
                <PrimaryName>{displayName}</PrimaryName>
              </AvatarText>
            </AvatarInfo>
          </AvatarRow>
          <InfoGrid>
            <div>
              <InfoLabel>Name</InfoLabel>
              <InfoValue>{profile?.Name || user?.name}</InfoValue>
            </div>
            <div>
              <InfoLabel>Customer ID</InfoLabel>
              <InfoValue>{profile?.CustomerID}</InfoValue>
            </div>
            <div>
              <InfoLabel>Email</InfoLabel>
              <InfoValue>{profile?.Email || user?.email}</InfoValue>
            </div>
            <div>
              <InfoLabel>Contact Number</InfoLabel>
              <InfoValue>{profile?.ContactNo || 'N/A'}</InfoValue>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <InfoLabel>Address</InfoLabel>
              <InfoValue>{profile?.Address || 'Not provided'}</InfoValue>
            </div>
          </InfoGrid>
        </Card>

        <Card
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <CardTitle>Order History</CardTitle>
          {orders.length > 0 && (
            <MetricsRow>
              <MetricCard>
                <MetricLabel>Total Orders</MetricLabel>
                <MetricValue>{totalOrders}</MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricLabel>Pending</MetricLabel>
                <MetricValue>{pendingCount}</MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricLabel>Total Spent (Rs.)</MetricLabel>
                <MetricValue>{totalSpent.toFixed(2)}</MetricValue>
              </MetricCard>
            </MetricsRow>
          )}
          {orders.length === 0 ? (
            <p style={{ color: '#9ca3af', marginTop: '4px' }}>
              You have not placed any orders yet.
            </p>
          ) : (
            <OrdersWrapper>
              <OrdersTable>
                <thead>
                  <tr>
                    <OrdersHeadCell>Order ID</OrdersHeadCell>
                    <OrdersHeadCell>Date</OrdersHeadCell>
                    <OrdersHeadCell>Status</OrdersHeadCell>
                    <OrdersHeadCell>Items</OrdersHeadCell>
                    <OrdersHeadCell style={{ textAlign: 'right' }}>Total (Rs.)</OrdersHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <OrdersRow
                      key={o.OrderID}
                      onClick={() => navigate(`/customer/order/${o.OrderID}`)}
                    >
                      <OrdersCell>{o.OrderID}</OrdersCell>
                      <OrdersCell>
                        {o.OrderDate ? new Date(o.OrderDate).toLocaleString() : ''}
                      </OrdersCell>
                      <OrdersCell>
                        <StatusBadge $status={o.Status}>{o.Status}</StatusBadge>
                      </OrdersCell>
                      <OrdersCell style={{ whiteSpace: 'normal' }}>{o.Items}</OrdersCell>
                      <OrdersCell style={{ textAlign: 'right' }}>
                        {Number(o.TotalPrice || 0).toFixed(2)}
                      </OrdersCell>
                    </OrdersRow>
                  ))}
                </tbody>
              </OrdersTable>
            </OrdersWrapper>
          )}
        </Card>
      </Content>
    </Page>
  );
}

export default CustomerProfile;
