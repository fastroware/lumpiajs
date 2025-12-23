# 🥟 LumpiaJS

**"Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan."**

Framework Static SPA (Single Page Application) modern yang 100% Client-Side. Coding pakai bahasa sehari-hari.

---

## 🌟 Fitur Unggulan

- **🗣️ Bahasa Semarangan**: `mengko`, `nteni`, `paten`, `kandani`. Coding jadi lebih asik!
- **⚡ SPA Sat-Set**: Navigasi antar halaman instan tanpa reload browser (History API).
- **🔍 SEO Friendly**: Dukungan penuh tag `<meta>` dinamis di setiap View. Judul dan deskripsi halaman bisa berubah-ubah.
- **📦 Import Map Core**: Arsitektur modern yang menjamin file JS bisa dibaca dari folder sedalam apapun tanpa error `404`.
- **🎨 Smart Templates**: Generate project kosongan atau **Toko Online** full-stack (Fetch API DummyJSON) dengan Tailwind CSS siap pakai.

---

## 🗣️ Kamus Bahasa

| Semarangan    | JS Asli       | Arti                  |
| :------------ | :------------ | :-------------------- |
| **`aku`**     | `this`        | Diri Sendiri (Object) |
| **`fungsi`**  | `function`    | Fungsi                |
| **`paten`**   | `const`       | Konstan               |
| **`ono`**     | `let`         | Ada / Variabel        |
| **`mengko`**  | `async`       | Nanti (Async)         |
| **`nteni`**   | `await`       | Tunggu (Await)        |
| **`balek`**   | `return`      | Kembali               |
| **`kandani`** | `console.log` | Bilangi               |

_Plus fitur **Laravel Syntax**: `aku->tampil()`._

---

## 🚀 Cara Pakai

**1. Install**

```bash
npm install -g lumpiajs
```

**2. Buat Project**

```bash
lumpia create-project warung-ku
```

_Pilih template: **Kosongan** atau **Contoh Toko Online**._
_Pilih style: **Vanilla** atau **Tailwind**._

**3. Development (Kukus)**

```bash
cd warung-ku
npm install
lumpia kukus
```

Server akan jalan di `http://localhost:3000` dengan fitur Hot-Reload CSS.

**4. Build Production (Goreng)**

```bash
lumpia goreng
```

Hasil di folder `dist` adalah **Murni Static HTML/JS**.
Bisa langsung deploy ke GitHub Pages, Netlify, Vercel, atau Hosting CPanel biasa.

---

## 📝 Contoh Koding

**Controller (`Home.lmp`)**

```javascript
export default class HomeController extends Controller {
    mengko index() {
        paten pesan = 'Halo Lur!';
        balek aku->tampil('home', { msg: pesan });
    }
}
```

**View (`home.lmp`)**

```html
<lump>
  <meta>
      <title>{{ msg }} - Webku</title>
      <meta name="description" content="Ini website canggih">
  </meta>

  <kulit>
    <h1>{{ msg }}</h1>
    <a href="/produk">Lihat Produk</a>
  </kulit>

  <klambi>
    h1 { color: orange; }
  </klambi>
</lump>
```

---

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
