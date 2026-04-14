const db = require('./config/db');
const Product = require('./models/Product');

// Seed six default products with fixed images from frontend/src/assets
// Run with:  node seed-products.js

const PRODUCTS = [
  {
    name: 'Sofa Set',
    description: 'Premium fabric sofa set ideal for modern living rooms.',
    price: 48000,
    image: 'Gemini_Generated_Image_elt1ngelt1ngelt1.png',
  },
  {
    name: 'Large Flower Vase',
    description: 'Tall decorative flower vase that becomes a centerpiece in any room.',
    price: 20000,
    image: 'Gemini_Generated_Image_qoa691qoa691qoa6.png',
  },
  {
    name: 'Small Flower Vase',
    description: 'Compact flower vase, perfect for desks and side tables.',
    price: 4000,
    image: 'login-hero.png',
  },
  {
    name: 'Ornaments',
    description: 'Elegant decorative ornaments to enhance your interior style.',
    price: 5000,
    image: 'register-hero.png',
  },
  {
    name: 'Medium Flower Vase',
    description: 'Medium-sized vase ideal for coffee tables and consoles.',
    price: 10000,
    image: "WhatsApp Image 2026-01-20 at 09.06.33 (1).jpeg",
  },
  {
    name: 'Flower Vase',
    description: 'Classic flower vase suitable for everyday use.',
    price: 12500,
    image: 'WhatsApp Image 2026-01-20 at 09.06.34.jpeg',
  },
];

(async () => {
  console.log('Seeding default products...');

  try {
    for (const p of PRODUCTS) {
      // Check if a product with the same name already exists
      const [rows] = await db.query('SELECT ProductID FROM product WHERE Name = ? LIMIT 1', [p.name]);

      if (rows.length > 0) {
        const productId = rows[0].ProductID;
        await db.query(
          'UPDATE product SET Description = ?, Price = ?, Image = ?, IsActive = 1 WHERE ProductID = ?',
          [p.description, p.price, p.image, productId]
        );
        console.log(`Updated existing product: ${p.name} (${productId})`);
      } else {
        const productId = await Product.create({
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image,
        });
        console.log(`Inserted new product: ${p.name} (${productId})`);
      }
    }

    const [all] = await db.query('SELECT ProductID, Name, Price, Image FROM product ORDER BY CreatedAt DESC');
    console.table(all);
  } catch (err) {
    console.error('Error while seeding products:', err.message);
  } finally {
    process.exit();
  }
})();
