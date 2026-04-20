const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Running');
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
