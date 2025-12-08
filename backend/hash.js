const bcrypt = require('bcryptjs');

// Get password from command line arguments or use default
const password = process.argv[2] || 'password123';

async function hashPassword() {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('\n========================================');
    console.log('Password Hash Generator');
    console.log('========================================');
    console.log('Original Password:', password);
    console.log('Hashed Password:', hashedPassword);
    console.log('========================================\n');
    
    // Also show how to use it in SQL
    console.log('To insert this into the database:');
    console.log(`INSERT INTO users (username, email, password, role) VALUES ('username', 'email@example.com', '${hashedPassword}', 'student');\n`);
  } catch (error) {
    console.error('Error hashing password:', error.message);
    process.exit(1);
  }
}

// Run the hash function
hashPassword();
