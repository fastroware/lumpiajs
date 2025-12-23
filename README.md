# 🥟 LumpiaJS

**Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan.**  
Framework ini hadir sebagai solusi "Have Fun" bagi para developer yang ingin merasakan sensasi coding dengan cita rasa lokal. Meskipun dibangun dengan semangat bercanda, LumpiaJS mengadopsi arsitektur **MVC (Model-View-Controller)** yang modern dan powerful, mirip dengan framework populer seperti Laravel atau Express.js. Jadi, selain seru-seruan, kamu juga tetap bisa belajar struktur kode yang rapi dan profesional.

---

## 🚀 Panduan Instalasi & Penggunaan (Lengkap)

Kami menyediakan dua metode penggunaan yang bisa kamu pilih sesuai selera. Mau yang praktis tanpa install global? Bisa. Mau yang keren bisa panggil perintah `lumpia` langsung di terminal? Juga bisa!

Silakan pilih salah satu metode di bawah ini:

### Opsi A: Menggunakan Command `lumpia` (Disarankan)

Metode ini sangat kami sarankan karena kamu bisa merasa seperti "Juragan Lumpia" beneran dengan mengetik perintah `lumpia` di terminalmu.

**Langkah 1: Install Secara Global**
Pertama-tama, kamu harus menginstall LumpiaJS ke dalam sistem komputermu secara global. Salin dan jalankan perintah ini:

```bash
npm install -g lumpiajs
```

**Langkah 2: Buat Project Baru**
Setelah terinstall, kamu bisa membuat project dimanapun dengan perintah sakti ini. Ganti `warung-ku` dengan nama folder project yang kamu inginkan.

```bash
lumpia create-project warung-ku
```

_(Atau kalau mau lebih lokal: `lumpia buka-cabang warung-ku`)_

**Langkah 3: Masuk & Install Dependencies**
Jangan lupa masuk ke foldernya dan install "bumbu-bumbunya" (dependencies). Ini langkah wajib agar aplikasimu tidak error.

```bash
cd warung-ku && npm install
```

**Langkah 4: Jalankan Server (Kukus)**
Sekarang saatnya memasak! Jalankan server development dengan perintah berikut:

```bash
lumpia serve
```

Kamu juga bisa menggunakan istilah lokal yang lebih kearifan lokal:

```bash
lumpia kukus
```

_(Alias lain: `lumpia dodolan`)_

---

### Opsi B: Menggunakan NPM (Tanpa Install Global)

Kalau kamu tim "anti-ribet" yang malas mengotori sistem global komputermu, kamu bisa menggunakan `npx`.

**Langkah 1: Buat Project Baru**
Pastikan selalu gunakan `@latest` agar mendapatkan versi paling segar dan bebas bug.

```bash
npx lumpiajs@latest create-project warung-ku
```

**Langkah 2: Masuk & Install Dependencies**
Sama seperti metode sebelumnya, langkah ini hukumnya wajib ain.

```bash
cd warung-ku && npm install
```

**Langkah 3: Jalankan Server**
Gunakan `npm` untuk menjalankan script yang sudah tertanam di `package.json`.

```bash
npm run serve
```

_(Atau: `npm start`)_

---

## 🏗️ Struktur Project (Standar MVC)

LumpiaJS kini hadir dengan struktur **MVC (Model-View-Controller)** yang sudah menjadi standar industri internasional. Ini memudahkanmu jika nanti berpindah ke framework lain atau berkolaborasi dengan developer profesional.

Struktur folder yang akan kamu temui adalah sebagai berikut:

```
warung-ku/
├── app/
│   ├── controllers/ # Otak Logika (Controller)
│   └── models/      # Pengolah Data (Model)
├── routes/
│   └── web.js       # Rute URL (Jalur Akses)
├── views/           # Tampilan (.lmp)
├── package.json     # Konfigurasi NPM
└── ...
```

Berikut adalah penjelasan detail untuk setiap bagiannya:

### 1. Routes (`routes/web.js`)

File ini berfungsi sebagai "Resepsionis" yang mengatur alamat URL web kamu. Kamu mendaftarkan setiap URL yang bisa diakses di sini dan menentukan Controller mana yang akan menanganinya.

```javascript
import { Jalan } from "lumpiajs";

// Format: Jalan.gawe('url', 'NamaController@namaMethod')
Jalan.gawe("/", "HomeController@index");
Jalan.gawe("/api/products", "ProductController@index");
```

### 2. Controllers (`app/controllers`)

Ini adalah "Otak" dari aplikasimu. Di sinilah logika diproses. Setiap Controller harus meng-extend class `Controller` bawaan LumpiaJS.

```javascript
import { Controller } from "lumpiajs";

export default class HomeController extends Controller {
  index() {
    // Logika kamu di sini...
    // Tampilkan file di folder views/home.lmp
    // Parameter kedua adalah data yang dikirim ke View
    return this.tampil("home", {
      message: "Halo Dunia!",
      date: new Date().toLocaleDateString(),
    });
  }
}
```

### 3. Views (`views`)

File berekstensi `.lmp` adalah tempat kamu berkreasi dengan tampilan. Di sini kamu bisa menulis HTML, CSS, dan Javascript Client-side dalam satu file yang padu (Single File Component). Gunakan `{{ nama_variabel }}` untuk menampilkan data yang dikirim dari Controller.

```html
<lump>
  <klambi>
    /* Tulis CSS-mu di sini (Gaya Tampilan) */ h1 { color: #d35400; font-family:
    sans-serif; } .kotak { padding: 20px; border: 1px solid #ccc; }
  </klambi>

  <kulit>
    <!-- Tulis HTML-mu di sini (Kerangka) -->
    <div class="kotak">
      <h1>{{ message }}</h1>
      <p>Tanggal server saat ini: <strong>{{ date }}</strong></p>
    </div>
  </kulit>

  <isi>
    // Tulis JavaScript Client-side di sini (Interaksi) // Kamu bisa pake Bahasa
    Semarangan lho! gawe sapa() { alert("Halo, Lur! Piye kabare?"); }
  </isi>
</lump>
```

### 4. Models (`app/models`)

Model bertugas mengolah data, baik itu data dummy (statis), dari Database, atau dari API eksternal. LumpiaJS menyediakan helper bergaya Eloquent untuk memudahkan filter data.

```javascript
import { Model } from "lumpiajs";
import dataProduk from "./dummyData.js";

// Contoh penggunaan di Controller:
// Mencari produk dengan harga di bawah 5000
const hasil = Model.use(dataProduk).dimana("harga", "<", 5000).kabeh();
```

---

## 🧐 Kamus Bahasa (Transpiler)

Salah satu fitur paling unik di LumpiaJS adalah **Transpiler Bahasa Semarangan**. Kamu bisa menulis logika JavaScript di dalam tag `<isi>` menggunakan istilah-istilah di bawah ini:

| Bahasa Semarangan | JavaScript Asli | Fungsi                          |
| :---------------- | :-------------- | :------------------------------ |
| `ono`             | `let`           | Deklarasi variabel              |
| `paten`           | `const`         | Deklarasi konstanta             |
| `gawe`            | `function`      | Membuat fungsi                  |
| `yen`             | `if`            | Percabangan (jika)              |
| `liyane`          | `else`          | Percabangan (lainnya)           |
| `mandek`          | `return`        | Mengembalikan nilai             |
| `ora`             | `!`             | Negasi (bukan)                  |
| `panjang()`       | `.length`       | Menghitung panjang array/string |

---

## ⚠️ DISCLAIMER (PENTING!)

**LumpiaJS ini adalah project "Have Fun" & Eksperimen Semata.**

Kami, selaku pengembang, **TIDAK BERTANGGUNG JAWAB** atas segala bentuk kerugian yang mungkin terjadi akibat penggunaan software ini di lingkungan Production (lingkungan kerja asli), termasuk namun tidak terbatas pada:

- Kebocoran data sensitif.
- Hilangnya file penting.
- Komputer meledak (lebay sih, tapi tetap waspada ya).
- Kerugian materiil maupun immateriil lainnya.

Gunakan framework ini dengan resiko ditanggung sendiri (_Use at your own risk_). Kalau ada error fatal karena kamu nekat pakai ini buat bikin startup unicorn, jangan nyalahin kami ya! 🙏

---

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
