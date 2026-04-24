import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaBars, FaTimes, FaTruck, FaSignOutAlt, FaUser, FaUserPlus, FaTachometerAlt, FaArrowLeft } from 'react-icons/fa';
import img1 from './assets/WhatsApp Image 2026-01-20 at 09.06.33 (1).jpeg';
import img2 from './assets/WhatsApp Image 2026-01-20 at 09.06.34.jpeg';
import img3 from './assets/login-hero.png';
import img5 from './assets/Gemini_Generated_Image_elt1ngelt1ngelt1.png';
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

const BackToLandingBtn = styled.button`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  color: #c0a062;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 10px;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: rgba(192,160,98,0.10);
    border-color: rgba(192,160,98,0.35);
  }
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
const ProfileCircle = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: #f7f4e9;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const NavAuthButton = styled.button`
  padding: 10px 22px;
  border-radius: 25px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
`;

const LoginNavBtn = styled(NavAuthButton)`
  background: transparent;
  border: 1.5px solid rgba(192, 160, 98, 0.6);
  color: #c0a062;
  &:hover { background: rgba(192,160,98,0.15); border-color: #c0a062; }
`;

const RegisterNavBtn = styled(NavAuthButton)`
  background: #c0a062;
  border: 1.5px solid #c0a062;
  color: #000;
  &:hover { background: #d4b886; }
`;

const NotificationIcon = styled.div`
  position: relative;
  cursor: pointer;
  color: #f3f4f6;
  
  &:hover { color: #c0a062; }
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
// Fallback products used only if database has no rows
const PRODUCTS = [
  {
    title: "Sofa Set",
    price: "Rs. 48,000",
    desc: "Premium fabric sofa set ideal for modern living rooms.",
    img: img5,
    type: "sofas"
  },
  {
    title: "Large Flower Vase",
    price: "Rs. 20,000",
    desc: "Tall decorative flower vase that becomes a centerpiece in any room.",
    img: img7,
    type: "vases"
  },
  {
    title: "Small Flower Vase",
    price: "Rs. 4,000",
    desc: "Compact flower vase, perfect for desks and side tables.",
    img: img3,
    type: "vases"
  },
  {
    title: "Ornaments",
    price: "Rs. 5,000",
    desc: "Elegant decorative ornaments to enhance your interior style.",
    img: img8,
    type: "vases"
  },
  {
    title: "Medium Flower Vase",
    price: "Rs. 10,000",
    desc: "Medium-sized vase ideal for coffee tables and consoles.",
    img: img1,
    type: "vases"
  },
  {
    title: "Flower Vase",
    price: "Rs. 12,500",
    desc: "Classic flower vase suitable for everyday use.",
    img: img2,
    type: "vases"
  }
];

const CatalogForCustomer = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cartCount, setCartCount] = useState(0);

  // Auth state — read from localStorage
  const [user, setUser] = useState(null);
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) { setUser(null); }
    }
  }, []);

  // Products from backend (real MySQL products table)
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(r => r.json())
      .then(data => { if (data.success) setProducts(data.products); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      const parsed = raw ? JSON.parse(raw) : [];
      setCartCount(parsed.length || 0);
    } catch {
      setCartCount(0);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    setUser(null);
    setCartCount(0);
    navigate('/catalog');
  };

  // Role-based dashboard route
  const getDashboardRoute = (role) => {
    const roleRoutes = {
      admin: '/admin/dashboard',
      staff: '/staff/tasks',
      storekeeper: '/storekeeper/inventory-tracker',
      customer: '/customer/catalog',
    };
    return roleRoutes[role] || '/catalog';
  };

  // (Order-now flow removed — use Add to Cart / Cart page to place multi-item orders)

  const addToCart = (product) => {
    if (!user) { navigate('/login'); return; }
    try {
      const raw = localStorage.getItem('cart');
      const parsed = raw ? JSON.parse(raw) : [];
      // default quantity 1
      const existingIndex = parsed.findIndex(i => i.productId === product.ProductID);
      if (existingIndex >= 0) {
        parsed[existingIndex].quantity = (parsed[existingIndex].quantity || 0) + 1;
      } else {
        parsed.push({ productId: product.ProductID, quantity: 1 });
      }
      localStorage.setItem('cart', JSON.stringify(parsed));
      setCartCount(parsed.length);
      // small UX feedback
      alert('Added to cart');
    } catch (e) {
      console.error('Failed to add to cart', e);
      alert('Could not add to cart');
    }
  };

  // Prefer real products from DB; filter to the six configured items by image, then fall back to static list if needed
  // Use all active products from DB when available; otherwise fall back to static list
  const dbProducts = products || [];

  const sourceProducts = (dbProducts && dbProducts.length > 0) ? dbProducts : PRODUCTS;

  const getProductImage = (product) => {
    if (product.Image) {
      // If backend stored a data URL or full URL, use it directly
      if (typeof product.Image === 'string' && (product.Image.startsWith('data:') || product.Image.startsWith('http'))) {
        return product.Image;
      }

      // Otherwise map known filenames to bundled assets
      const map = {
        'Gemini_Generated_Image_elt1ngelt1ngelt1.png': img5,
        'Gemini_Generated_Image_qoa691qoa691qoa6.png': img7,
        'login-hero.png': img3,
        'register-hero.png': img8,
        'WhatsApp Image 2026-01-20 at 09.06.33 (1).jpeg': img1,
        'WhatsApp Image 2026-01-20 at 09.06.34.jpeg': img2,
      };
      return map[product.Image] || img1;
    }
    return product.img || img1;
  };

  const filteredProducts = sourceProducts.filter(product => {
    const name = (product.Name || product.title || '').toLowerCase();
    const desc = (product.Description || product.desc || '').toLowerCase();
    const type = (product.Category || product.type || 'all').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = name.includes(q) || desc.includes(q);
    const matchesCategory = categoryFilter === 'all' || type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const isCustomer = user && user.role === 'customer';
  const isOtherRole = user && user.role !== 'customer';

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

                {/* Not logged in: show Login / Register */}
                {!user && (
                  <>
                    <SidebarButton onClick={() => { setIsSidebarOpen(false); navigate('/login'); }}>
                      <FaUser /> Login
                    </SidebarButton>
                    <SidebarButton onClick={() => { setIsSidebarOpen(false); navigate('/register'); }}>
                      <FaUserPlus /> Register
                    </SidebarButton>
                  </>
                )}

                {/* Customer: show order actions + logout */}
                {isCustomer && (
                  <>
                    <SidebarButton onClick={() => { setIsSidebarOpen(false); navigate('/customer/place-order'); }}>
                      <FaShoppingCart /> Place Order
                    </SidebarButton>
                    <SidebarButton onClick={() => { setIsSidebarOpen(false); navigate('/customer/track-order'); }}>
                      <FaTruck /> Track Order
                    </SidebarButton>
                    <SidebarButton onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </SidebarButton>
                  </>
                )}

                {/* Admin / Staff / Storekeeper: show dashboard + logout */}
                {isOtherRole && (
                  <>
                    <SidebarButton onClick={() => { setIsSidebarOpen(false); navigate(getDashboardRoute(user.role)); }}>
                      <FaTachometerAlt /> My Dashboard
                    </SidebarButton>
                    <SidebarButton onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </SidebarButton>
                  </>
                )}
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
                  <BackToLandingBtn onClick={() => navigate('/')} aria-label="Back to landing page" title="Back">
                    <FaArrowLeft />
                  </BackToLandingBtn>
                <HeaderTitle>Product Collection</HeaderTitle>
              </HeaderLeft>

              <Nav>
                <NavLink onClick={() => navigate('/about')}>About</NavLink>
                <NavLink onClick={() => navigate('/contact')}>Contact</NavLink>

                {/* Not logged in: Login + Register buttons */}
                {!user && (
                  <>
                    <LoginNavBtn onClick={() => navigate('/login')}>Login</LoginNavBtn>
                    <RegisterNavBtn onClick={() => navigate('/register')}>Register</RegisterNavBtn>
                  </>
                )}

                {/* Customer: cart icon + profile + logout */}
                {isCustomer && (
                  <>
                    <NotificationIcon onClick={() => navigate('/customer/cart')} title="View cart" style={{ position: 'relative' }}>
                      <FaShoppingCart size={20} />
                      {cartCount > 0 && (
                        <div style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', borderRadius: 999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{cartCount}</div>
                      )}
                    </NotificationIcon>
                    <ProfileCircle
                      onClick={() => navigate('/customer/profile')}
                      title="My profile"
                    >
                      {(user?.name || user?.username || 'C').charAt(0).toUpperCase()}
                    </ProfileCircle>
                    <LoginNavBtn onClick={handleLogout}>Logout</LoginNavBtn>
                  </>
                )}

                {/* Admin / Staff / Storekeeper: dashboard link + logout */}
                {isOtherRole && (
                  <>
                    <RegisterNavBtn onClick={() => navigate(getDashboardRoute(user.role))}>
                      My Dashboard
                    </RegisterNavBtn>
                    <LoginNavBtn onClick={handleLogout}>Logout</LoginNavBtn>
                  </>
                )}
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
                <option value="vases">Vases &amp; Decor</option>
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
                  <ProductImg
                    src={getProductImage(product)}
                    alt={product.Name || product.title}
                  />
                  <ProductInfo>
                    <ProductHeader>
                      <ProductTitle>{product.Name || product.title}</ProductTitle>
                      <ProductPrice>
                        {product.Price ? `Rs. ${Number(product.Price).toLocaleString()}` : product.price}
                      </ProductPrice>
                    </ProductHeader>
                    <ProductDesc>{product.Description || product.desc}</ProductDesc>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <ActionButton onClick={() => addToCart(product)}>
                        Add to Cart <FaShoppingCart />
                      </ActionButton>
                    </div>
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
