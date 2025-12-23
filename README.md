# 🥟 LumpiaJS

**"Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan."**

Framework Static SPA 100% Client-Side. Coding pakai bahasa sehari-hari.

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

**Contoh Coding (`HomeController.lmp`):**

```javascript
export default class HomeController extends Controller {
    mengko index() {
        paten pesan = 'Halo Lur!';

        // Panggil fungsi view
        balek aku->tampil('home', { msg: pesan });
    }
}
```

---

## 🚀 Cara Pakai

**1. Install**

```bash
npm install -g lumpiajs
```

**2. Buat Project & Develop**

```bash
lumpia create-project warung-ku
cd warung-ku && npm install
lumpia kukus
```

**3. Build Static (Goreng)**

```bash
lumpia goreng
```

Upload folder `dist` kemana saja (Hosting Biasa/GitHub Pages).

---

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
