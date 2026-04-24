import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaSearch, FaBars, FaTimes, FaArrowLeft, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import img1 from './assets/WhatsApp Image 2026-01-20 at 09.06.33 (1).jpeg';
import img2 from './assets/WhatsApp Image 2026-01-20 at 09.06.34.jpeg';
import img3 from './assets/login-hero.png';
import img5 from './assets/Gemini_Generated_Image_elt1ngelt1ngelt1.png';
import img7 from './assets/Gemini_Generated_Image_qoa691qoa691qoa6.png';
import img8 from './assets/register-hero.png';

// Admin-only catalog page.
// - Fetches products from the backend and shows them in a card grid
// - Provides quick navigation to the admin catalog management screen
// - Allows deleting a product via the backend DELETE endpoint

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
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(200, 155, 65, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;

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
  color: rgba(255,255,255,0.35);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 45px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #c0a062;
    background: rgba(0,0,0,0.5);
  }

  &::placeholder {
    color: rgba(255,255,255,0.3);
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
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
  margin: 0 0 20px 0;
  flex: 1;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #c0a062;
  color: #111827;
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
  box-shadow: 0 4px 15px rgba(192, 160, 98, 0.2);

  &:hover {
    background: #d4b886;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(192, 160, 98, 0.3);
  }
`;

const DeleteButton = styled.button`
  padding: 14px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e74c3c;
    color: white;
    transform: translateY(-2px);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
`;

const CatalogForAdmin = () => {
  const navigate = useNavigate();

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Page guard + initial data load:
  // - Reads the logged-in user from localStorage
  // - Redirects away if not logged in or not an admin
  // - Loads products from the backend
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      navigate('/login');
      return;
    }

    if (!parsedUser || parsedUser.role !== 'admin') {
      navigate('/catalog');
      return;
    }

    // Fetch the product list used to render the grid.
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error loading products for admin catalog:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  // Deletes a product from the backend, then removes it from local state
  // so the UI updates immediately without a refetch.
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product from the catalog?")) return;

    try {
      // If the backend enforces auth on DELETE, send the token when present.
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.ProductID !== id));
        alert('✅ Product removed from catalog');
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error deleting product. Please try again.');
    }
  };

  // Picks the best display image for the product:
  // - If the backend provides a usable URL/data URI, use it directly
  // - Otherwise map known filenames to bundled images
  // - Fall back to a default image
  const getProductImage = (product) => {
    if (product.Image) {
      if (typeof product.Image === 'string' && (product.Image.startsWith('data:') || product.Image.startsWith('http'))) {
        return product.Image;
      }

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
    return img1;
  };

  // Client-side search filter over the already-fetched products.
  const filteredProducts = products.filter(p => {
    const name = (p.Name || '').toLowerCase();
    const desc = (p.Description || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || desc.includes(q);
  });

  return (
    <>
      <GlobalStyle />
      <Layout>
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Clickable overlay to close the sidebar on mobile */}
              <SidebarOverlay onClick={() => setIsSidebarOpen(false)} />
              <Sidebar initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}>
                <SidebarCloseBtn onClick={() => setIsSidebarOpen(false)}><FaTimes /></SidebarCloseBtn>

                {/* Admin navigation shortcuts */}
                <SidebarButton onClick={() => navigate('/admin/dashboard')}><FaArrowLeft /> Dashboard</SidebarButton>
                <SidebarButton onClick={() => navigate('/admin/catalog-manage')}><FaEdit /> Manage Items</SidebarButton>

                {/* Note: this simply navigates to /login (no token clearing here) */}
                <SidebarButton onClick={() => navigate('/login')}><FaSignOutAlt /> Logout</SidebarButton>
              </Sidebar>
            </>
          )}
        </AnimatePresence>

        <MainContent>
          <Header>
            <HeaderTop>
              <HeaderLeft>
                <SidebarOpenBtn onClick={() => setIsSidebarOpen(true)}><FaBars /></SidebarOpenBtn>
                <HeaderTitle>Admin Catalog View</HeaderTitle>
              </HeaderLeft>
              <Nav>
                <NavLink onClick={() => navigate('/admin/dashboard')}>Dashboard</NavLink>
              </Nav>
            </HeaderTop>
            <SearchFilterBar>
              <SearchWrapper>
                <SearchIcon />
                <SearchInput
                  placeholder="Search catalog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchWrapper>
            </SearchFilterBar>
          </Header>

          <CatalogGrid>
            <AnimatePresence>
              {/* Loading / empty / populated states */}
              {loading && filteredProducts.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading catalog...</p>
              ) : filteredProducts.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>No products in catalog yet.</p>
              ) : (
                filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.ProductID || idx}
                    // Card entrance animation (staggered slightly by index)
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.1 }}
                    layout
                  >
                    <ProductImg src={getProductImage(product)} />
                    <ProductInfo>
                      <ProductHeader>
                        <ProductTitle>{product.Name}</ProductTitle>
                        <ProductPrice>Rs. {parseFloat(product.Price).toFixed(2)}</ProductPrice>
                      </ProductHeader>
                      <ProductDesc>{product.Description || 'No description'}</ProductDesc>
                      <ButtonGroup>
                        {/* Goes to the admin CRUD screen (edit/add happens there) */}
                        <ActionButton onClick={() => navigate('/admin/catalog-manage')} style={{ flex: 1 }}>
                          Edit / Add <FaEdit />
                        </ActionButton>
                        {/* Deletes this product */}
                        <DeleteButton onClick={() => handleDelete(product.ProductID)} title="Delete Product">
                          <FaTrash />
                        </DeleteButton>
                      </ButtonGroup>
                    </ProductInfo>
                  </ProductCard>
                ))
              )}
            </AnimatePresence>
          </CatalogGrid>
        </MainContent>
      </Layout>
    </>
  );
};

export default CatalogForAdmin;
