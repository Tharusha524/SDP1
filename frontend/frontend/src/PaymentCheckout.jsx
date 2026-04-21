import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FaLock, FaArrowLeft } from "react-icons/fa";

const Page = styled.div`
  min-height: 100vh;
  background: #020617;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #e5e7eb;
  font-family: "Manrope", sans-serif;
`;

const Card = styled(motion.div)`
  width: 100%;
  max-width: 520px;
  background: rgba(15, 23, 42, 0.96);
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.75);
  padding: 24px 24px 22px;
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
  font-family: "Playfair Display", serif;
  font-size: 1.8rem;
  letter-spacing: 0.03em;
`;

const SubHeading = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: rgba(148, 163, 184, 0.9);
`;

const SecureBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.19);
  border: 1px solid rgba(34, 197, 94, 0.9);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #bbf7d0;
`;

const SummaryBox = styled.div`
  margin-top: 14px;
  padding: 16px 14px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(55, 65, 81, 0.9);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Label = styled.div`
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(148, 163, 184, 0.9);
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-size: 0.98rem;
  font-weight: 600;
  color: #f9fafb;
`;

const Divider = styled.div`
  height: 1px;
  margin: 18px 0 12px;
  background: radial-gradient(circle at left, rgba(148, 163, 184, 0.7), transparent);
`;


const HelperText = styled.div`
  margin-top: 8px;
  font-size: 0.78rem;
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
  min-width: 160px;
  padding: 12px 18px;
  border-radius: 999px;
  border: none;
  background: #c0a062;
  color: #111827;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;

  &:hover {
    background: #d4b886;
    transform: translateY(-1px);
    box-shadow: 0 10px 26px rgba(192, 160, 98, 0.4);
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  min-width: 140px;
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: transparent;
  color: #e5e7eb;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(15, 23, 42, 0.9);
    border-color: #cbd5f5;
  }
`;

const ErrorBox = styled.div`
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.85);
  font-size: 0.82rem;
  color: #fecaca;
`;

function PaymentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    items,
    details,
    productName,
    totalPrice,
    advanceAmount,
    remainingAmount
  } = state;

  const normalizedItems = Array.isArray(items) ? items : [];

  const customerName = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.name || "";
    } catch {
      return "";
    }
  })();

  const handleBack = () => {
    navigate("/customer/place-order");
  };

  

  const handlePayHere = async () => {
    setError(null);
    if (!hasState) {
      setError("Payment session has expired. Please start again.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch("http://localhost:5000/api/payments/payhere-init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: normalizedItems, details }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setError(data.error || "Could not initiate PayHere payment.");
        setSubmitting(false);
        return;
      }

      const { payhereUrl, params } = data;
      if (!payhereUrl || !params) {
        setError("PayHere response missing required data.");
        setSubmitting(false);
        return;
      }

      // Build and submit form to PayHere (POST)
      const form = document.createElement("form");
      form.method = "POST";
      form.action = payhereUrl;
      form.style.display = "none";

      Object.keys(params).forEach((k) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = params[k];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      console.error("PayHere init error:", e);
      setError("Network error. Could not start PayHere.");
      setSubmitting(false);
    }
  };

  const advanceLabel = advanceAmount ? advanceAmount.toLocaleString() : "-";
  const totalLabel = totalPrice ? totalPrice.toLocaleString() : "-";
  const remainingLabel = remainingAmount ? remainingAmount.toLocaleString() : "-";

  const hasState = Boolean(normalizedItems.length && totalPrice);

  return (
    <Page>
      <Card
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HeaderRow>
          <TitleBlock>
            <Heading>Secure Payment</Heading>
            <SubHeading>
              Review your 40% advance and complete your payment securely.
            </SubHeading>
          </TitleBlock>
          <SecureBadge>
            <FaLock size={11} /> SECURE
          </SecureBadge>
        </HeaderRow>

        {!hasState && (
          <>
            <ErrorBox>
              Payment session not found. This can happen if you refreshed the
              page or opened this link directly.
            </ErrorBox>
            <ActionsRow>
              <SecondaryButton onClick={handleBack}>
                <FaArrowLeft size={12} /> Back to Order
              </SecondaryButton>
            </ActionsRow>
          </>
        )}

        {hasState && (
          <>
            <SummaryBox>
              <div>
                <Label>Customer</Label>
                <Value>{customerName || "Customer"}</Value>
              </div>
              <div>
                <Label>Products</Label>
                <Value>{productName || `${normalizedItems.length} item(s)`}</Value>
              </div>
              <div>
                <Label>Total</Label>
                <Value>Rs. {totalLabel}</Value>
              </div>
              <div>
                <Label>40% Advance</Label>
                <Value>Rs. {advanceLabel}</Value>
              </div>
              <div>
                <Label>Remaining on Pickup</Label>
                <Value>Rs. {remainingLabel}</Value>
              </div>
              <div>
                <Label>Notes</Label>
                <Value>{details || "No special notes"}</Value>
              </div>
            </SummaryBox>

            <Divider />

            <HelperText>
              You will be redirected to the PayHere sandbox to complete the
              40% advance payment securely.
            </HelperText>

            {error && <ErrorBox>{error}</ErrorBox>}

            <ActionsRow>
              <PrimaryButton onClick={handlePayHere} disabled={submitting}>
                <FaLock size={12} />
                {submitting ? "Processing..." : "Proceed to PayHere"}
              </PrimaryButton>
              <SecondaryButton onClick={handleBack} disabled={submitting}>
                <FaArrowLeft size={12} /> Back to Order
              </SecondaryButton>
            </ActionsRow>
          </>
        )}
      </Card>
    </Page>
  );
}

export default PaymentCheckout;
