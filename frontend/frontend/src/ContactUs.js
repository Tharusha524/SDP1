import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');

  body {
    background: radial-gradient(circle at top left, #1a1a1a, #0d0d0d);
    color: #f3f4f6;
    font-family: 'Manrope', sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  padding: 60px 5%;
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: rgba(192, 160, 98, 0.1);
  border: 1px solid rgba(192, 160, 98, 0.3);
  border-radius: 12px;
  color: #c0a062;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 40px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(192, 160, 98, 0.2);
    border-color: #c0a062;
    transform: translateX(-5px);
  }
`;

const Hero = styled(motion.div)`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  color: #c0a062;
  margin-bottom: 20px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 40px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
`;

const SectionTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: #f3f4f6;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;

  &::before {
    content: '';
    width: 4px;
    height: 30px;
    background: #c0a062;
    border-radius: 4px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const IconWrapper = styled.div`
  font-size: 1.5rem;
  color: #c0a062;
  margin-top: 5px;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h3`
  font-size: 1.1rem;
  color: #f3f4f6;
  margin-bottom: 8px;
  font-weight: 600;
`;

const InfoText = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 0;
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
  color: rgba(255, 255, 255, 0.7);
`;

const Input = styled.input`
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #c0a062;
    background: rgba(0, 0, 0, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const TextArea = styled.textarea`
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #c0a062;
    background: rgba(0, 0, 0, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 16px;
  background: #c0a062;
  color: #000;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #d4b886;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled(motion.div)`
  padding: 16px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  color: #10b981;
  text-align: center;
  font-weight: 600;
`;

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <BackButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/customer/catalog')}
        >
          <FaArrowLeft /> Back to Catalog
        </BackButton>

        <Hero
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>Get in Touch</Title>
          <Subtitle>
            Visit us in Kegalle or reach out for inquiries about our cement-based products.
          </Subtitle>
        </Hero>

        <ContentGrid>
          <InfoSection
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <SectionTitle>Contact Information</SectionTitle>
            
            <InfoItem>
              <IconWrapper><FaPhone /></IconWrapper>
              <InfoContent>
                <InfoTitle>Phone</InfoTitle>
                <InfoText>+94 11 234 5678</InfoText>
                <InfoText>+94 77 123 4567</InfoText>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <IconWrapper><FaEnvelope /></IconWrapper>
              <InfoContent>
                <InfoTitle>Email</InfoTitle>
                <InfoText>info@marukawa.lk</InfoText>
                <InfoText>support@marukawa.lk</InfoText>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <IconWrapper><FaMapMarkerAlt /></IconWrapper>
              <InfoContent>
                <InfoTitle>Address</InfoTitle>
                <InfoText>
                  Marukawa Cement Works,<br />
                  Molagoda,<br />
                  Kegalle,<br />
                  Sri Lanka
                </InfoText>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <IconWrapper><FaClock /></IconWrapper>
              <InfoContent>
                <InfoTitle>Business Hours</InfoTitle>
                <InfoText>Monday - Friday: 8:00 AM - 6:00 PM</InfoText>
                <InfoText>Saturday: 9:00 AM - 2:00 PM</InfoText>
                <InfoText>Sunday: Closed</InfoText>
              </InfoContent>
            </InfoItem>
          </InfoSection>

          <InfoSection
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <SectionTitle>Send us a Message</SectionTitle>
            
            {submitted ? (
              <SuccessMessage
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                Thank you! Your message has been sent successfully.
              </SuccessMessage>
            ) : (
              <Form onSubmit={handleSubmit}>
                <InputGroup>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Subject</Label>
                  <Input
                    type="text"
                    name="subject"
                    placeholder="Subject of your message"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Message</Label>
                  <TextArea
                    name="message"
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>

                <SubmitButton
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </SubmitButton>
              </Form>
            )}
          </InfoSection>
        </ContentGrid>
      </Container>
    </>
  );
};

export default ContactUs;
