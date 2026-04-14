const bcrypt = require('bcrypt');
const User = require('./models/User');

(async () => {
  try {
    const name = 'didul';
    const email = 'marukawacements724@gmail.com';
    const plainPassword = 'Tharu@5harsha';

    console.log('Creating admin user for:', email);

    // Hash password with same strength as main auth flow
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const userId = await User.create({
      name,
      email,
      contact: '',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Admin created successfully with unified ID:', userId);
    console.log('You can now log in with:');
    console.log('  Email   :', email);
    console.log('  Password:', plainPassword);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
    process.exit(1);
  }
})();
