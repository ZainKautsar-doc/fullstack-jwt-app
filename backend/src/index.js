const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Running');
});

app.post('/register', async (req, res) => {
  console.log('Endpoint POST /register dipanggil');
  try {
    const { email, password } = req.body;
    
    // Cek apakah email sudah ada
    const checkUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }
    
    // Jika tidak: INSERT INTO users
    await db.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, 'user')",
      [email, password]
    );
    
    // Return JSON sukses
    return res.json({ message: "Register berhasil" });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ message: "Terjadi kesalahan di server" });
  }
});

app.post('/login', async (req, res) => {
  console.log('Endpoint POST /login dipanggil');
  console.log('Request body:', req.body);
  
  try {
    const { email, password } = req.body;
    
    // Gunakan PostgreSQL query: SELECT * FROM users WHERE email = $1
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // Cek user di database
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Cek password (plain text sesuai register flow saat ini)
    if (user.password !== password) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Jika valid: Generate JWT (id, email, role)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-key-fallback',
      { expiresIn: '1h' }
    );

    // Return { token }
    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: "Terjadi kesalahan di server" });
  }
});

// Saat server start
app.listen(port, async () => {
  try {
    // Jalankan query test ke database
    await db.query('SELECT NOW()');
    // Jika berhasil tampilkan: "Database connected"
    console.log('Database connected');
  } catch (error) {
    // Jika gagal tampilkan error
    console.error('Database connection error:', error.message);
  }
  console.log(`Server running on port ${port}`);
});
