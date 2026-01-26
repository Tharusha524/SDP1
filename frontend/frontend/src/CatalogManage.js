import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaImage, FaTimes, FaCloudUploadAlt } from "react-icons/fa";

// --- Global Styles ---
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');

  body {
    background: radial-gradient(circle at top left, #1a1a1a, #0d0d0d);
    color: #f3f4f6;
    font-family: 'Manrope', -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
`;

// --- Styled Components ---
const PageWrapper = styled.div`
  min-height: 100vh;
  padding-bottom: 60px;
`;

const Header = styled.header`
  background: rgba(17,17,17,0.9);
  backdrop-filter: blur(12px);
  color: #c0a062;
  padding: 40px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0,0,0,0.3);
  margin-bottom: 50px;
  border-bottom: 1px solid rgba(255,255,255,0.05);

  h1 {
    margin: 0;
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    letter-spacing: 2px;
    color: #f3f4f6;
  }
`;

const MainContainer = styled.div`
  width: 90%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);

  h2 {
    font-family: 'Playfair Display', serif;
    margin-top: 0;
    margin-bottom: 32px;
    color: #f3f4f6;
    font-size: 1.75rem;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 700;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  background: rgba(0,0,0,0.3);
  color: #f3f4f6;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #c0a062;
    background: rgba(0,0,0,0.5);
  }

  &::placeholder {
    color: rgba(255,255,255,0.3);
  }
`;

const TextArea = styled.textarea`
  padding: 14px 16px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  background: rgba(0,0,0,0.3);
  color: #f3f4f6;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #c0a062;
    background: rgba(0,0,0,0.5);
  }

  &::placeholder {
    color: rgba(255,255,255,0.3);
  }
`;

const UploadSection = styled.div`
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const CustomFileInput = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(0,0,0,0.3);
  border: 2px dashed rgba(255,255,255,0.2);
  border-radius: 16px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255,255,255,0.5);

  &:hover {
    background: rgba(192,160,98,0.08);
    border-color: #c0a062;
    color: #c0a062;
  }

  input {
    display: none;
  }
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(0,0,0,0.3);
  border-radius: 12px;
  width: fit-content;
  border: 1px solid rgba(255,255,255,0.1);
`;

const PreviewImg = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #c0a062;
`;

const ButtonGroup = styled.div`
  grid-column: span 2;
  display: flex;
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const Button = styled(motion.button)`
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;

  background-color: ${props => props.variant === 'danger' ? '#e74c3c' : '#c0a062'};
  color: ${props => props.variant === 'danger' ? '#fff' : '#111827'};
  box-shadow: 0 4px 15px ${props => props.variant === 'danger' ? 'rgba(231, 76, 60, 0.3)' : 'rgba(192, 160, 98, 0.2)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${props => props.variant === 'danger' ? 'rgba(231, 76, 60, 0.4)' : 'rgba(192, 160, 98, 0.3)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Table Components
const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 12px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;

  thead {
    background-color: rgba(0,0,0,0.3);
    color: #c0a062;
  }

  th {
    padding: 20px;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.05);
  }

  td {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
  }

  tbody tr:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }
`;

const TableActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
  color: ${props => props.variant === 'danger' ? '#e74c3c' : '#3498db'};

  &:hover {
    background: ${props => props.variant === 'danger' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
  }
`;

// --- Sample Data ---
const INITIAL_DATA = [
  { id: 'PRD-2001', name: 'Flower Vases', price: '5000', desc: 'Elegant decorative vases for home and office', image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=200' },
  { id: 'PRD-2002', name: 'Sofa', price: '12,000', desc: 'Comfortable sofa for living room', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=200' },
];

export default function CatalogManage() {
  const [products, setProducts] = useState(INITIAL_DATA);
  const [formData, setFormData] = useState({ id: '', name: '', price: '', desc: '', image: '' });
  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', price: '', desc: '', image: '' });
    setPreview(null);
    setIsEditing(false);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.price) return;

    if (products.some(p => p.id === formData.id)) {
      alert("Product ID already exists!");
      return;
    }

    setProducts(prev => [...prev, formData]);
    resetForm();
  };

  const handleEditClick = (product) => {
    setFormData(product);
    setPreview(product.image);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    setProducts(prev => prev.map(p => p.id === formData.id ? formData : p));
    resetForm();
  };

  const handleRemoveProduct = (id) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageWrapper>
        <Header>
          <h1>Manage Product Catalog</h1>
        </Header>

        <MainContainer>
          {/* Form Card */}
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>{isEditing ? <FaEdit /> : <FaPlus />} {isEditing ? "Edit Product" : "Add New Product"}</h2>
            <Form onSubmit={isEditing ? handleUpdateProduct : handleAddProduct}>
              <FormGroup>
                <label>Product ID</label>
                <Input
                  name="id"
                  placeholder="e.g., PRD-2003"
                  value={formData.id}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Product Name</label>
                <Input
                  name="name"
                  placeholder="e.g., Ceramic Vase"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Price (Rs.)</label>
                <Input
                  name="price"
                  placeholder="e.g., 1500"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Description</label>
                <TextArea
                  name="desc"
                  rows="3"
                  placeholder="Short description..."
                  value={formData.desc}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <UploadSection>
                <label>Product Image</label>
                {!preview ? (
                  <CustomFileInput>
                    <FaCloudUploadAlt size={24} />
                    <span>Click to upload image</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                  </CustomFileInput>
                ) : (
                  <ImagePreviewContainer>
                    <PreviewImg src={preview} alt="Preview" />
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => { setPreview(null); setFormData(p => ({ ...p, image: '' })); }}
                      style={{ padding: '8px 12px' }}
                    >
                      <FaTrash /> Remove
                    </Button>
                  </ImagePreviewContainer>
                )}
              </UploadSection>

              <ButtonGroup>
                {!isEditing ? (
                  <Button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <FaPlus /> Add Product
                  </Button>
                ) : (
                  <>
                    <Button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Update Product
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={resetForm}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </ButtonGroup>
            </Form>
          </Card>

          {/* Table Card */}
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Product Catalog</h2>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {products.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td><strong>#{product.id}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {product.image && <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                            {product.name}
                          </div>
                        </td>
                        <td style={{ color: '#27ae60', fontWeight: 700 }}>Rs. {product.price}</td>
                        <td style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', maxWidth: '250px' }}>{product.desc}</td>
                        <td>
                          <TableActions>
                            <ActionIconButton onClick={() => handleEditClick(product)} title="Edit">
                              <FaEdit size={18} />
                            </ActionIconButton>
                            <ActionIconButton variant="danger" onClick={() => handleRemoveProduct(product.id)} title="Remove">
                              <FaTrash size={18} />
                            </ActionIconButton>
                          </TableActions>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.3)' }}>
                        No products found in the catalog.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </Card>
        </MainContainer>

        <footer style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} Marukawa Cement Works | Product Management Systems
        </footer>
      </PageWrapper>
    </>
  );
}
