import fs from 'fs';
import path from 'path';

// --- TEMPLATES ---
const routesTemplate = `import { Jalan } from 'lumpiajs';

// Definisi Jalur (Routes)
Jalan.gawe('/', 'BerandaKontroler@index');
Jalan.gawe('/profil', 'BerandaKontroler@profil');
Jalan.gawe('/api/produk', 'ProdukKontroler@index');
`;

const controllerTemplate = `import { Kontroler, Model } from 'lumpiajs';

export default class BerandaKontroler extends Kontroler {
    index() {
        // Kirim data ke view
        return this.tampil('beranda', { 
            pesan: 'Sugeng Rawuh di LumpiaJS MVC!',
            penulis: 'Pakdhe Koding'
        });
    }

    profil() {
        return this.tampil('profil', { nama: 'User Setia' });
    }
}
`;

const modelTemplate = `// Contoh dummy data (bisa ganti fetch API atau baca DB)
const dataProduk = [
    { id: 1, jeneng: 'Lumpia Basah', rego: 5000 },
    { id: 2, jeneng: 'Lumpia Goreng', rego: 6000 },
    { id: 3, jeneng: 'Tahu Gimbal', rego: 12000 }
];

export default dataProduk;
`;

const produkControllerTemplate = `import { Kontroler, Model } from 'lumpiajs';
import DataProduk from '../model/Produk.js';

export default class ProdukKontroler extends Kontroler {
    index() {
        // Eloquent-style: Model.use(data).dimana(...).jupuk()
        const asil = Model.use(DataProduk)
                        .dimana('rego', '>', 5500)
                        .jupuk();

        return this.json({
            status: 'sukses',
            data: asil
        });
    }
}
`;

const viewBerandaTemplate = `<lump>
  <klambi>
    h1 { color: #d35400; text-align: center; }
    .box { border: 1px solid #ddd; padding: 20px; text-align: center; margin-top: 20px; }
  </klambi>

  <kulit>
    <h1>{{ pesan }}</h1>
    <div class="box">
        <p>Digawe karo tresno dening: <strong>{{ penulis }}</strong></p>
        <button onclick="cekrego()">Cek Harga API</button>
        <br><br>
        <a href="/profil">Menyang Profil</a>
    </div>
  </kulit>

  <isi>
    gawe cekrego() {
       fetch('/api/produk')
         .then(res => res.json())
         .then(data => {
            alert('Data seko API: ' + JSON.stringify(data));
         });
    }
  </isi>
</lump>`;

const viewProfilTemplate = `<lump>
  <kulit>
    <h1>Profil Pengguna</h1>
    <p>Halo, <strong>{{ nama }}</strong>!</p>
    <a href="/">Bali Mulih</a>
  </kulit>
</lump>`;

const packageJsonTemplate = (name) => `{
  "name": "${name}",
  "version": "1.0.0",
  "main": "jalur/web.js",
  "type": "module",
  "scripts": {
    "start": "lumpia dodolan",
    "serve": "lumpia dodolan",
    "goreng": "lumpia goreng"
  },
  "dependencies": {
    "lumpiajs": "latest"
  }
}
`;

export function createProject(parameter) {
    const namaProject = parameter;
    if (!namaProject) {
        console.log('❌ Eh, jeneng project-e opo?');
        console.log('Contoh: lumpia create-project warung-baru');
        return;
    }

    const root = path.join(process.cwd(), namaProject);
    if (fs.existsSync(root)) return console.log(`❌ Folder ${namaProject} wis ono. Ganti jeneng liyo.`);

    console.log(`🔨 Mbangun pondasi warung MVC ing ${namaProject}...`);
    
    fs.mkdirSync(root);
    fs.mkdirSync(path.join(root, 'app', 'kontroler'), { recursive: true });
    fs.mkdirSync(path.join(root, 'app', 'model'), { recursive: true });
    fs.mkdirSync(path.join(root, 'jalur'));
    fs.mkdirSync(path.join(root, 'wajah'));

    // Write files
    fs.writeFileSync(path.join(root, 'package.json'), packageJsonTemplate(namaProject));
    fs.writeFileSync(path.join(root, 'jalur', 'web.js'), routesTemplate);
    fs.writeFileSync(path.join(root, 'app', 'kontroler', 'BerandaKontroler.js'), controllerTemplate);
    fs.writeFileSync(path.join(root, 'app', 'kontroler', 'ProdukKontroler.js'), produkControllerTemplate);
    fs.writeFileSync(path.join(root, 'app', 'model', 'Produk.js'), modelTemplate);
    fs.writeFileSync(path.join(root, 'wajah', 'beranda.lmp'), viewBerandaTemplate);
    fs.writeFileSync(path.join(root, 'wajah', 'profil.lmp'), viewProfilTemplate);

    console.log('✅ Warung siap! Struktur MVC wis ketata rapi.');
    console.log('----------------------------------------------------');
    console.log(`cd ${namaProject}`);
    console.log('npm install     <-- (Wajib ben lumpiajs ke-install)');
    console.log('npm run serve   <-- (Kanggo dodolan/start server)');
    console.log('----------------------------------------------------');
}
