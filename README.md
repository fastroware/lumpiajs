# 🥟 LumpiaJS

**"Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan."**

Framework JavaScript rasa lokal yang didesain untuk **Static SPA (Single Page Application)**.
Hasil build 100% Static (HTML+JS), bisa dideploy di hosting apa saja.

---

## �️ Kamus Bahasa (Syntax Semarangan)

Di LumpiaJS, coding jadi lebih santai dengan kosakata lokal:

| Semarangan    | JavaScript Asli | Arti                 |
| :------------ | :-------------- | :------------------- |
| **`paten`**   | `const`         | Tetap / Konstan      |
| **`ono`**     | `let`           | Ada / Variabel       |
| **`gawe`**    | `function`      | Membuat Fungsi       |
| **`mengko`**  | `async`         | Nanti (Asynchronous) |
| **`nteni`**   | `await`         | Tunggu (Await)       |
| **`balek`**   | `return`        | Kembali              |
| **`yen`**     | `if`            | Jika                 |
| **`liyane`**  | `else`          | Lainnya              |
| **`jajal`**   | `try`           | Coba                 |
| **`gagal`**   | `catch`         | Gagal / Error        |
| **`kandani`** | `console.log`   | Bilangi / Log        |

_Plus fitur **Laravel Syntax**: `this->tampil()` (pengganti titik)._

**Contoh Coding:**

```javascript
export default class ProductController extends Controller {
    mengko index() {
        paten url = 'https://api.toko.com/produk';

        jajal {
            ono data = nteni fetch(url);
            kandani('Data sukses diambil');
        } gagal (e) {
            kandani('Waduh error: ' + e);
        }

        balek this->tampil('produk', { list: data });
    }
}
```

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

**3. Development**

```bash
cd warung-ku
npm install
lumpia kukus
```

**4. Build (Goreng)**

```bash
lumpia goreng
```

Hasil di folder `dist` adalah **Static Site**. Upload kemanapun (Hosting/GitHub Pages).

---

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
