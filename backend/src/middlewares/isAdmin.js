const isAdminMiddleware = (req, res, next) => {
  const user = req.user;

  // Cek apakah user ada (dari authMiddleware) dan role adalah 'admin'
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Access denied, admin only" });
  }

  // Jika admin, lanjut ke alur berikutnya
  next();
};

module.exports = {
  isAdminMiddleware
};
