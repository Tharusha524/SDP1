import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaClipboardCheck, FaArrowLeft } from 'react-icons/fa';
import img1 from './assets/WhatsApp Image 2026-01-20 at 09.06.33 (1).jpeg';
import img2 from './assets/WhatsApp Image 2026-01-20 at 09.06.34.jpeg';
import img3 from './assets/login-hero.png';
import img4 from './assets/forgot-password-hero.png';
import img5 from './assets/Gemini_Generated_Image_elt1ngelt1ngelt1.png';
import img6 from './assets/Gemini_Generated_Image_q1wkmzq1wkmzq1wk.png';
import img7 from './assets/Gemini_Generated_Image_qoa691qoa691qoa6.png';
import img8 from './assets/register-hero.png';

// Reuse styles with minor tweaks for Staff
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

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

const SidebarOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 150;
`;

const Sidebar = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: #111;
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  padding-top: 40px;
  z-index: 200;
`;

const SidebarCloseBtn = styled.button`
  align-self: flex-end;
  margin: 0 20px 30px 0;
  background: none;
  border: none;
  color: #f3f4f6;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover { opacity: 1; }
`;

const SidebarButton = styled.button`
  width: 85%;
  margin: 0 auto 15px;
  padding: 16px 20px;
  background: rgba(255,255,255,0.03);
  color: #f3f4f6;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(192, 160, 98, 0.15);
    border-color: #c0a062;
    color: #c0a062;
    transform: translateX(5px);
  }

  svg { font-size: 1.1rem; }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: 30px 5%;
  background: rgba(17,17,17,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 25px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const SidebarOpenBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #c0a062;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  color: #f3f4f6;
  letter-spacing: 1px;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 30px;
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: rgba(255,255,255,0.7);
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  &:hover { color: #c0a062; }
`;

const CatalogGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 40px 5%;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const ProductCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.5);
    border-color: rgba(192, 160, 98, 0.3);
  }
`;

const ProductImg = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 24px;
`;

const ProductTitle = styled.h3`
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  color: #f3f4f6;
`;

const ProductPrice = styled.span`
  font-weight: 700;
  color: #c0a062;
  font-size: 1.1rem;
`;

const ProductDesc = styled.p`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 20px;
`;

const PRODUCTS = [
  { title: "Flower  Vase", price: "RS:2500.00", img: img1, desc: "Elegant decorative vase with intricate detailing" },
  { title: "Flower vase", price: "RS:15000.00", img: img2, desc: "Luxurious armchair with premium upholstery" },
  { title: "Flower vase", price: "RS:20000.00", img: img3, desc: "Modern table with sleek black finish" },
  { title: "Elegant Decor Piece", price: "RS:18500.00", img: img4, desc: "Modern ceramic design with matte finish" },
  { title: "sofa set", price: "RS:22000.00", img: img5, desc: "Contemporary abstract art piece" },
  { title: "Table & bench", price: "RS:15750.00", img: img6, desc: "Handcrafted with intricate patterns" },
  { title: "large flower vase", price: "RS:32500.00", img: img7, desc: "Luxury decor for executive spaces" },
  { title: "Classic Ornament", price: "RS:19900.00", img: img8, desc: "Timeless design with elegant curves" },
];

const CatalogForStaff = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <GlobalStyle />
      <Layout>
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <SidebarOverlay onClick={() => setIsSidebarOpen(false)} />
              <Sidebar initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}>
                <SidebarCloseBtn onClick={() => setIsSidebarOpen(false)}><FaTimes /></SidebarCloseBtn>
                <SidebarButton onClick={() => navigate('/staff/tasks')}><FaClipboardCheck /> Staff Tasks</SidebarButton>
                <SidebarButton onClick={() => navigate('/login')}><FaArrowLeft /> Logout</SidebarButton>
              </Sidebar>
            </>
          )}
        </AnimatePresence>

        <MainContent>
          <Header>
            <HeaderTop>
              <HeaderLeft>
                <SidebarOpenBtn onClick={() => setIsSidebarOpen(true)}><FaBars /></SidebarOpenBtn>
                <HeaderTitle>Staff Catalog View</HeaderTitle>
              </HeaderLeft>
              <Nav>
                <NavLink onClick={() => navigate('/staff/tasks')}>Tasks</NavLink>
              </Nav>
            </HeaderTop>
          </Header>

          <CatalogGrid>
            {PRODUCTS.map((product, idx) => (
              <ProductCard key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <ProductImg src={product.img} />
                <ProductInfo>
                  <ProductTitle>{product.title}</ProductTitle>
                  <ProductDesc>{product.desc}</ProductDesc>
                  <ProductPrice>{product.price}</ProductPrice>
                </ProductInfo>
              </ProductCard>
            ))}
          </CatalogGrid>
        </MainContent>
      </Layout>
    </>
  );
};

export default CatalogForStaff;
