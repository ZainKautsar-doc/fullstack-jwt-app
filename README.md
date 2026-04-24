# Fullstack JWT Authentication App

Aplikasi fullstack sederhana yang mengimplementasikan sistem autentikasi menggunakan JSON Web Token (JWT). Project ini dirancang untuk menunjukkan alur autentikasi modern pada aplikasi web, mulai dari registrasi, login, hingga proteksi endpoint berbasis token.

---

## Overview

Aplikasi ini memisahkan arsitektur antara frontend dan backend, dengan komunikasi melalui REST API. JWT digunakan sebagai mekanisme utama untuk menjaga sesi pengguna secara stateless.

---

## Fitur Utama

### Autentikasi
- Register user baru
- Login user
- Password hashing (bcrypt)
- Token berbasis JWT

### Authorization
- Proteksi endpoint menggunakan middleware JWT
- Akses data hanya untuk user yang terautentikasi

### User Management
- Mengambil data user yang sedang login
- Validasi input dasar

---

## Tech Stack

### Frontend
- React
- Vite
- Axios

### Backend
- Node.js
- Express.js
- JSON Web Token (JWT)
- bcrypt

### Database
- PostgreSQL

---

## Struktur Project

```
fullstack-jwt-app/
├── frontend/        # Client (UI)
├── backend/         # Server (API)
└── README.md
```

---

## Alur Autentikasi JWT

1. User melakukan register atau login
2. Backend memverifikasi kredensial
3. Jika valid, backend meng-generate JWT
4. Token dikirim ke client
5. Client menyimpan token (localStorage / cookie)
6. Setiap request ke endpoint protected menyertakan token
7. Backend memverifikasi token melalui middleware
8. Jika valid, request diproses

---

## Best Practice yang Digunakan

- Password disimpan menggunakan hashing (bcrypt)
- Token-based authentication (stateless)
- Middleware untuk proteksi route
- Pemisahan concern antara frontend dan backend
- Penggunaan environment variable untuk konfigurasi sensitif

---