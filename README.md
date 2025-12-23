# 🥟 LumpiaJS

**Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan.**  
Framework ini hadir sebagai solusi "Have Fun" bagi developer. Meskipun gayanya santai, LumpiaJS mengadopsi arsitektur **MVC (Model-View-Controller)** yang mirip banget sama framework sebelah (uhuk, Laravel). Jadi kamu bisa pakai struktur yang profesional!

---

## 🚀 Panduan Instalasi & Penggunaan (Lengkap)

### Opsi A: Menggunakan Command `lumpia` (Disarankan)

**1. Install Secara Global**

```bash
npm install -g lumpiajs
```

**2. Buat Project Baru**

```bash
lumpia create-project warung-ku
```

**3. Masuk & Install Dependencies (Wajib)**

```bash
cd warung-ku && npm install
```

**4. Jalankan Server**

```bash
lumpia kukus
```

_(Alias: `lumpia serve`)_

---

## ⚙️ Konfigurasi Environment (.env)

Setiap project LumpiaJS dilengkapi file `.env` di root folder.

```env
BASE_URL="http://localhost:3000"
APP_ENV="local"
APP_DEBUG="true"
```

---

## 🏗️ Struktur Project (Standar MVC)

```
warung-ku/
├── app/
│   ├── controllers/ # Otak Logika (Controller)
│   └── models/      # Pengolah Data (Model)
├── routes/
│   └── web.js       # Rute URL (Jalur Akses)
├── views/           # Tampilan (.lmp)
├── .env             # File Konfigurasi (Environment)
├── package.json
└── ...
```

### 1. Routes (`routes/web.js`)

Mengatur jalur URL. Sekarang sudah support parameter dinamis seperti Laravel!

```javascript
import { Jalan } from "lumpiajs";

// Basic GET
Jalan.get("/", "HomeController@index");

// API (POST/PUT/DELETE)
Jalan.post("/api/products", "ProductController@store");
Jalan.put("/api/products/{id}", "ProductController@update");
Jalan.delete("/api/products/{id}", "ProductController@destroy");

// Dynamic Route dengan Parameter
Jalan.get("/produk/{id}", "ProductController@show");
Jalan.get("/kategori/{slug}", "CategoryController@index");
```

### 2. Controllers (`app/controllers`)

Otak dari aplikasimu. Parameter dari route (misal `{id}`) otomatis masuk jadi argumen fungsi.

```javascript
import { Controller } from "lumpiajs";

export default class ProductController extends Controller {
  // Menangkap parameter {id} dari route
  show(id) {
    return this.json({
      pesan: "Menampilkan produk dengan ID: " + id,
      id: id,
    });
  }

  index() {
    return this.tampil("home", { env: this.env.APP_ENV });
  }
}
```

### 3. Views (`views`)

File berekstensi `.lmp`.

```html
<lump>
  <klambi> h1 { color: red; } </klambi>
  <kulit> <h1>{{ pesan }}</h1> </kulit>
  <isi> gawe sapa() { alert("Halo!"); } </isi>
</lump>
```

### 4. Models (`app/models`)

```javascript
import { Model } from "lumpiajs";
// Model.use(data).dimana('harga', '<', 5000).kabeh();
```

---

## 🧐 Kamus Bahasa (Transpiler)

Gunakan istilah Semarangan ini di dalam tag `<isi>` file `.lmp`:

| Bahasa Semarangan | JavaScript Asli |
| :---------------- | :-------------- |
| `ono`             | `let`           |
| `paten`           | `const`         |
| `gawe`            | `function`      |
| `yen`             | `if`            |
| `liyane`          | `else`          |
| `mandek`          | `return`        |
| `ora`             | `!`             |

---

## ⚠️ DISCLAIMER

**LumpiaJS ini adalah project "Have Fun" & Eksperimen Semata.**
Gunakan dengan resiko ditanggung sendiri (_Use at your own risk_).

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
