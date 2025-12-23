# 🥟 LumpiaJS

**Bahasa Pemrograman Web dengan Kearifan Lokal Semarangan.**

---

## 🦄 Fitur Unik: Laravel Syntax di JavaScript!

Ini gila sih. Kamu bisa pakai sintaks panah `->` ala PHP/Laravel di dalam file JavaScript (`.lmp`).

**Contoh Query Database:**

```javascript
// Gak perlu pakai titik (.) lagi, pakai panah (->) biar feel-nya dapet!
const users = await DB.table('users')
                      ->where('active', 1)
                      ->limit(10)
                      ->get();
```

**Contoh Routing:**

```javascript
Jalan->get('/', 'HomeController@index');
Jalan->post('/simpan', 'HomeController@store');
```

**Kenapa bisa gitu?**  
Karena LumpiaJS punya _Transpiler_ canggih yang merubah `->` menjadi `.` secara otomatis sebelum dijalankan. Jadi coding JS rasanya kayak coding PHP Modern. Uhuk!

---

## 🗄️ Database (MySQL)

**Setting `.env`:**

```env
DB_HOST="localhost"
DB_USER="root"
DB_NAME="lumpia_db"
```

**Cara Pakai:**

```javascript
import { Controller, DB } from 'lumpiajs';

export default class UserController extends Controller {
    async index() {
        return this->json({
            message: 'Halo User',
            data: await DB.table('users')->get()
        });
    }
}
```

---

## 🚀 Deployment (Cara Upload)

**Syarat:** Node.js Server.
**Upload:** Semua folder KECUALI `node_modules`.
**Install:** `npm install --production`
**Run:** `npm start`

---

_Dibuat dengan ❤️ dan 🥟 dari Semarang._
