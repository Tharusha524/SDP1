import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaFilter, FaBars, FaTimes, FaBoxOpen, FaInfoCircle, FaPhone, FaTruck } from 'react-icons/fa';
import img1 from './assets/WhatsApp Image 2026-01-20 at 09.06.33 (1).jpeg';
import img2 from './assets/WhatsApp Image 2026-01-20 at 09.06.34.jpeg';
import img3 from './assets/login-hero.png';
import img4 from './assets/forgot-password-hero.png';
import img5 from './assets/Gemini_Generated_Image_elt1ngelt1ngelt1.png';
import img6 from './assets/Gemini_Generated_Image_q1wkmzq1wkmzq1wk.png';
import img7 from './assets/Gemini_Generated_Image_qoa691qoa691qoa6.png';
import img8 from './assets/register-hero.png';

// --- Global Styles ---
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

// --- Styled Components ---

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
  position: relative;
`;

const Header = styled.header`
  padding: 30px 5%;
  background: rgba(25, 25, 25, 0.6);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 25px;
  position: sticky;
  top: 0;
  z-index: 100;
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
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover { background: rgba(192, 160, 98, 0.1); }
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

const NavLink = styled.a`
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-decoration: none;
  cursor: pointer;
  color: rgba(255,255,255,0.7);
  transition: color 0.2s;

  &:hover { color: #c0a062; }
`;

const NotificationIcon = styled.div`
  position: relative;
  cursor: pointer;
  color: #f3f4f6;
  
  &:hover { color: #c0a062; }
`;

const Badge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #c0a062;
  color: #000;
  border-radius: 50%;
  font-size: 10px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
`;

const SearchFilterBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.3);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 45px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #c0a062;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 20px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  font-family: inherit;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #c0a062;
  }
`;

const CatalogGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 40px 5%;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const ProductCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    border-color: rgba(192, 160, 98, 0.5);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ProductImg = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
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
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  margin: 0 0 20px 0;
  flex: 1;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #c0a062;
  color: #000;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #d4b886;
    transform: translateY(-2px);
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 30px;
  color: rgba(255,255,255,0.3);
  font-size: 0.85rem;
  margin-top: auto;
  border-top: 1px solid rgba(255,255,255,0.05);
`;

// --- Data ---
const PRODUCTS = [
  {
    title: "Empire Vase",
    price: "Reserved",
    desc: "Hand-blown glass with gold leaf detailing. A statement piece for executive suites.",
    img: img1,
    type: "vases"
  },
  {
    title: "Monarch Armchair",
    price: "Rs. 12,500",
    desc: "Velvet upholstery with solid oak legs. Ergonomically designed for luxury.",
    img: img2,
    type: "chairs"
  },
  {
    title: "Obsidian Table",
    price: "Rs. 28,000",
    desc: "Tempered smoked glass top with matte black metal frame.",
    img: img3,
    type: "tables"
  },
  {
    title: "Elegant Decor Piece",
    price: "Rs. 18,500",
    desc: "Modern ceramic design with matte finish. Perfect for contemporary spaces.",
    img: img4,
    type: "vases"
  },
  {
    title: "Artistic Sculpture",
    price: "Rs. 22,000",
    desc: "Contemporary abstract art piece that elevates any interior.",
    img: img5,
    type: "vases"
  },
  {
    title: "Designer Vase",
    price: "Rs. 15,750",
    desc: "Handcrafted with intricate patterns. A true masterpiece.",
    img: img6,
    type: "vases"
  },
  {
    title: "Premium Showpiece",
    price: "Rs. 32,500",
    desc: "Luxury decor for executive spaces. Makes a bold statement.",
    img: img7,
    type: "vases"
  },
  {
    title: "Classic Ornament",
    price: "Rs. 19,900",
    desc: "Timeless design with elegant curves. A collector's choice.",
    img: img8,
    type: "vases"
  }
];

const CatalogForCustomer = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <GlobalStyle />
      <Layout>
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <SidebarOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
              />
              <Sidebar
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <SidebarCloseBtn onClick={() => setIsSidebarOpen(false)}><FaTimes /></SidebarCloseBtn>
                <SidebarButton onClick={() => navigate('/customer/place-order')}>
                  <FaBoxOpen /> Place Order
                </SidebarButton>
                <SidebarButton onClick={() => navigate('/customer/track-order')}>
                  <FaTruck /> Track Order
                </SidebarButton>
              </Sidebar>
            </>
          )}
        </AnimatePresence>

        <MainContent>
          <Header>
            <HeaderTop>
              <HeaderLeft>
                <SidebarOpenBtn onClick={() => setIsSidebarOpen(true)}>
                  <FaBars />
                </SidebarOpenBtn>
                <HeaderTitle>Product Collection</HeaderTitle>
              </HeaderLeft>
              <Nav>
                <NavLink onClick={() => navigate('/about')}>About</NavLink>
                <NavLink onClick={() => navigate('/contact')}>Contact</NavLink>
                <NotificationIcon>
                  <FaShoppingCart size={20} />
                  <Badge>2</Badge>
                </NotificationIcon>
              </Nav>
            </HeaderTop>
            <SearchFilterBar>
              <SearchWrapper>
                <SearchIcon />
                <SearchInput
                  type="text"
                  placeholder="Search collection..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchWrapper>
              <FilterSelect
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="vases">Vases & Decor</option>
                <option value="chairs">Seating</option>
                <option value="tables">Tables</option>
                <option value="sofas">Lounge</option>
              </FilterSelect>
            </SearchFilterBar>
          </Header>

          <CatalogGrid>
            <AnimatePresence>
              {filteredProducts.map((product, idx) => (
                <ProductCard
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ProductImg src={product.img} alt={product.title} />
                  <ProductInfo>
                    <ProductHeader>
                      <ProductTitle>{product.title}</ProductTitle>
                      <ProductPrice>{product.price}</ProductPrice>
                    </ProductHeader>
                    <ProductDesc>{product.desc}</ProductDesc>
                    <ActionButton onClick={() => navigate('/customer/place-order')}>
                      Place Order <FaBoxOpen />
                    </ActionButton>
                  </ProductInfo>
                </ProductCard>
              ))}
            </AnimatePresence>
          </CatalogGrid>

          <Footer>
            &copy; {new Date().getFullYear()} Marukawa Cement Works | Premium Inventory Solutions
          </Footer>
        </MainContent>
      </Layout>
    </>
  );
};

export default CatalogForCustomer;
