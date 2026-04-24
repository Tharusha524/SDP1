import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import heroBg from './assets/Gemini_Generated_Image_iqq5q5iqq5q5iqq5.png';

// Public landing page.
// - Static marketing/intro page (no API calls)
// - Provides navigation to the main catalog
// - Includes a smooth-scroll indicator that jumps to the “features” section

// --- Global Fonts & Reset for Landing Page ---
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

  body {
    background-color: #0c0c0c;
    color: #fdfcf0; /* Off-white */
    scroll-behavior: smooth;
  }
`;

// --- Styled Components ---

const Container = styled.div`
  min-height: 100vh;
  background-color: #0c0c0c;
  font-family: 'Manrope', sans-serif;
  overflow-x: hidden;
  position: relative;
`;

const Navbar = styled(motion.nav)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 60px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: transparent;

  @media (max-width: 768px) {
    padding: 20px 25px;
  }
`;

const Logo = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  letter-spacing: 2px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  cursor: pointer;
`;

const BookButton = styled.button`
  padding: 16px 42px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  border-radius: 30px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.95rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(5px);

  &:hover {
    background: #fff;
    color: #000;
    border-color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(255,255,255,0.15);
  }
`;

const Hero = styled.section`
  height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40%;
    background: linear-gradient(to top, #0c0c0c 0%, transparent 100%);
    pointer-events: none;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${heroBg});
  background-size: cover;
  background-position: center;
  filter: brightness(0.4) contrast(1.1);
  opacity: 0.6;
  z-index: 0;
  animation: zoomBg 20s infinite alternate;

  @keyframes zoomBg {
    from { transform: scale(1); }
    to { transform: scale(1.1); }
  }
`;

const HeroContent = styled.div`
  z-index: 10;
  text-align: center;
  padding: 0 20px;
  margin-top: -50px;
`;

const SubHeadline = styled(motion.p)`
  font-family: 'Manrope', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 6px;
  color: #e0d6c2; /* Muted Gold/Beige */
  margin-bottom: 20px;
`;

const MainHeadline = styled(motion.h1)`
  font-family: 'Playfair Display', serif;
  font-size: 5rem;
  font-weight: 400;
  color: #fff;
  margin: 0;
  line-height: 1;
  letter-spacing: -2px;
  
  /* Gradient text effect option, or keep pure white for elegance */
  background: linear-gradient(180deg, #fff 0%, #aaa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 3.5rem;
  }
`;

const Description = styled(motion.p)`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 500px;
  margin: 30px auto 0;
  line-height: 1.6;
  font-weight: 300;
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 10;
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
`;

const Line = styled.div`
  width: 1px;
  height: 60px;
  background: rgba(255, 255, 255, 0.4);
`;

const Section = styled.section`
  padding: 120px 60px;
  background: #0c0c0c;
  position: relative;

  @media (max-width: 768px) {
    padding: 80px 25px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 50px;
  cursor: pointer;
  transition: all 0.5s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-5px);
  }
`;

const CardNumber = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: #e0d6c2;
  margin-bottom: 20px;
  opacity: 0.6;
`;

const CardTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-bottom: 15px;
  color: #fff;
  font-weight: 400;
`;

const CardText = styled.p`
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.7;
  font-weight: 300;
  margin-bottom: 30px;
`;

const CardLink = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  svg {
    transition: transform 0.3s;
  }

  ${Card}:hover & svg {
    transform: translateX(5px);
  }
`;

const Footer = styled.footer`
  padding: 60px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// --- Component ---

const LandingPage = () => {
  const navigate = useNavigate();

  // Scrolls the page to the features section.
  const handleScroll = () => {
    const section = document.getElementById('features');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Page-level global style overrides for this landing view */}
      <GlobalStyle />
      <Container>
        {/* Top navigation bar (logo only) */}
        <Navbar
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Clicking the logo navigates to the home route */}
          <Logo onClick={() => navigate('/')}>Marukawa</Logo>
        </Navbar>

        {/* Full-screen hero section with background image */}
        <Hero>
          <HeroBg />
          <HeroContent>
            <SubHeadline
              initial={{ opacity: 0, letterSpacing: '10px' }}
              animate={{ opacity: 1, letterSpacing: '6px' }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Experience the charm
            </SubHeadline>
            <MainHeadline
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              MARUKAWA  CEMENT  WORKS
            </MainHeadline>
            <Description
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Orchestrating seamless inventory solutions for the modern enterprise.
              Precision, elegance, and control at your fingertips.
            </Description>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              style={{ marginTop: '40px' }}
            >
              {/* Primary CTA: enter the app */}
              <BookButton onClick={() => navigate('/catalog')}>
                Get Started
              </BookButton>
            </motion.div>
          </HeroContent>

          {/* Smooth-scroll hint to jump down to the features cards */}
          <ScrollIndicator
            onClick={handleScroll}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
            <Line />
          </ScrollIndicator>
        </Hero>

        {/* Feature cards section */}
        <Section id="features">
          <Grid>
            <Card
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <CardNumber>01</CardNumber>
              <CardTitle>Inventory</CardTitle>
              <CardText>
                Real-time tracking of every asset. Visualize your stock with precision and clarity, specifically designed for high-volume operations.
              </CardText>
              <CardLink>Explore <FaArrowRight /></CardLink>
            </Card>

            <Card
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CardNumber>02</CardNumber>
              <CardTitle>Logistics</CardTitle>
              <CardText>
                Seamless ordering and dispatch systems. Connect your supply chain with an interface that feels as premium as your business.
              </CardText>
              <CardLink>Discover <FaArrowRight /></CardLink>
            </Card>

            <Card
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <CardNumber>03</CardNumber>
              <CardTitle>Analytics</CardTitle>
              <CardText>
                Data-driven insights presented in a beautiful, digestible format. Make informed decisions without the clutter.
              </CardText>
              <CardLink>View Data <FaArrowRight /></CardLink>
            </Card>
          </Grid>
        </Section>

        <Footer>
          &copy; {new Date().getFullYear()} Marukawa. Designed for Excellence.
        </Footer>
      </Container>
    </>
  );
};

export default LandingPage;
