# 🥟 LumpiaJS

**Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan.**  
_Framework ini dibuat untuk seru-seruan (have fun) dan biar bikin web jadi lebih cepat dan menyenangkan!_ (Rencananya sih gitu... wkwkwk)

## 🚀 Cara Pakai (Wajib Baca!)

Agar tidak bingung dan selalu mendapatkan resep terbaru, ikuti langkah-langkah ini dengan teliti ya, Juragan!

### 1. Buat Project Baru

Gunakan perintah `npx` dengan tambahan `@latest` agar kamu selalu menggunakan versi LumpiaJS paling baru (fresh from the oven).

```bash
npx lumpiajs@latest create-project warung-ku
```

### 2. Masuk Folder Project

```bash
cd warung-ku
```

### 3. Install Bumbu-Bumbunya (Wajib!)

Langkah ini sering dilupakan. Kamu **harus** menginstall dependencies agar project bisa jalan. **LumpiaJS tidak akan jalan kalau ini dilewatkan.**

```bash
npm install
```

### 4. Nyalakan Kompor (Jalankan Server)

Untuk menjalankan project, gunakan perintah npm yang sudah disediakan.

```bash
npm start
```

_Atau bisa juga pakai:_

```bash
npm run serve
```

_(Jangan pakai `npm serve` saja ya, nanti error "Unknown command". Pakai `run` atau `start`!)_

Websitemu bakal jalan di `http://localhost:3000`.

---

## ❓ Masalah yang Sering Muncul (FAQ)

**Q: Saya ketik `lumpia serve` kok error "command not recognized"?**  
A: Itu karena kamu belum menginstall LumpiaJS secara global. Gunakan `npm start` saja, itu sudah otomatis memanggil perintah lumpia dari dalam projectmu.  
Kalau kamu ngotot pengen pakai perintah `lumpia` langsung di terminal, kamu harus install global dulu: `npm install -g lumpiajs`. Tapi kami sarankan pakai `npm start` saja biar lebih aman dan rapi.

**Q: Saya ketik `npm serve` kok error?**  
A: Kurang `run`, Boss! Harusnya `npm run serve`.

**Q: Kenapa harus pakai `@latest` pas create-project?**  
A: Biar kamu nggak dapet versi basi (cache lama) yang mungkin masih error.

---

## 🏗️ Struktur Project (Standar MVC)

LumpiaJS sekarang menggunakan arsitektur **MVC (Model-View-Controller)** yang mengikuti standar internasional.

```
warung-ku/
├── app/
│   ├── controllers/ # Otak Logika (Controller)
│   └── models/      # Pengolah Data (Model)
├── routes/
│   └── web.js       # Rute URL
├── views/           # Tampilan (.lmp)
├── package.json
└── ...
```

### 1. Routes (`routes/web.js`)

Tempat mengatur alamat URL web kamu.

```javascript
import { Jalan } from "lumpiajs";

// Jalan.gawe(url, 'NamaController@method')
Jalan.gawe("/", "HomeController@index");
Jalan.gawe("/api/products", "ProductController@index");
```

### 2. Controllers (`app/controllers`)

Otak dari aplikasimu. Class harus meng-extend `Controller`.

```javascript
import { Controller } from "lumpiajs";

export default class HomeController extends Controller {
  index() {
    // Tampilkan file di folder views/home.lmp
    return this.tampil("home", {
      message: "Halo Dunia!",
      date: new Date().toLocaleDateString(),
    });
  }
}
```

### 3. Views (`views`)

File `.lmp` adalah tempat kamu menulis HTML, CSS, dan JS Semarangan dalam satu file.
Gunakan `{{ nama_variabel }}` untuk menampilkan data dari Controller.

```html
<lump>
  <klambi> /* CSS di sini */ h1 { color: #d35400; } </klambi>

  <kulit>
    <h1>{{ message }}</h1>
    <p>Tanggal: {{ date }}</p>
  </kulit>

  <isi>
    // JavaScript Client-side (Bahasa Semarangan) gawe sapa() { alert("Halo,
    Lur!"); }
  </isi>
</lump>
```

### 4. Models (`app/models`)

Tempat mengolah data (Database/API). Mendukung gaya penulisan ala Eloquent.

```javascript
import { Model } from "lumpiajs";

// Contoh penggunaan di Controller:
// Model.use(dataProduk).dimana('harga', '<', 5000).kabeh();
```

---

## 🤝 Cara Lapor Masalah

Nembe nemu bug?

1. Buka link ini: [https://github.com/fastroware/lumpiajs/issues](https://github.com/fastroware/lumpiajs/issues)
2. Klik tombol warna hijau bertuliskan **"New Issue"**.

---

## ⚠️ DISCLAIMER

**LumpiaJS ini 100% project _Have Fun_ & Eksperimen.**
Gunakan dengan resiko ditanggung sendiri (_Use at your own risk_).

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
