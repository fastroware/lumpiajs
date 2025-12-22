# 🥟 LumpiaJS

**Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan.**  
_Framework ini dibuat untuk seru-seruan (have fun) dan biar bikin web jadi lebih cepat dan menyenangkan!_ (Rencananya sih gitu... wkwkwk)

## 🚀 Cara Pakai (Quick Start)

Kamu bisa pilih cara yang paling enak buat mulai bikin (masak) web:

### 1. Langsung Gas (Tanpa Install)

Kalau malas install-install, pastikan komputer kamu sudah ada Node.js, lalu langsung aja pakai `npx`:

**Langkah 1: Buat Project**

```bash
npx lumpiajs create-project warung-ku
```

_(Atau pakai istilah lokal: `npx lumpiajs buka-cabang warung-ku`)_

**Langkah 2: Masuk & Install Bumbu (Dependencies)**
Penting! Kamu harus install dependencies biar `import` framework-nya jalan.

```bash
cd warung-ku
npm install
```

**Langkah 3: Nyalakan Kompor (Server)**

```bash
npm start
```

_(Atau manual: `npx lumpia dodolan`)_
Websitemu bakal jalan di `http://localhost:3000`.

---

### 2. Install Global (Biar Bisa Dipakai Terus)

Kalau kamu pengen perintah `lumpia` bisa dipanggil dari mana saja di terminal:

```bash
# 1. Install dulu secara global
npm install -g lumpiajs

# 2. Bikin project baru
lumpia create-project toko-lumpia

# 3. Masuk folder & install npm
cd toko-lumpia
npm install

# 4. Jalanin server
lumpia dodolan
```

**Cara Update ke Versi Terbaru:**

```bash
npm install -g lumpiajs@latest
```

---

## 🏗️ Struktur Project (Standar MVC)

LumpiaJS sekarang menggunakan arsitektur **MVC (Model-View-Controller)** yang mengikuti standar internasional, jadi developer Laravel atau Express pasti langsung paham.

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
    // Kirim data 'pesan' ke view
    return this.tampil("home", {
      pesan: "Halo Dunia!",
      tanggal: new Date().toLocaleDateString(),
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
    <!-- HTML di sini -->
    <h1>{{ pesan }}</h1>
    <p>Tanggal server: {{ tanggal }}</p>
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

## 🧐 Kamus Bahasa (Transpiler)

Khusus di dalam tag **`<isi>`** (pada file `.lmp`), kamu bisa menggunakan sintaks unik ini:

- `ono` ➔ `let`
- `paten` ➔ `const`
- `gawe` ➔ `function`
- `yen` ➔ `if`
- `liyane` ➔ `else`
- `mandek` ➔ `return`
- `ora` ➔ `!`
- `panjang()` ➔ `.length`

---

## 🤝 Cara Lapor Masalah atau Kasih Saran

Baru nemu bug? Atau punya ide jenius biar LumpiaJS makin jos? Sampaikan saja!

Caranya gampang:

1. Buka link ini: [https://github.com/fastroware/lumpiajs/issues](https://github.com/fastroware/lumpiajs/issues)
2. Klik tombol warna hijau bertuliskan **"New Issue"**.
3. Isi Judul dengan jelas.
4. Jelaskan masalah atau saranmu di kolom deskripsi.
5. Klik **"Submit new issue"**.

Selesai! Masukanmu akan saya baca pas lagi senggang.

---

## ⚠️ DISCLAIMER (PENTING BANGET, WAJIB DIBACA!) ⚠️

**LumpiaJS ini 100% project _Have Fun_ & Eksperimen.**

Kami **TIDAK BERTANGGUNG JAWAB** atas segala bentuk kerugian yang mungkin terjadi akibat penggunaan software ini, termasuk tapi tidak terbatas pada:

- Kebocoran data.
- Hilangnya file penting.
- Komputer meledak (lebay, tapi tetap saja hati-hati).
- Kerugian materiil maupun immateriil lainnya.

Gunakan framework ini dengan resiko ditanggung sendiri (_Use at your own risk_). Kalau ada error di production karena nekat pakai ini, jangan nyalahin kami ya! 🙏

---

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
