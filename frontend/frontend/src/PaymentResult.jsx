import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Payment result page
// - Reads `success` prop and `orderId` query param to show the payment outcome
// - If payment succeeded and an orderId exists, it attempts to finalize/save the order
//   by calling `POST /api/payments/finalize` (requires JWT token)
// - Shows status, provider, and next-steps with primary/secondary CTAs

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #020617;
  color: #e5e7eb;
  font-family: 'Manrope', sans-serif;
  padding: 32px 16px;
`;

const Card = styled(motion.div)`
  width: 100%;
  max-width: 520px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75);
  padding: 28px 26px 24px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;

const TitleBlock = styled.div``;

const Heading = styled.h1`
  margin: 0 0 4px;
  font-family: 'Playfair Display', serif;
  font-size: 1.9rem;
  letter-spacing: 0.02em;
`;

const SubHeading = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: rgba(148, 163, 184, 0.9);
`;

const StatusIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $success }) =>
    $success ? 'rgba(22, 163, 74, 0.12)' : 'rgba(239, 68, 68, 0.12)'};
  border: 1px solid
    ${({ $success }) =>
      $success ? 'rgba(34, 197, 94, 0.9)' : 'rgba(248, 113, 113, 0.9)'};
  color: ${({ $success }) => ($success ? '#bbf7d0' : '#fecaca')};
`;

const InfoGrid = styled.div`
  margin-top: 10px;
  padding: 16px 14px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(55, 65, 81, 0.8);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const InfoLabel = styled.div`
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(148, 163, 184, 0.9);
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 0.98rem;
  font-weight: 600;
  color: #f9fafb;
`;

const Note = styled.p`
  margin-top: 16px;
  font-size: 0.85rem;
  color: rgba(148, 163, 184, 0.9);
`;

const ActionsRow = styled.div`
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PrimaryButton = styled.button`
  flex: 1;
  min-width: 140px;
  padding: 11px 18px;
  border-radius: 999px;
  border: none;
  background: #c0a062;
  color: #111827;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;

  &:hover {
    background: #d4b886;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(192, 160, 98, 0.35);
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  min-width: 140px;
  padding: 11px 18px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: transparent;
  color: #e5e7eb;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(15, 23, 42, 0.9);
    border-color: #cbd5f5;
  }
`;

const PaymentResult = ({ success }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState(null);

  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');

  const paymentStatusLabel = useMemo(() => {
    if (!success) return 'Not completed';
    if (finalizing) return 'Finalizing order...';
    // Treat successful payment as Paid in the UI regardless of finalize errors.
    return 'Paid';
  }, [success, finalizing]);

  useEffect(() => {
    // If payment was successful and an orderId is present, attempt to persist the
    // order server-side so it becomes visible in order history. This is a best-effort
    // network call; UI still treats payment as successful even if finalize fails.
    const runFinalize = async () => {
      if (!success || !orderId) return;

      setFinalizeError(null);
      setFinalizing(true);

      // Require authentication token to finalize the order
      const token = localStorage.getItem('token');
      if (!token) {
        setFinalizing(false);
        navigate('/login');
        return;
      }

      try {
        const resp = await fetch('http://localhost:5000/api/payments/finalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ orderId })
        });

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || !data.success) {
          // Keep a user-visible message but do not block the success UI
          setFinalizeError(data.error || 'Could not save the order to the database.');
          setFinalizing(false);
          return;
        }

        setFinalizing(false);
      } catch (e) {
        console.error('Finalize error:', e);
        setFinalizeError('Network error. Could not save the order to the database.');
        setFinalizing(false);
      }
    };

    runFinalize();
  }, [success, orderId, navigate]);

  const handlePrimary = () => {
    if (success && orderId) {
      navigate(`/customer/order/${orderId}`);
    } else if (success) {
      navigate('/customer/catalog');
    } else {
      navigate('/customer/place-order');
    }
  };

  const handleSecondary = () => {
    navigate('/customer/catalog');
  };

  return (
    <Page>
      <Card
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HeaderRow>
          <TitleBlock>
            <Heading>{success ? 'Payment Successful' : 'Payment Failed'}</Heading>
            <SubHeading>
              {success
                ? 'Your advance payment has been securely processed.'
                : 'We could not complete your payment. No funds were charged.'}
            </SubHeading>
          </TitleBlock>
          <StatusIcon $success={success}>
            {success ? <FaCheckCircle size={26} /> : <FaTimesCircle size={26} />}
          </StatusIcon>
        </HeaderRow>

        <InfoGrid>
          {orderId && (
            <div>
              <InfoLabel>Order ID</InfoLabel>
              <InfoValue>{orderId}</InfoValue>
            </div>
          )}
          <div>
            <InfoLabel>Payment Status</InfoLabel>
            <InfoValue>{paymentStatusLabel}</InfoValue>
          </div>
          <div>
            <InfoLabel>Provider</InfoLabel>
            <InfoValue>PayHere (Sandbox)</InfoValue>
          </div>
          <div>
            <InfoLabel>Next Step</InfoLabel>
            <InfoValue>{success ? 'We will begin processing your order.' : 'You can try the payment again.'}</InfoValue>
          </div>
        </InfoGrid>

        <Note>
          A detailed receipt will be available in your order history. If you have
          any questions about this payment, please contact our support team with
          your order ID.
          {finalizeError ? `\n\nOrder save error: ${finalizeError}` : ''}
        </Note>

        <ActionsRow>
          <PrimaryButton onClick={handlePrimary} disabled={success && orderId && finalizing}>
            {success
              ? orderId
                ? 'View Order Details'
                : 'Back to Catalog'
              : 'Try Payment Again'}
          </PrimaryButton>
          <SecondaryButton onClick={handleSecondary}>Back to Catalog</SecondaryButton>
        </ActionsRow>
      </Card>
    </Page>
  );
};

export default PaymentResult;
