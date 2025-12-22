# 🥟 LumpiaJS

**Framework Web MVC dengan Kearifan Lokal Semarangan.**  
_Framework ini dibuat untuk seru-seruan (have fun), tapi diam-diam powerful seperti PHP Framework modern!_

## 🚀 Cara Mulai (Quick Start)

### 1. Buat Project Baru

Langsung gas pakai perintah ini:

```bash
npx lumpiajs create-project warung-ku
```

_(Atau pakai istilah lokal: `npx lumpiajs buka-cabang warung-ku`)_

### 2. Masuk & Install Bumbu

Masuk ke foldernya dan install dependencies (wajib, biar kodingannya gurih):

```bash
cd warung-ku
npm install
```

### 3. Dodolan (Jalankan Server)

Nyalakan server development:

```bash
npm start
```

Atau pakai perintah manual: `npx lumpia dodolan`.  
Websitemu bakal jalan di `http://localhost:3000`.

---

## 🏗️ Struktur Project (MVC)

LumpiaJS sekarang menggunakan arsitektur MVC yang rapi, mirip framework sebelah (uhuk, Laravel).

```
warung-ku/
├── app/
│   ├── kontroler/   # Otak logika (Controller)
│   └── model/       # Pengolah Data (Model)
├── jalur/
│   └── web.js       # Rute URL (Routes)
├── wajah/           # Tampilan (View .lmp)
├── package.json
└── ...
```

### 1. Jalur (Routes)

Atur URL di `jalur/web.js`:

```javascript
import { Jalan } from "lumpiajs";

Jalan.gawe("/", "BerandaKontroler@index");
Jalan.gawe("/api/produk", "ProdukKontroler@index");
```

### 2. Kontroler (Controller)

Bikin logika di `app/kontroler/BerandaKontroler.js`:

```javascript
import { Kontroler } from "lumpiajs";

export default class BerandaKontroler extends Kontroler {
  index() {
    // Render file wajah/beranda.lmp dengan data
    return this.tampil("beranda", {
      pesan: "Sugeng Rawuh, Lur!",
      tanggal: new Date().toLocaleDateString(),
    });
  }
}
```

### 3. Wajah (View)

Bikin tampilan di `wajah/beranda.lmp`.  
Gunakan `{{ variabel }}` buat nampilin data.

```html
<lump>
  <klambi> h1 { color: red; } </klambi>

  <kulit>
    <h1>{{ pesan }}</h1>
    <p>Saiki tanggal: {{ tanggal }}</p>
  </kulit>
</lump>
```

---

## 🤝 Cara Lapor Masalah

Nembe nemu bug? Atau punya ide jenius?

1. Buka link ini: [https://github.com/fastroware/lumpiajs/issues](https://github.com/fastroware/lumpiajs/issues)
2. Klik **"New Issue"**.
3. Ceritakan keluh kesahmu.

---

## ⚠️ DISCLAIMER

**LumpiaJS ini 100% project _Have Fun_.**
Gunakan dengan bijak. Kalau ada error di production, jangan nyalahin kami ya! 🙏

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
