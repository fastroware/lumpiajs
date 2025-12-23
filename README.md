# 🥟 LumpiaJS

> **"Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan."** > _Coding santai, performa badai, deploy dimana wae!_

**LumpiaJS** adalah framework web berbasis JavaScript yang didesain unik. Menggabungkan kemudahan Node.js, struktur MVC yang rapi, sintaks ala Laravel, dan fleksibilitas deployment yang luar biasa (bisa jalan di Server Node.js maupun Hosting PHP biasa!).

---

## 🔥 Kenapa Harus LumpiaJS?

1.  **Hybrid Deployment (Ajaib!)**: Sekali build (`lumpia goreng`), hasilnya bisa ditaruh di **Hosting PHP Murah (cPanel)**, **XAMPP**, atau **Vercel/Node.js**. Tanpa ubah kodingan!
2.  **Laravel Flavor**: Kangen tanda panah `->` di PHP? Di sini bisa dipakai di JavaScript!
    - `Jalan->get('/', ...)`
    - `DB.table('users')->where(...)->get()`
3.  **Auto Styling**: Integrasi otomatis TailwindCSS atau Bootstrap 5 saat membuat project.
4.  **Native Database**: Bisa connect MySQL langsung dari JS.
5.  **Bahasa Semarangan**: Coding rasa nongkrong di angkringan.

---

## 🛠️ Langkah 1: Instalasi

Pastikan kamu sudah menginstall **Node.js** di komputermu. Lalu install LumpiaJS secara global:

```bash
npm install -g lumpiajs
```

Tes instalasi dengan mengetik `lumpia` di terminal.

---

## 🏪 Langkah 2: Buka Warung (Buat Project)

Mari kita buat project pertama kita.

```bash
lumpia create-project warung-ku
```

_(Atau pakai alias lokal: `lumpia buka-cabang warung-ku`)_

Kamu akan ditanya:

- **Nama Project**: Bebas (misal: `toko-online`).
- **Gaya (Styling)**:
  - `Tailwind CSS` (Rekomendasi Modern)
  - `Bootstrap 5` (Klasik Sat-Set)
  - `Vanilla` (Kosongan)

Setelah selesai, jangan lupa masuk ke dapur dan siapkan bahan:

```bash
cd warung-ku
npm install
```

---

## 🧑‍🍳 Langkah 3: Memasak (Development)

Untuk mulai coding dan melihat hasilnya di browser (`http://localhost:3000`), jalankan:

```bash
lumpia kukus
```

_(Alias: `lumpia serve`)_

### 📁 Struktur Project Utama

- `routes/web.lmp`: Mengatur alamat URL (Peta jalan).
- `app/controllers/`: Otak logika aplikasi.
- `app/models/`: Tempat ngurus data.
- `views/`: Tampilan antarmuka (UI).
- `config.lmp`: Pengaturan project (Styling dll).
- `.env`: Konfigurasi rahasia (Database password, dll).

---

## 💻 Panduan Coding (Cheatsheet)

### 1. Routing (`routes/web.lmp`)

Mengatur URL mana menuju ke Controller mana.

```javascript
import { Jalan } from 'lumpiajs';

// Pakai panah '->' biar asik!
Jalan->get('/', 'HomeController@index');             // Halaman Depan
Jalan->get('/produk', 'ProductController@list');     // Halaman Produk
Jalan->get('/user/{id}', 'UserController@detail');   // Dengan Parameter
```

### 2. Controller & Database (`app/controllers/*.lmp`)

Tempat logika bisnis. Kamu bisa pakai **Laravel Syntax** di sini.

```javascript
import { Controller, DB } from 'lumpiajs';

export default class ProductController extends Controller {
    async list() {
        // Ambil data dari database (MySQL)
        // Syntax mirip Eloquent Laravel
        const produk = await DB.table('products')
                               ->where('stok', '>', 0)
                               ->orderBy('price', 'DESC')
                               ->get();

        // Kirim data ke View
        return this->tampil('produk-list', {
            data: produk,
            judul: 'Daftar Dagangan'
        });
    }

    async api() {
        return this->json({ status: 'ok' });
    }
}
```

### 3. Views (`views/*.lmp`)

LumpiaJS menggunakan format **Single File Component** yang unik.

```html
<lump>
  <!-- BAGIAN CSS -->
  <klambi>
    h1 { color: red; } .btn { @apply bg-blue-500 text-white px-4 py-2 rounded; }
    /* Support Tailwind */
  </klambi>

  <!-- BAGIAN HTML -->
  <kulit>
    <div class="container">
      <h1>{{ judul }}</h1>
      <ul>
        <!-- Loop data nanti dihandle JS client-side -->
      </ul>
      <button onclick="sapa()">Klik Saya</button>
    </div>
  </kulit>

  <!-- BAGIAN JAVASCRIPT -->
  <isi> // Bisa pakai bahasa lokal gawe sapa() { alert("Halo Lur!"); } </isi>
</lump>
```

---

## 🚀 Langkah 4: Deployment (Lumpia Goreng)

Ini fitur paling sakti. Kamu bisa membuat aplikasi ini jalan di mana saja.

**1. Matangkan Project (Build)**

```bash
lumpia goreng
```

_(Alias: `lumpia build`)_

Sistem akan membuat folder **`dist`**. Folder inilah yang siap disajikan.

**2. Pilih Cara Deploy:**

### A. Hosting PHP Biasa / XAMPP (Paling Umum)

Cocok buat yang punya hosting cPanel murah atau server kantor jadul.

1.  Ambil isi folder `dist`.
2.  Upload ke `public_html` atau folder `htdocs` kamu.
3.  **PENTING**: Edit file `api.php`. Sesuaikan config database (user/pass mysql).
4.  Selesai! Website langsung jalan.
    - _Kok bisa? Sistem secara cerdas mengarahkan request database browser ke `api.php`._

### B. Vercel / Netlify (Modern & Gratis)

1.  Drag & drop folder `dist` ke dashboard Vercel/Netlify.
2.  Atau push ke GitHub.
3.  Set Environment Variables di panel mereka (`DB_HOST`, dll).
4.  Jalan otomatis! (Pakai `api.js` sebagai serverless function).

### C. VPS / Node.js Server

1.  Upload folder `dist`.
2.  Install dependencies: `npm install --production`.
3.  Jalankan: `node server.js` (atau pakai PM2).

---

## 🛡️ Keamanan & Database

- **Database Config**: Pada mode development, edit `.env`. Pada mode production (PHP), edit `dist/api.php`.
- **Security**: Hasil build otomatis dilengkapi `.htaccess` yang memblokir akses ke file sensitif dan mengatur routing agar rapi (SPA Mode).

---

**Dibuat dengan ❤️ dan 🥟 dari Semarang.**
_Framework ini dedicated buat kamu yang pengen coding modern tapi juga mudah._
