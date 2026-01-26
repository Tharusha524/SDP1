import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import loginHero from './assets/login-hero.png';

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
  height: 100vh;
  width: 100%;
`;

// --- Left Visual Section ---
const VisualSection = styled(motion.div)`
  flex: 1.1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 60px 60px 100px;
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
  background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.7)), 
                    url(${loginHero});
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

const CarouselIndicators = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 40px;
`;

const Dot = styled.div`
  width: ${props => props.$active ? '24px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background: white;
  opacity: ${props => props.$active ? 1 : 0.4};
  transition: all 0.3s ease;
`;

// --- Right Form Section ---
const FormSection = styled.div`
  flex: 0.9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  overflow-y: auto;
  padding: 60px 40px;
`;

const FormContainer = styled(motion.div)`
  width: 100%;
  max-width: 420px;
`;

const Header = styled.div`
  margin-top: 20px;
  margin-bottom: 30px;
`;

const WelcomeText = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

const SubText = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 16px;
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

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  
  &:hover {
    color: #4b5563;
  }
`;

const FormOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #111827;
  }
`;

const ForgotLink = styled.a`
  color: #111827;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled(motion.button)`
  width: 100%;
  padding: 14px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
`;

const SecondaryButton = styled(motion.button)`
  width: 100%;
  padding: 12px;
  background: transparent;
  color: #111827;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #111827;
  }
`;



const Footer = styled.p`
  text-align: center;
  margin-top: 40px;
  padding-bottom: 20px;
  font-size: 0.9rem;
  color: #6b7280;

  a {
    color: #111827;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateField = (name, value) => {
    let errorMsg = '';
    
    if (name === 'email') {
      if (!value.trim()) {
        errorMsg = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMsg = 'Please enter a valid email address';
      }
    }
    
    if (name === 'password') {
      if (!value) {
        errorMsg = 'Password is required';
      } else if (value.length < 6) {
        errorMsg = 'Password must be at least 6 characters';
      }
    }
    
    setValidationErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, credentials[name]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const emailValid = validateField('email', credentials.email);
    const passwordValid = validateField('password', credentials.password);
    setTouched({ email: true, password: true });
    
    if (!emailValid || !passwordValid) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        // Navigate based on role
        const roleRoutes = {
          admin: '/admin/orders',
          staff: '/staff/catalog',
          storekeeper: '/storekeeper/inventory-tracker',
          customer: '/customer/catalog',
        };

        const route = roleRoutes[data.user.role] || '/';
        navigate(route);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
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
        <VisualSection
          layoutId="visual-section"
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <BackgroundImage />
          <VisualContent
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <VisualTitle>Elevate your <br />enterprise.</VisualTitle>
            <VisualSubtitle>
              Orchestrating seamless inventory solutions with precision,
              elegance, and total control at your fingertips.
            </VisualSubtitle>
            <CarouselIndicators>
              <Dot $active />
              <Dot />
              <Dot />
            </CarouselIndicators>
          </VisualContent>
        </VisualSection>

        <FormSection>
          <FormContainer
            layoutId="form-container"
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <Header>
              <WelcomeText>Welcome back!</WelcomeText>
              <SubText>Sign in to your Marukawa account</SubText>
            </Header>

            <Form onSubmit={handleLogin}>
              <InputGroup>
                <Label>Your Email</Label>
                <InputWrapper>
                  <StyledInput
                    type="email"
                    name="email"
                    placeholder="name@marukawa.com"
                    value={credentials.email}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('email')}
                    style={{
                      borderColor: touched.email && validationErrors.email ? '#dc2626' : '#e5e7eb'
                    }}
                  />
                </InputWrapper>
                {touched.email && validationErrors.email && (
                  <span style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '4px' }}>
                    {validationErrors.email}
                  </span>
                )}
              </InputGroup>

              <InputGroup>
                <Label>Password</Label>
                <InputWrapper>
                  <StyledInput
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('password')}
                    style={{
                      borderColor: touched.password && validationErrors.password ? '#dc2626' : '#e5e7eb'
                    }}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggle>
                </InputWrapper>
                {touched.password && validationErrors.password && (
                  <span style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '4px' }}>
                    {validationErrors.password}
                  </span>
                )}
              </InputGroup>

              <FormOptions>
                <CheckboxGroup>
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember Me</label>
                </CheckboxGroup>
                <ForgotLink onClick={() => navigate('/forgot-password')}>
                  Forgot Password?
                </ForgotLink>
              </FormOptions>

              <LoginButton
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading || (touched.email && touched.password && (validationErrors.email || validationErrors.password))}
                style={{
                  opacity: loading || (touched.email && touched.password && (validationErrors.email || validationErrors.password)) ? 0.6 : 1,
                  cursor: loading || (touched.email && touched.password && (validationErrors.email || validationErrors.password)) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </LoginButton>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    color: '#dc2626',
                    fontSize: '0.9rem',
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#fee2e2',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  {error}
                </motion.div>
              )}
            </Form>

            <Footer>
              Don't have an account? <SecondaryButton onClick={() => navigate('/register')} type="button">Create Account</SecondaryButton>
            </Footer>
          </FormContainer>
        </FormSection>
      </PageContainer>
    </motion.div>
  );
};

export default LoginPage;
