import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaLock, FaKey } from 'react-icons/fa';

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

const InputGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.05);
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

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const validateEmail = (value) => {
        if (!value || !value.trim()) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    // Simple validator to confirm the email format passed from the previous
    // page before allowing the user to proceed with reset steps.

    // `step` controls the UI: 1 = enter OTP, 2 = set new password
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const inputRefs = useRef([]);

    useEffect(() => {
        // Guard: if no email was provided in navigation state, redirect user
        // back to login. If email exists but is malformed, send back to
        // forgot-password so they can re-initiate the flow.
        if (!email) {
            navigate('/login');
            return;
        }
        if (!validateEmail(email)) {
            // if the provided email is not a valid email, send user back to forgot page
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleOtpChange = (index, value) => {
        // Accept only digits. Update the OTP array and auto-focus the next
        // input when the user types a digit. Clear any existing error on edit.
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        // Allow backspace navigation to previous input when current is empty.
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const verifyOtp = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) return setError('Please enter 6 digits');

        setLoading(true);
        setError('');
        try {
            // Send the joined OTP to backend for verification. On success we
            // advance to the password reset step.
            const res = await fetch('http://localhost:5000/api/auth/verify-reset-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode }),
            });
            const data = await res.json();
            if (data.success) {
                setStep(2);
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (pwd) => {
        // Return an error string when password fails requirements otherwise ''
        if (!pwd) return 'Password is required';
        if (pwd.length < 8) return 'Password must be at least 8 characters';
        const complexity = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
        if (!complexity.test(pwd)) return 'Password must include uppercase, lowercase, number and special characters (!@#$%^&*)';
        return '';
    };

    const handleReset = async () => {
        // Finalize password reset: validate password complexity and match,
        // then POST new password and OTP to backend. On success show a
        // confirmation and navigate back to login.
        const pwdErr = validatePassword(password);
        if (pwdErr) {
            setPasswordError(pwdErr);
            return setError(pwdErr);
        }

        if (password !== confirmPassword) {
            setPasswordError('');
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otp.join(''), newPassword: password }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.message || 'Reset failed');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
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
                    {/* Top-level rendering: show a success confirmation, the OTP
                        entry step, or the new-password step depending on `step`. */}
                    {success ? (
                        <>
                            <IconWrapper $success initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <FaCheckCircle />
                            </IconWrapper>
                            <Title>Password Reset!</Title>
                            <Message>Your password has been updated successfully. Redirecting to login...</Message>
                        </>
                    ) : step === 1 ? (
                        <>
                            <IconWrapper>
                                <FaKey />
                            </IconWrapper>
                            <Title>Enter Reset Code</Title>
                            <Message>We sent a code to {email}</Message>

                            <OTPContainer>
                                {otp.map((digit, index) => (
                                    <OTPInput
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        disabled={loading}
                                        $error={error}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </OTPContainer>

                            {error && <ErrorMessage>{error}</ErrorMessage>}

                            <Button
                                onClick={verifyOtp}
                                disabled={loading || otp.join('').length !== 6}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </Button>
                            <Button $secondary onClick={() => navigate('/login')}>Cancel</Button>
                        </>
                    ) : (
                        <>
                            <IconWrapper>
                                <FaLock />
                            </IconWrapper>
                            <Title>New Password</Title>
                            <Message>Create a new secure password</Message>

                            <InputGroup>
                                <Label>New Password</Label>
                                <StyledInput
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); setError(''); }}
                                    onBlur={() => { const msg = validatePassword(password); setPasswordError(msg); if (msg) setError(msg); }}
                                    placeholder="••••••••"
                                />
                            </InputGroup>

                            <InputGroup>
                                <Label>Confirm Password</Label>
                                <StyledInput
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                    onBlur={() => { if (password && confirmPassword && password !== confirmPassword) setError('Passwords do not match'); }}
                                    placeholder="••••••••"
                                />
                            </InputGroup>

                            {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
                            {error && !passwordError && <ErrorMessage>{error}</ErrorMessage>}

                            <Button
                                onClick={handleReset}
                                disabled={loading || !password || !confirmPassword}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </>
                    )}
                </Card>
            </Container>
        </>
    );
};

export default ResetPassword;
