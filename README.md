# 🥟 LumpiaJS

**Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan.**

---

## 🦄 Fitur Unik: Laravel Syntax di JavaScript! (`->`)

```javascript
// Valid di LumpiaJS (.lmp)
const users = await DB.table('users')->where('active', 1)->get();
Jalan->get('/', 'HomeController@index');
```

---

## 🏗️ Cara Deploy ke Production (Server Asli)

Ini yang sering ditanyain: **"Mas, file mana yang harus saya upload ke hosting?"**

Tenang, LumpiaJS punya fitur **Goreng** (Build) biar kamu nggak bingung.

### 1. Goreng Project (Build)

Jalankan perintah ini di komputermu:

```bash
lumpia goreng
```

_(Atau: `lumpia build`)_

Sistem akan memasak projectmu:

- Mentranspile sintaks `->` menjadi JS standard.
- Mengkompilasi CSS (minify Tailwind/Bootstrap).
- Menyiapkan folder `dist` yang siap saji.

### 2. Upload ke Server

Setelah digoreng, akan muncul folder **`dist`**.

👉 **HANYA ISI FOLDER `dist`** inilah yang perlu kamu upload ke server.
(Isinya: `server.js`, `package.json`, `.env`, folder `app`, `routes`, `views`, `public`)

### 3. Install & Start di Server

Di panel hosting (Terminal/SSH) atau VPS:

```bash
# Masuk ke folder yang barusan diupload
cd /path/to/your/app

# Install dependencies (LumpiaJS core, mysql driver, dll)
npm install --production

# Jalankan Aplikasi
npm start
```

---

## 🗄️ Database

Database (MySQL) itu **SERVICE**, bukan file. Jadi:

1.  Export database dari localhost (phpMyAdmin -> Export .sql).
2.  Import file .sql itu ke database di server production kamu.
3.  Edit file `.env` yang sudah diupload, sesuaikan `DB_HOST`, `DB_USER`, `DB_PASSWORD` dengan credential server.

---

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
