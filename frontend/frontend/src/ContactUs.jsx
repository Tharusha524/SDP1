import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

// Contact info page (customer-facing).
// This is a static page (no API calls) that shows company contact details
// and provides a “Back to Catalog” navigation button.

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
  grid-template-columns: 1fr;
  gap: 40px;
  margin-top: 40px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
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

const ContactUs = () => {
  const navigate = useNavigate();

  // Simple navigate helper used by the back button.

  return (
    <>
      {/* Global theme/background for this page */}
      <GlobalStyle />
      <Container>
        {/* Back navigation to the customer catalog route */}
        <BackButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/customer/catalog')}
        >
          <FaArrowLeft /> Back to Catalog
        </BackButton>

        {/* Header/intro section */}
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
          {/* Main contact details (phone/email/address/hours) */}
          <InfoSection
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <SectionTitle>Contact Information</SectionTitle>
            
            {/* Phone numbers */}
            <InfoItem>
              <IconWrapper><FaPhone /></IconWrapper>
              <InfoContent>
                <InfoTitle>Phone</InfoTitle>
                <InfoText>+94 11 234 5678</InfoText>
                <InfoText>+94 77 123 4567</InfoText>
              </InfoContent>
            </InfoItem>

            {/* Email addresses */}
            <InfoItem>
              <IconWrapper><FaEnvelope /></IconWrapper>
              <InfoContent>
                <InfoTitle>Email</InfoTitle>
                <InfoText>info@marukawa.lk</InfoText>
                <InfoText>support@marukawa.lk</InfoText>
              </InfoContent>
            </InfoItem>

            {/* Physical location */}
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

            {/* Opening hours */}
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


        </ContentGrid>
      </Container>
    </>
  );
};

export default ContactUs;
