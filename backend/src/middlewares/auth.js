const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  console.log('Middleware: Checking auth header...');
  
  const authHeader = req.headers['authorization'];
  // Format: Bearer token
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Middleware: No token found');
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  const user = verifyToken(token);
  if (!user) {
    console.log('Middleware: Invalid or expired token');
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  console.log('Middleware: Token valid, user:', user.email);
  // Simpan payload ke req.user
  req.user = user;
  next();
};

module.exports = {
  authMiddleware
};
