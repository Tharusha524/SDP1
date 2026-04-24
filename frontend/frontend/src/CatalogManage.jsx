import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaCloudUploadAlt, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

// Admin catalog CRUD screen.
// - Fetches all products from the backend
// - Lets admins add products (including image upload as a base64 data URL)
// - Lets admins edit or permanently delete products
// Note: this component assumes routing/auth is handled elsewhere; it uses the token
// from localStorage when calling protected endpoints.

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
    color: #d3d3d3;
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
    color: #ddb154;
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

export default function CatalogManage() {
  const navigate = useNavigate();

  // Product list displayed in the table below.
  const [products, setProducts] = useState([]);

  // Form model for add/edit.
  // `image` holds either a base64 data URL (after upload) or whatever the backend returned.
  const [formData, setFormData] = useState({ id: '', name: '', price: '', description: '', image: '' });

  // Preview image shown in the form (data URL).
  const [preview, setPreview] = useState(null);

  // When true, the form submits an update (PUT) instead of creating (POST).
  const [isEditing, setIsEditing] = useState(false);

  // Shared loading flag used to disable inputs/buttons during network calls.
  const [loading, setLoading] = useState(false);

  // Initial load: fetch products once when the page mounts.
  useEffect(() => {
    console.log('🔄 CatalogManage component mounted - fetching products...');
    fetchProducts();
  }, []);

  // Loads the latest product list from the backend.
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        console.log(`✅ Loaded ${data.products.length} products from database`);
      } else {
        console.error('Failed to fetch products:', data);
        alert('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Cannot connect to backend server. Please ensure it is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Controlled inputs: keep `formData` in sync with the form fields.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reads the selected image file into a base64 data URL.
  // This data URL is stored in state and sent to the backend as `image`.
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

  // Clears the form back to “add mode”.
  const resetForm = () => {
    setFormData({ id: '', name: '', price: '', description: '',  image: '' });
    setPreview(null);
    setIsEditing(false);
  };

  // Creates a new product (POST /api/products).
  // Performs client-side validation first, then refetches products on success.
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const cleanName = String(formData.name || '').trim();
    const cleanDescription = String(formData.description || '').trim();
    const numericPrice = Number(formData.price);
    const cleanImage = String(formData.image || '').trim();

    if (!cleanName || !cleanDescription) {
      alert('Product name and description are required.');
      return;
    }

    if (!cleanImage) {
      alert('Product image is required.');
      return;
    }

    if (!Number.isFinite(numericPrice)) {
      alert('Please enter a valid price.');
      return;
    }

    if (numericPrice < 1000) {
      alert('Price must be at least Rs. 1000.00');
      return;
    }

    setLoading(true);
    try {
      // If the backend uses JWT auth, include the token when available.
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: cleanName,
          description: cleanDescription,
          price: numericPrice,
          image: cleanImage
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Product created:', data.productId);
        // Reset form first
        resetForm();
        // Then fetch updated product list
        await fetchProducts();
        // Show success message
        alert(`✅ Product "${formData.name}" added successfully!\n\nProduct ID: ${data.productId}\n\nYour product is now visible in the catalog below.`);
        // Scroll to the catalog table
        setTimeout(() => {
          const catalogSection = document.querySelector('h2:nth-of-type(2)');
          if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      } else {
        console.error('Server error:', data);
        alert(`❌ Error: ${data.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.message.includes('fetch')) {
        alert('Cannot connect to server. Please ensure backend is running on port 5000.');
      } else {
        alert(`Error adding product: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    // Populate the form from the selected row.
    setFormData({
      id: product.ProductID,
      name: product.Name,
      price: product.Price,
      description: product.Description || '',
      
      image: product.Image || ''
    });
    // Use the existing image as the preview (may be a URL or data URL).
    setPreview(product.Image);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Updates an existing product (PUT /api/products/:id).
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const cleanName = String(formData.name || '').trim();
    const cleanDescription = String(formData.description || '').trim();
    const numericPrice = Number(formData.price);
    const cleanImage = String(formData.image || '').trim();

    if (!cleanName || !cleanDescription) {
      alert('Product name and description are required.');
      return;
    }

    if (!cleanImage) {
      alert('Product image is required.');
      return;
    }

    if (!Number.isFinite(numericPrice)) {
      alert('Please enter a valid price.');
      return;
    }

    if (numericPrice < 1000) {
      alert('Price must be at least Rs. 1000.00');
      return;
    }

    setLoading(true);
    try {
      // If the backend uses JWT auth, include the token when available.
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:5000/api/products/${formData.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: cleanName,
          description: cleanDescription,
          price: numericPrice,
          image: cleanImage
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Product updated successfully! Changes reflected in the catalog.');
        await fetchProducts();
        resetForm();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    } finally {
      setLoading(false);
    }
  };

  // Permanently deletes a product (DELETE /api/products/:id), then refetches the list.
  const handleRemoveProduct = async (id) => {
    if (!window.confirm("⚠️ Are you sure you want to permanently delete this product?\n\nThis action cannot be undone and will remove the product from the database.")) return;

    setLoading(true);
    try {
      console.log('Deleting product:', id);
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Product deleted from database');
        alert('✅ Product permanently deleted from database!');
        await fetchProducts();
      } else {
        console.error('Delete failed:', data);
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Error connecting to server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageWrapper>
        <Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Manage Product Catalog</h1>
            <div style={{ display: 'flex', gap: '12px' }}>
              <ActionIconButton onClick={() => navigate('/admin/dashboard')} style={{ color: '#c0a062', fontSize: '1rem' }}>
                <FaArrowLeft /> Dashboard
              </ActionIconButton>
              <ActionIconButton onClick={() => navigate('/login')} style={{ color: '#c0a062', fontSize: '1rem' }}>
                <FaSignOutAlt /> Logout
              </ActionIconButton>
            </div>
          </div>
        </Header>

        <MainContainer>
          {/* Form Card */}
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>{isEditing ? <FaEdit /> : <FaPlus />} {isEditing ? "Edit Product" : "Add New Product"}</h2>
            {/* When editing, submit updates; otherwise, create a new product */}
            <Form onSubmit={isEditing ? handleUpdateProduct : handleAddProduct}>
              <FormGroup>
                <label>Product Name</label>
                <Input
                  name="name"
                  placeholder="e.g., Ceramic Vase"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </FormGroup>
              <FormGroup>
                <label>Price (Rs.)</label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  min="1000"
                  placeholder="e.g., 1500"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </FormGroup>
              <FormGroup>
                <label>Description</label>
                <TextArea
                  name="description"
                  rows="3"
                  placeholder="Short description..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </FormGroup>

              <UploadSection>
                <label>Product Image</label>
                {/* Show upload prompt until an image is selected, then show a preview */}
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
                      // Remove selected image from the form.
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
                  <Button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <FaPlus /> {loading ? 'Adding...' : 'Add Product'}
                  </Button>
                ) : (
                  <>
                    <Button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {loading ? 'Updating...' : 'Update Product'}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={resetForm}
                      disabled={loading}
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
            <h2>Product Catalog ({products.length} {products.length === 1 ? 'product' : 'products'})</h2>
            {products.length > 0 && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '-20px', marginBottom: '20px' }}>
                Showing all active products with edit and delete options
              </p>
            )}
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
                  {/* Render states: initial loading, empty catalog, or product rows */}
                  {loading && products.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
                        Loading products...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.3)' }}>
                        No products in catalog yet. Add your first product above! 👆
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {products.map((product) => (
                        <motion.tr
                          key={product.ProductID}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td><strong>#{product.ProductID}</strong></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {/* If the backend returns an image URL/data URL, show it as a small thumbnail */}
                              {product.Image && <img src={product.Image} alt={product.Name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                              {product.Name}
                            </div>
                          </td>
                          <td style={{ color: '#27ae60', fontWeight: 700 }}>Rs. {parseFloat(product.Price).toFixed(2)}</td>
                          <td style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', maxWidth: '250px' }}>{product.Description || 'No description'}</td>
                          <td>
                            <TableActions>
                              {/* Edit loads the row into the form above */}
                              <ActionIconButton onClick={() => handleEditClick(product)} disabled={loading} title="Edit">
                                <FaEdit size={18} />
                              </ActionIconButton>
                              {/* Remove calls DELETE on this product */}
                              <ActionIconButton variant="danger" onClick={() => handleRemoveProduct(product.ProductID)} disabled={loading} title="Remove">
                                <FaTrash size={18} />
                              </ActionIconButton>
                            </TableActions>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
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
