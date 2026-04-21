import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import forgotPasswordHero from './assets/forgot-password-hero.png';

// --- Global Aesthetics ---
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

// --- Styled Components ---

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
`;

// --- Left Visual Section (Dark) ---
const VisualSection = styled.div`
  flex: 1.1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 60px;
  background-color: #000;
  
  @media (max-width: 968px) {
    display: none;
  }
`;

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), 
                    url(${forgotPasswordHero});
  background-size: cover;
  background-position: center;
  z-index: 0;
`;

const VisualContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  color: white;
`;

const VisualTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  margin-bottom: 20px;
  line-height: 1.1;
`;

const VisualSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 450px;
  line-height: 1.6;
  font-weight: 300;
`;

// --- Right Form Section ---
const FormSection = styled.div`
  flex: 0.9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: #ffffff;
`;

const FormContainer = styled(motion.div)`
  width: 100%;
  max-width: 420px;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 40px;
  padding: 0;
  transition: color 0.2s;

  &:hover {
    color: #111827;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
`;

const Description = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 16px;
  color: #9ca3af;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.05);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 14px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;


const SuccessMessage = styled(motion.div)`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 0.95rem;
  text-align: center;
`;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // client-side email format validation
    const emailMsg = validateEmail(email);
    if (emailMsg) {
      setEmailError(emailMsg);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to reset password page which handles OTP verification
        navigate('/reset-password', { state: { email } });
      } else {
        setError(data.message || 'Failed to request password reset');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (value) => {
    if (!value || !value.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlobalStyle />
      <PageContainer>
        {/* Mirroring LoginPage layout with VisualSection on the left */}
        <VisualSection>
          <BackgroundImage />
          <VisualContent
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <VisualTitle>Secure your <br />legacy.</VisualTitle>
            <VisualSubtitle>
              Restoring access with the same sophistication and security
              you expect from the Marukawa ecosystem.
            </VisualSubtitle>
          </VisualContent>
        </VisualSection>

        <FormSection>
          <FormContainer
            layoutId="form-container"
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <BackButton
              onClick={() => navigate('/login')}
              whileHover={{ x: -4 }}
            >
              <FaArrowLeft /> Back to login
            </BackButton>

            <Header>
              <Title>Forgot password?</Title>
              <Description>
                No worries, it happens. Enter your email address and we'll send
                you instructions to reset your password.
              </Description>
            </Header>

            {isSubmitted ? (
              <SuccessMessage
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                Reset link sent! Please check your inbox for instructions to
                restore your account access.
              </SuccessMessage>
            ) : (
              <Form onSubmit={handleSubmit}>
                <InputGroup>
                  <Label>Email Address</Label>
                  <InputWrapper>
                    <IconWrapper>
                      <FaEnvelope />
                    </IconWrapper>
                    <StyledInput
                      type="email"
                      required
                      placeholder="name@marukawa.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); setError(''); }}
                      onBlur={() => { const msg = validateEmail(email); setEmailError(msg); }}
                    />
                  </InputWrapper>
                  {emailError && (
                    <div style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: '8px' }}>
                      {emailError}
                    </div>
                  )}
                </InputGroup>

                {error && (
                  <div style={{ color: '#dc2626', fontSize: '0.9rem', textAlign: 'center', marginBottom: '10px' }}>
                    {error}
                  </div>
                )}

                <SubmitButton
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </SubmitButton>
              </Form>
            )}

          </FormContainer>
        </FormSection>
      </PageContainer>
    </motion.div>
  );
};

export default ForgotPassword;
