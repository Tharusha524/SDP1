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

const FakeCardRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
  margin-top: 8px;

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const HelperText = styled.div`
  margin-top: 8px;
  font-size: 0.78rem;
  color: rgba(148, 163, 184, 0.9);
`;

const CardTypeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CardTypeButton = styled.button`
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "rgba(192, 160, 98, 0.95)" : "rgba(75, 85, 99, 0.9)"};
  background: ${({ $active }) =>
    $active ? "rgba(192, 160, 98, 0.16)" : "rgba(15, 23, 42, 0.95)"};
  color: #e5e7eb;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.08s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(209, 213, 219, 0.9);
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid rgba(75, 85, 99, 0.9);
  background: rgba(15, 23, 42, 0.95);
  font-size: 0.86rem;
  color: #e5e7eb;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &::placeholder {
    color: rgba(148, 163, 184, 0.85);
  }

  &:focus {
    border-color: #c0a062;
    box-shadow: 0 0 0 1px rgba(192, 160, 98, 0.6);
    background: rgba(15, 23, 42, 0.98);
  }
`;

const FieldError = styled.div`
  margin-top: 4px;
  font-size: 0.75rem;
  color: #fecaca;
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
  const [cardType, setCardType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const {
    productId,
    quantity,
    details,
    productName,
    totalPrice,
    advanceAmount,
    remainingAmount
  } = state;

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

  const luhnCheck = (num) => {
    let sum = 0;
    let shouldDouble = false;

    for (let i = num.length - 1; i >= 0; i -= 1) {
      let digit = parseInt(num[i], 10);
      if (Number.isNaN(digit)) return false;
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  };

  const validateCardFields = () => {
    const errors = {};

    if (!cardType) {
      errors.cardType = "Select a card type.";
    }

    const digits = cardNumber.replace(/\s+/g, "");
    if (!digits) {
      errors.cardNumber = "Enter your card number.";
    } else if (!/^\d{13,19}$/.test(digits)) {
      errors.cardNumber = "Card number must be 13-19 digits.";
    } else {
      if (cardType === "visa" && !digits.startsWith("4")) {
        errors.cardNumber = "Visa numbers must start with 4.";
      }
      if (cardType === "mastercard" && !/^5[1-5]/.test(digits)) {
        errors.cardNumber = "MasterCard numbers usually start with 51-55.";
      }
      if (!errors.cardNumber && !luhnCheck(digits)) {
        errors.cardNumber = "Card number is invalid.";
      }
    }

    if (!expiry) {
      errors.expiry = "Enter expiry date.";
    } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      errors.expiry = "Use MM/YY format.";
    } else {
      const [mmStr, yyStr] = expiry.split("/");
      const month = parseInt(mmStr, 10);
      const year = 2000 + parseInt(yyStr, 10);
      if (Number.isNaN(month) || month < 1 || month > 12) {
        errors.expiry = "Invalid month.";
      } else {
        const now = new Date();
        const expDate = new Date(year, month, 1);
        const ref = new Date(now.getFullYear(), now.getMonth(), 1);
        if (expDate <= ref) {
          errors.expiry = "Card is expired.";
        }
      }
    }

    if (!cvv) {
      errors.cvv = "Enter CVV.";
    } else if (!/^\d{3}$/.test(cvv)) {
      errors.cvv = "CVV must be 3 digits.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePay = async () => {
    setError(null);
    const validationPassed = validateCardFields();
    if (!validationPassed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!productId || !quantity || !advanceAmount || !totalPrice) {
      setError("Payment session has expired. Please start again.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/payments/card-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity,
          details
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(
          data.error || "Could not complete payment. Please try again in a moment."
        );
        setSubmitting(false);
        return;
      }

      const orderId = data.orderId;
      if (!orderId) {
        setError("Payment completed, but order reference was missing.");
        setSubmitting(false);
        return;
      }

      navigate(`/payment-success?orderId=${encodeURIComponent(orderId)}`, {
        state: {
          estimatedCompletionDate: data.estimatedCompletionDate || null,
        },
      });
    } catch (e) {
      console.error("Error completing payment:", e);
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  const advanceLabel = advanceAmount ? advanceAmount.toLocaleString() : "-";
  const totalLabel = totalPrice ? totalPrice.toLocaleString() : "-";
  const remainingLabel = remainingAmount ? remainingAmount.toLocaleString() : "-";

  const hasState = Boolean(productId && quantity && totalPrice);

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
                <Label>Product</Label>
                <Value>{productName || "Selected item"}</Value>
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

            <FakeCardRow>
              <Label>Card Type</Label>
              <CardTypeRow>
                <CardTypeButton
                  type="button"
                  $active={cardType === "visa"}
                  onClick={() => setCardType("visa")}
                >
                  Visa
                </CardTypeButton>
                <CardTypeButton
                  type="button"
                  $active={cardType === "mastercard"}
                  onClick={() => setCardType("mastercard")}
                >
                  MasterCard
                </CardTypeButton>
                <CardTypeButton
                  type="button"
                  $active={cardType === "amex"}
                  onClick={() => setCardType("amex")}
                >
                  Amex
                </CardTypeButton>
              </CardTypeRow>
              {fieldErrors.cardType && <FieldError>{fieldErrors.cardType}</FieldError>}

              <Label style={{ marginTop: "12px" }}>Card Number</Label>
              <TextInput
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="XXXX XXXX XXXX XXXX"
                value={cardNumber}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  const groups = raw.match(/.{1,4}/g) || [];
                  setCardNumber(groups.join(" "));
                }}
              />
              {fieldErrors.cardNumber && (
                <FieldError>{fieldErrors.cardNumber}</FieldError>
              )}

              <InputRow>
                <div>
                  <Label>Expiry (MM/YY)</Label>
                  <TextInput
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^0-9]/g, "");
                      if (v.length > 4) v = v.slice(0, 4);
                      if (v.length > 2) {
                        v = `${v.slice(0, 2)}/${v.slice(2)}`;
                      }
                      setExpiry(v);
                    }}
                  />
                  {fieldErrors.expiry && (
                    <FieldError>{fieldErrors.expiry}</FieldError>
                  )}
                </div>
                <div>
                  <Label>CVV</Label>
                  <TextInput
                    type="password"
                    inputMode="numeric"
                    placeholder="3 digits"
                    value={cvv}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^0-9]/g, "");
                      if (v.length > 3) v = v.slice(0, 3);
                      setCvv(v);
                    }}
                  />
                  {fieldErrors.cvv && <FieldError>{fieldErrors.cvv}</FieldError>}
                </div>
              </InputRow>
              <HelperText>
                We validate your card here and complete the payment directly
                in this system without leaving the site.
              </HelperText>
            </FakeCardRow>

            {error && <ErrorBox>{error}</ErrorBox>}

            <ActionsRow>
              <PrimaryButton onClick={handlePay} disabled={submitting}>
                <FaLock size={12} />
                {submitting ? "Processing..." : "Pay Securely"}
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
