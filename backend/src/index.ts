import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initDB, pool, mockUsers } from './db';
import { generateToken } from './utils/jwt';
import { authenticateToken, requireAdmin } from './middleware/auth';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  await initDB();

  // POST /register
  app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    if (pool) {
      try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
          return res.status(400).json({ error: 'Email already exists' });
        }

        await pool.query(
          'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
          [email, password, 'user']
        );
        return res.json({ message: 'User registered successfully' });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database query failed' });
      }
    } else {
      // In-Memory Fallback
      if (mockUsers.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already exists (Mock DB)' });
      }
      mockUsers.push({ id: mockUsers.length + 1, email, password, role: 'user' });
      return res.json({ message: 'User registered successfully (Mock DB)' });
    }
  });

  // POST /login
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    let user;
    if (pool) {
      try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        user = result.rows[0];
      } catch (err) {
        user = mockUsers.find(u => u.email === email);
      }
    } else {
      user = mockUsers.find(u => u.email === email);
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invialid email or password / Database connection fallback' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token });
  });

  // GET /profile (Protected)
  app.get('/profile', authenticateToken, async (req: any, res: any) => {
    let user;
    if (pool) {
      try {
        const result = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [req.user.id]);
        user = result.rows[0];
      } catch (err) {
        user = mockUsers.find(u => u.id === req.user.id);
      }
    } else {
      user = mockUsers.find(u => u.id === req.user.id);
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // GET /admin (Protected + Role Admin)
  app.get('/admin', authenticateToken, requireAdmin, (req: any, res: any) => {
    res.json({
      message: 'Welcome Admin!',
      adminData: {
        stats: 'Everything is running smoothly',
        userRole: req.user.role
      }
    });
  });

  // VITE MIDDLEWARE (OR STATIC SERVING) FOR AI STUDIO PREVIEW
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
