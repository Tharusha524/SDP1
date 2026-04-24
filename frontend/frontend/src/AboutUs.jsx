// Import React and UI libraries used to build this page
import React from 'react';
// styled-components for styles, createGlobalStyle for global CSS
import styled, { createGlobalStyle } from 'styled-components';
// framer-motion for small animations in the UI
import { motion } from 'framer-motion';
// useNavigate lets us go back to catalog when user clicks back
import { useNavigate } from 'react-router-dom';
// Small icon set used in the values section
import { FaArrowLeft, FaAward, FaUsers, FaLeaf, FaGem } from 'react-icons/fa';
// Hero image shown on the About page
import heroImage from './assets/WhatsApp Image 2026-01-26 at 09.43.45.jpeg';

// Global page styles: background, font and base colors
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');

  body {
    background: radial-gradient(circle at top left, #1a1a1a, #060606);
    color: #f3f4f6;
    font-family: 'Manrope', sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
`;

// Page container that centers content and sets max width
const Container = styled.div`
  min-height: 100vh;
  padding: 60px 5%;
  max-width: 1200px;
  margin: 0 auto;
`;

// Back button UI: returns user to catalog
const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: rgba(137, 102, 30, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: #c0a062;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 40px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(192, 160, 98, 0.2);
    border-color: #c4a961;
    transform: translateX(-5px);
  }
`;

// Hero area: main title, subtitle and hero image
const Hero = styled(motion.div)`
  text-align: center;
  margin-bottom: 60px;
`;

// Page title style shown at top of the page
const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  color: #c0a062;
  margin-bottom: 20px;
  font-weight: 700;
`;

// Short subtitle text under the title that explains the brand
const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

// Wrapper for the hero image with rounded corners and shadow
const HeroImageWrapper = styled(motion.div)`
  width: 100%;
  max-width: 900px;
  margin: 40px auto 0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(192, 160, 98, 0.2);
`;

// The hero image element that displays the product photo
const HeroImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
`;

// Generic section block used for story, values, and mission
const Section = styled(motion.section)`
  margin-bottom: 60px;
`;

// Section title style (e.g., "Our Story", "Our Values")
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

// Paragraph text style used inside each section
const ContentText = styled.p`
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
`;

// Grid layout for the values cards shown in "Our Values"
const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
`;

// Card style for each value (icon, title, short description)
const ValueCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(192, 160, 98, 0.3);
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.05);
  }
`;

// Wrapper that shows the icon for each value
const IconWrapper = styled.div`
  font-size: 3rem;
  color: #d0ae69;
  margin-bottom: 20px;
`;

// Small title inside each value card
const ValueTitle = styled.h3`
  font-size: 1.3rem;
  color: #f3f4f6;
  margin-bottom: 15px;
  font-weight: 600;
`;

// Short description text inside each value card
const ValueDesc = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
`;

// Main About page component: builds the UI and handles navigation
const AboutUs = () => {
  // Hook to move between pages (used by the back button)
  const navigate = useNavigate();

  // Data for the "Our Values" cards shown in the UI
  const values = [
    {
      icon: <FaAward />,
      title: "Quality Craftsmanship",
      desc: "Every piece is crafted with meticulous attention to detail, ensuring durability and beauty."
    },
    {
      icon: <FaGem />,
      title: "Patented Innovation",
      desc: "Our unique production process sets us apart, delivering products that combine creativity with functionality."
    },
    {
      icon: <FaUsers />,
      title: "Customer Trust",
      desc: "Built on years of delivering exceptional cement-based products that exceed expectations."
    },
    {
      icon: <FaLeaf />,
      title: "Artistic Excellence",
      desc: "Transforming cement into art - from elegant furniture to decorative masterpieces."
    }
  ];

  // Render the page UI
  return (
    <>
      {/* Apply global styles for background and fonts */}
      <GlobalStyle />
      <Container>
        {/* Back button: takes user back to catalog */}
        <BackButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/customer/catalog')}
        >
          <FaArrowLeft /> Back to Catalog
        </BackButton>

        {/* HERO: main title, subtitle and picture that introduce the brand */}
        <Hero
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>About Marukawa</Title>
          <Subtitle>
            Pioneering innovative cement-based products with creativity and patented craftsmanship
          </Subtitle>
          {/* Big image showing the brand or product */}
          <HeroImageWrapper
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <HeroImage src={heroImage} alt="Marukawa" />
          </HeroImageWrapper>
        </Hero>

        {/* OUR STORY: short paragraphs telling visitors about the company */}
        <Section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <SectionTitle>Our Story</SectionTitle>
          <ContentText>
            Marukawa Cement Works, located in the heart of Molagoda, Kegalle, Sri Lanka, is a specialized
            manufacturing business founded and owned by Mr. Thilakarathne. What began as a vision to transform
            ordinary cement into extraordinary products has evolved into a trusted name in the industry.
          </ContentText>
          <ContentText>
            We specialize in creating distinctive cement-based items including furniture, flower vases, and
            decorative pieces. Through our patented production process, we've earned wide recognition for
            the creativity, quality, and innovation that defines every product we create. Our unique approach
            transforms raw cement materials into value-added products that are both functional and aesthetically
            appealing, earning the trust and loyalty of customers across Sri Lanka.
          </ContentText>
        </Section>

        {/* OUR VALUES: grid of cards that show the company's values with icons */}
        <Section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <SectionTitle>Our Values</SectionTitle>
          <ValuesGrid>
            {values.map((value, index) => (
              <ValueCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {/* Icon for the value (visual cue) */}
                <IconWrapper>{value.icon}</IconWrapper>
                {/* Short title for the value */}
                <ValueTitle>{value.title}</ValueTitle>
                {/* Short description for the value */}
                <ValueDesc>{value.desc}</ValueDesc>
              </ValueCard>
            ))}
          </ValuesGrid>
        </Section>

        {/* OUR MISSION: one paragraph about the company's goals */}
        <Section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <SectionTitle>Our Mission</SectionTitle>
          <ContentText>
            To continue pioneering innovative cement-based products through our patented process, delivering
            unique furniture, decorative items, and flower vases that blend functionality with artistic beauty.
            We are committed to maintaining the highest standards of craftsmanship while bringing creative
            cement solutions to homes and businesses across Sri Lanka.
          </ContentText>
        </Section>
      </Container>
    </>
  );
};

export default AboutUs;
