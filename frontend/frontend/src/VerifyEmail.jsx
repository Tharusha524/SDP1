import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');

  body {
    background-color: #ffffff;
    color: #111827;
    font-family: 'Plus Jakarta Sans', sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #c0a062 0%, #d4b886 50%, #c0a062 100%);
  padding: 20px;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 60px 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const IconWrapper = styled(motion.div)`
  font-size: 4rem;
  margin-bottom: 24px;
  color: ${props => props.$success ? '#10b981' : props.$error ? '#ef4444' : '#c0a062'};
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const OTPContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 30px 0;
`;

const OTPInput = styled.input`
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid ${props => props.$error ? '#ef4444' : '#e5e7eb'};
  border-radius: 12px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #c0a062;
    box-shadow: 0 0 0 3px rgba(192, 160, 98, 0.1);
  }
  
  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 14px;
  background: ${props => props.$secondary ? 'transparent' : '#111827'};
  color: ${props => props.$secondary ? '#111827' : 'white'};
  border: ${props => props.$secondary ? '2px solid #e5e7eb' : 'none'};
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    ${props => props.$secondary ? 'background: #f3f4f6;' : 'opacity: 0.9;'}
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 12px;
  font-weight: 500;
`;

const EmailDisplay = styled.div`
  background: #f3f4f6;
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  color: #4b5563;
  font-weight: 500;
`;

const ResendText = styled.p`
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 20px;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #c0a062;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  
  &:disabled {
    color: #9ca3af;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    color: #a8895a;
  }
`;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  // Form/UI state
  // `otp` - array of six input digits
  // `loading` - true while verify/resend network calls are in progress
  // `error` - user-facing error message for verification/resend failures
  // `success` - true when verification succeeds (shows confirmation)
  // `resendDisabled` / `resendTimer` - control cooldown for resending OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    // If this page was opened without an `email` in navigation state,
    // send the user back to register so they can re-initiate verification.
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Accept only numeric input, update the digit array, clear errors,
    // and auto-focus the next input when appropriate.
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    // Allow pasting a full code: normalize to first 6 digits and populate
    // the inputs for quick verification.
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Only allow digits

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    
    // Send OTP to backend for verification. On success show confirmation
    // and redirect to login. Errors are surfaced to the user.
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Trigger resend flow and start a cooldown timer to prevent abuse.
    setResendDisabled(true);
    setResendTimer(60); // 60 seconds cooldown
    setOtp(['', '', '', '', '', '']);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Resend error:', err);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {success ? (
            <>
              <IconWrapper
                $success
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
              >
                <FaCheckCircle />
              </IconWrapper>
              <Title>Email Verified!</Title>
              <Message>Your email has been verified successfully. Redirecting to login...</Message>
            </>
          ) : (
            <>
              <IconWrapper>
                <FaEnvelope />
              </IconWrapper>
              <Title>Verify Your Email</Title>
              <Message>We've sent a 6-digit verification code to:</Message>
              <EmailDisplay>{email}</EmailDisplay>
              
              <OTPContainer>
                {otp.map((digit, index) => (
                  <OTPInput
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={loading || success}
                    $error={error}
                    autoFocus={index === 0}
                  />
                ))}
              </OTPContainer>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <Button
                onClick={handleVerify}
                disabled={loading || otp.join('').length !== 6}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
              
              <Button
                $secondary
                onClick={() => navigate('/register')}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Register
              </Button>
              
              <ResendText>
                Didn't receive the code?{' '}
                <ResendButton
                  onClick={handleResend}
                  disabled={resendDisabled || loading}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </ResendButton>
              </ResendText>
            </>
          )}
        </Card>
      </Container>
    </>
  );
};

export default VerifyEmail;
