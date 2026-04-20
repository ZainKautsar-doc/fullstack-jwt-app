const express = require('express');
const cors = require('cors');
const db = require('./db');
const { generateToken } = require('./utils/jwt');
const { authMiddleware } = require('./middlewares/auth');
const { isAdminMiddleware } = require('./middlewares/isAdmin');

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

    // Jika valid: generate token menggunakan generateToken()
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // Return { token }
    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: "Terjadi kesalahan di server" });
  }
});

app.get('/profile', authMiddleware, (req, res) => {
  console.log('Route /profile: Accessible by', req.user.email);
  console.log('User data from req.user:', req.user);
  res.json(req.user);
});

app.get('/admin', authMiddleware, isAdminMiddleware, (req, res) => {
  console.log('Route /admin: Accessible by Admin', req.user.email);
  res.send('Welcome Admin');
});

// --- GOOGLE OAUTH ROUTES ---

app.get('/auth/google', (req, res) => {
  console.log('Endpoint GET /auth/google dipanggil');
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
  };

  const qs = new URLSearchParams(options).toString();
  const redirectUrl = `${rootUrl}?${qs}`;
  
  console.log('Redirecting to Google OAuth...');
  res.redirect(redirectUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  console.log('Endpoint GET /auth/google/callback dipanggil');
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Authorization code not found');
  }

  try {
    // 1. Exchange code for access_token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    if (!access_token) {
      console.error('Failed to get access token:', tokenData);
      return res.status(500).send('Failed to authenticate with Google');
    }

    // 2. Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const googleUser = await userResponse.json();
    const { email } = googleUser;

    if (!email) {
      return res.status(400).send('Google email not found');
    }

    // 3. Database operation
    let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      console.log('User baru (Google), simpan ke database...');
      const insertResult = await db.query(
        "INSERT INTO users (email, password, role) VALUES ($1, '', 'user') RETURNING *",
        [email]
      );
      user = insertResult.rows[0];
    }

    // 4. Generate JWT
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // 5. Redirect to frontend with token
    console.log('Google login sukses, redirecting to frontend...');
    res.redirect(`http://localhost:5173/home?token=${token}`);

  } catch (error) {
    console.error('Google OAuth Error:', error.message);
    res.status(500).send('Internal Server Error during Google Auth');
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
