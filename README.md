# 🥟 LumpiaJS

**Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan.**

---

## 🦄 Deployment Ajaib (Universal)

Ini fitur andalan LumpiaJS. Satu folder build (`dist`) bisa jalan di mana saja tanpa ubah kodingan.

User (Browser) akan menembak alamat `/api`.

- Jika di **Hosting PHP**, server otomatis mengarahkan ke `api.php`.
- Jika di **Vercel/Node**, server otomatis mengarahkan ke `api.js`.

### 1. Build Project

```bash
lumpia goreng
```

### 2. Panduan Deploy

**A. Hosting PHP / XAMPP (Apache)**

1.  Copy `dist` ke server.
2.  Edit **`api.php`** (Isi config database).
3.  Selesai.
    _Server otomatis pakai `.htaccess` untuk routing._

**B. Vercel (Gratis)**

1.  Drag `dist` ke Vercel (atau push git).
2.  Set Environment Variables di Vercel (`DB_HOST`, `DB_USER`, dll).
3.  Selesai.
    _Vercel otomatis baca `vercel.json` dan pakai `api.js` sebagai serverless function._

**C. VPS (Node.js)**

1.  Upload `dist`.
2.  `npm install`
3.  `npm start`
    _Node akan menjalankan `server.js`._

---

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
