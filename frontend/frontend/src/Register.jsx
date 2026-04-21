import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserTag, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import registerHero from './assets/register-hero.png';

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
  flex-direction: row-reverse; /* Mirror layout: Image on right */
  height: 100vh;
  width: 100%;
`;

// --- Visual Section (Now on the Right) ---
const VisualSection = styled(motion.div).attrs({ forwardedAs: motion.div })`
  flex: 1.1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 60px 60px 30px;
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
                    url(${registerHero});
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

// --- Form Section (Now on the Left) ---
const FormSection = styled.div`
  flex: 0.9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: #ffffff;
  overflow-y: auto;
  position: relative;
`;

const FormContainer = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  padding-bottom: 40px;
`;

const Header = styled.div`
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
  gap: 16px;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #9ca3af;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
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

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #111827;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
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

const RegisterButton = styled(motion.button)`
  width: 100%;
  padding: 12px;
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
  margin-top: 24px;
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

const SuccessOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  text-align: center;
  padding: 40px;
`;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    role: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    contact: false,
    password: false,
    role: false
  });

  const validateField = (name, value) => {
    let errorMsg = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          errorMsg = 'Full name is required';
        } else if (value.trim().length < 3) {
          errorMsg = 'Name must be at least 5 characters';
        }
        break;

      case 'email':
        if (!value.trim()) {
          errorMsg = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMsg = 'Please enter a valid email address';
        }
        break;

      case 'contact':
        if (!value.trim()) {
          errorMsg = 'Contact number is required';
        } else if (!/^[\d\s+()-]{10,}$/.test(value)) {
          errorMsg = 'Please enter a valid contact number';
        }
        break;

      case 'password':
        if (!value) {
          errorMsg = 'Password is required';
        } else if (value.length < 8) {
          errorMsg = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value)) {
          errorMsg = 'Password must include uppercase, lowercase, number and special characters (!@#$%^&*)';
        }
        break;

      case 'role':
        if (!value) {
          errorMsg = 'Please select a role';
        }
        break;

      default:
        break;
    }

    setValidationErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const nameValid = validateField('name', formData.name);
    const emailValid = validateField('email', formData.email);
    const contactValid = validateField('contact', formData.contact);
    const passwordValid = validateField('password', formData.password);
    const roleValid = validateField('role', formData.role);

    setTouched({
      name: true,
      email: true,
      contact: true,
      password: true,
      role: true
    });

    if (!nameValid || !emailValid || !contactValid || !passwordValid || !roleValid) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirect to verification page
        setTimeout(() => navigate('/verify-email', { state: { email: formData.email } }), 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Registration error:', err);
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
            <VisualTitle>Join the <br />elite network.</VisualTitle>
            <VisualSubtitle>
              Secure your place in the most advanced inventory management ecosystem.
              Efficiency, transparency, and scaling made simple.
            </VisualSubtitle>
            <CarouselIndicators>
              <Dot />
              <Dot $active />
              <Dot />
            </CarouselIndicators>
          </VisualContent>
        </VisualSection>

        <FormSection>
          <AnimatePresence>
            {success && (
              <SuccessOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                >
                  <FaCheckCircle size={80} color="#111827" style={{ marginBottom: '24px' }} />
                </motion.div>
                <WelcomeText>Account Created</WelcomeText>
                <SubText>Please check your email for the verification code. Redirecting you to verification...</SubText>
              </SuccessOverlay>
            )}
          </AnimatePresence>

          <FormContainer
            layoutId="form-container"
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <Header>
              <WelcomeText>Create Account</WelcomeText>
              <SubText>Initialize your operational credentials</SubText>
            </Header>

            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Label><FaUser size={12} /> Full Name</Label>
                <StyledInput
                  type="text"
                  name="name"
                  placeholder="Alexander Sterling"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('name')}
                  style={{
                    borderColor: touched.name && validationErrors.name ? '#dc2626' : '#e5e7eb'
                  }}
                />
                {touched.name && validationErrors.name && (
                  <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '2px' }}>
                    {validationErrors.name}
                  </span>
                )}
              </InputGroup>

              <InputGrid>
                <InputGroup>
                  <Label><FaEnvelope size={12} /> Email</Label>
                  <StyledInput
                    type="email"
                    name="email"
                    placeholder="name@marukawa.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('email')}
                    style={{
                      borderColor: touched.email && validationErrors.email ? '#dc2626' : '#e5e7eb'
                    }}
                  />
                  {touched.email && validationErrors.email && (
                    <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '2px' }}>
                      {validationErrors.email}
                    </span>
                  )}
                </InputGroup>
                <InputGroup>
                  <Label><FaPhone size={12} /> Contact</Label>
                  <StyledInput
                    type="text"
                    name="contact"
                    placeholder="+94 77 123 4567"
                    value={formData.contact}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('contact')}
                    style={{
                      borderColor: touched.contact && validationErrors.contact ? '#dc2626' : '#e5e7eb'
                    }}
                  />
                  {touched.contact && validationErrors.contact && (
                    <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '2px' }}>
                      {validationErrors.contact}
                    </span>
                  )}
                </InputGroup>
              </InputGrid>

              <InputGroup>
                <Label><FaLock size={12} /> Password</Label>
                <InputWrapper>
                  <StyledInput
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
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
                  <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '2px' }}>
                    {validationErrors.password}
                  </span>
                )}
              </InputGroup>

              <InputGroup>
                <Label><FaUserTag size={12} /> Operational Role</Label>
                <StyledSelect
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('role')}
                  style={{
                    borderColor: touched.role && validationErrors.role ? '#dc2626' : '#e5e7eb'
                  }}
                >
                  <option value="" disabled>Select Alignment</option>

                  <option value="customer">Customer</option>
                  <option value="staff">Operational Staff</option>
                  <option value="storekeeper">Inventory Manager</option>
                </StyledSelect>
                {touched.role && validationErrors.role && (
                  <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '2px' }}>
                    {validationErrors.role}
                  </span>
                )}
              </InputGroup>

              <RegisterButton
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading || Object.values(validationErrors).some(err => err !== '')}
                style={{
                  opacity: loading || Object.values(validationErrors).some(err => err !== '') ? 0.6 : 1,
                  cursor: loading || Object.values(validationErrors).some(err => err !== '') ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </RegisterButton>

              {error && (
                <div style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem', marginTop: '10px' }}>
                  {error}
                </div>
              )}
            </Form>

            <Footer>
              Already a member? <SecondaryButton onClick={() => navigate('/login')} type="button">Back to Login</SecondaryButton>
            </Footer>
          </FormContainer>
        </FormSection>
      </PageContainer>
    </motion.div>
  );
};

export default Register;
