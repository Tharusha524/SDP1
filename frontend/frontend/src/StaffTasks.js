import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTasks, FaCheckCircle, FaClock, FaClipboardList, FaArrowRight, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// --- Global Luxury Styles ---
const GlobalStyle = createGlobalStyle`
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
  display: flex;
  flex-direction: column;
  background: transparent;
  position: relative;
  overflow-x: hidden;
`;

const Header = styled(motion.header)`
  padding: 20px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(25, 25, 25, 0.4);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 20px 25px;
  }
`;

const Logo = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  letter-spacing: 2px;
  font-weight: 700;
  color: #c0a062;
  text-transform: uppercase;
  cursor: pointer;
  text-shadow: 0 2px 10px rgba(192, 160, 98, 0.3);
`;

const UserActions = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NotificationBtn = styled.button`
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: #fff;
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    right: 2px;
    width: 6px;
    height: 6px;
    background: #c0a062;
    border-radius: 50%;
  }
`;

const Main = styled.main`
  padding: 60px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 40px 25px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 60px;
  text-align: left;
`;

const Title = styled(motion.h1)`
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  font-weight: 500;
  margin-bottom: 15px;
  letter-spacing: -1px;
  color: #f3f4f6;
  text-shadow: 0 4px 15px rgba(0,0,0,0.5);
`;

const Subtitle = styled(motion.p)`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 600;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px;
  height: fit-content;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
`;

const CardTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #c0a062;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const TaskTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 20px 15px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.6);
    border-bottom: 2px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.08);
  }

  td {
    padding: 25px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.95rem;
    vertical-align: middle;
    color: rgba(255, 255, 255, 0.85);
  }
`;

const PriorityBadge = styled.span`
  padding: 6px 14px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 800;
  border-radius: 20px;
  background: ${props => props.type === 'High' ? 'rgba(239, 68, 68, 0.15)' : props.type === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'};
  color: ${props => props.type === 'High' ? '#ff6b6b' : props.type === 'Medium' ? '#f59e0b' : '#10b981'};
  border: 1px solid ${props => props.type === 'High' ? 'rgba(239, 68, 68, 0.3)' : props.type === 'Medium' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'};
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: ${props => props.completed ? '#10b981' : '#f59e0b'};
`;

const ActionButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
  padding: 10px 20px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: #c0a062;
    color: #111827;
    border-color: #c0a062;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(192, 160, 98, 0.3);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 15px;
  color: #fff;
  font-family: inherit;
  outline: none;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:focus {
    border-color: #c0a062;
    background: rgba(255, 255, 255, 0.12);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 15px;
  color: #fff;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:focus {
    border-color: #c0a062;
  }

  option {
    background: #1a1a1a;
    color: #f3f4f6;
  }
`;

const SubmitButton = styled(motion.button)`
  background: #c0a062;
  color: #111827;
  border: none;
  padding: 18px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(192, 160, 98, 0.2);

  &:hover {
    background: #d4b886;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(192, 160, 98, 0.3);
  }
`;

const initialTasks = [
  { id: 'TSK-4001', desc: 'Mix the sand and stone powder', status: 'Pending', priority: 'High' },
  { id: 'TSK-4002', desc: 'Apply the coating', status: 'Pending', priority: 'Medium' },
  { id: 'TSK-4003', desc: 'Mix all ingredients', status: 'Pending', priority: 'Low' },
];

export default function StaffTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(initialTasks);
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [notification, setNotification] = useState({ show: false, msg: '' });

  const markComplete = (idx) => {
    setTasks((prev) =>
      prev.map((task, i) =>
        i === idx ? { ...task, status: 'Completed' } : task
      )
    );
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (orderId && orderStatus) {
      setNotification({
        show: true,
        msg: `Order #${orderId} has been updated to ${orderStatus}.`,
      });
      setOrderId('');
      setOrderStatus('');
      setTimeout(() => setNotification({ show: false, msg: '' }), 4000);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Logo onClick={() => navigate('/')}>Marukawa</Logo>
          <UserActions>
            <NotificationBtn title="Notifications">
              <FaBell />
            </NotificationBtn>
            <ActionButton onClick={() => navigate('/login')} style={{ padding: '8px 15px' }}>
              <FaSignOutAlt />
            </ActionButton>
          </UserActions>
        </Header>

        <Main>
          <PageHeader>
            <Subtitle
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Staff Portal / Operations
            </Subtitle>
            <Title
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Daily Allocations
            </Title>
          </PageHeader>

          <SectionGrid>
            <GlassCard
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <CardTitle><FaClipboardList /> Current Tasks</CardTitle>
              <TaskTable>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Requirement</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <motion.tr key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + idx * 0.1 }}>
                      <td><span style={{ color: '#c0a062', fontWeight: 600 }}>#{task.id}</span></td>
                      <td>{task.desc}</td>
                      <td><PriorityBadge type={task.priority}>{task.priority}</PriorityBadge></td>
                      <td>
                        <StatusIndicator completed={task.status === 'Completed'}>
                          {task.status === 'Completed' ? <FaCheckCircle /> : <FaClock />}
                          {task.status}
                        </StatusIndicator>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {task.status === 'Pending' ? (
                          <ActionButton
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markComplete(idx)}
                          >
                            Mark Complete
                          </ActionButton>
                        ) : (
                          <span style={{ color: '#10b981', fontStyle: 'italic', fontSize: '0.85rem' }}>Fullfilled</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </TaskTable>
            </GlassCard>

            <GlassCard
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <CardTitle><FaTasks /> Update Order</CardTitle>
              <Form onSubmit={handleOrderSubmit}>
                <FormGroup>
                  <Label>Order Identifier</Label>
                  <Input
                    type="text"
                    placeholder="e.g., ORD-1029"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Progress Status</Label>
                  <Select
                    value={orderStatus}
                    onChange={e => setOrderStatus(e.target.value)}
                    required
                  >

                    <option value="pending">Processing</option>

                    <option value="completed">completed</option>

                  </Select>
                </FormGroup>
                <SubmitButton
                  whileHover={{ backgroundColor: '#e0d6c2' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                >
                  Confirm Dispatch
                </SubmitButton>
              </Form>

              <AnimatePresence>
                {notification.show && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: '25px', padding: '15px', borderLeft: '2px solid #c0a062', background: 'rgba(192, 160, 98, 0.05)', fontSize: '0.85rem', color: '#c0a062' }}
                  >
                    {notification.msg}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </SectionGrid>
        </Main>
      </Container>
    </>
  );
}
