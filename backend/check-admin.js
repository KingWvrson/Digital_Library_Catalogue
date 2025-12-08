const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkAdmin() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const isRenderDB = process.env.DATABASE_URL.includes('render.com');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isRenderDB ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('\n🔍 Checking admin user...\n');
    
    const result = await pool.query('SELECT * FROM users WHERE role = $1', ['admin']);
    
    if (result.rows.length === 0) {
      console.log('❌ No admin user found!');
      console.log('Creating admin user...\n');
      
      const email = 'admin@example.com';
      const password = 'admin123';
      const username = 'admin';
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        [username, email, hashedPassword, 'admin']
      );
      
      console.log('✅ Admin user created!');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}\n`);
    } else {
      const admin = result.rows[0];
      console.log('✅ Admin user found:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      
      // Test password
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, admin.password);
      
      console.log(`\n🔐 Testing password "admin123":`);
      if (isValid) {
        console.log('   ✅ Password is CORRECT');
        console.log('\n📋 Login Credentials:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: admin123`);
        console.log('\n⚠️  Make sure you type the email EXACTLY as shown above (case-sensitive)');
      } else {
        console.log('   ❌ Password is INCORRECT');
        console.log('\n   Resetting password to "admin123"...');
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, admin.id]);
        console.log('   ✅ Password reset complete!');
        console.log('\n📋 Login Credentials:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: admin123\n`);
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkAdmin();

