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

## 🏗️ Struktur Project (MVL - Model View Logika)

LumpiaJS nggunake istilah sing luwih "Njawani" tapi tetep MVC:

```
warung-ku/
├── app/
│   ├── logika/      # Logika Program (Controller)
│   └── belakang/    # Data & Dapur (Model)
├── jalur/
│   └── web.js       # Rute URL (Routes)
├── depan/           # Tampilan (View)
├── package.json
└── ...
```

### 1. Jalur (Routes)

Atur URL di `jalur/web.js`:

```javascript
import { Jalan } from "lumpiajs";

// Nulis rute: Jalan.gawe(url, 'NamaLogika@method')
Jalan.gawe("/", "BerandaLogika@index");
Jalan.gawe("/api/produk", "ProdukLogika@index");
```

### 2. Logika (Controller)

Bikin logika di `app/logika/BerandaLogika.js`.
Class harus extend `Logika`.

```javascript
import { Logika } from "lumpiajs";

export default class BerandaLogika extends Logika {
  index() {
    // Tampilke file ning folder 'depan/beranda.lmp'
    return this.tampil("beranda", {
      pesan: "Sugeng Rawuh, Lur!",
      tanggal: new Date().toLocaleDateString(),
    });
  }
}
```

### 3. Depan (View)

Bikin tampilan di `depan/beranda.lmp`.  
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

### 4. Belakang (Model)

Simpen data utawa logika database ning `app/belakang/Produk.js`.
Bisa nggunake `Model` ala Eloquent.

```javascript
import { Model } from "lumpiajs";
// ... logika model ...
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
