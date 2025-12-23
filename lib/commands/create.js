import fs from 'fs';
import path from 'path';
import prompts from 'prompts';

const routesTemplate = `import { Jalan } from 'lumpiajs';

Jalan->get('/', 'HomeController@index');
Jalan->get('/toko', 'ProductController@tampilBarang');
`;

const controllerTemplate = `import { Controller } from 'lumpiajs';

export default class HomeController extends Controller {
    mengko index() {
        // Pake Bahasa Semarangan, Lur!
        paten pesen = 'Sugeng Rawuh di Website Statis!';
        
        // 'aku' menggantikan 'this'
        balek aku->tampil('home', { 
            message: pesen,
            info: 'Dibuat dengan LumpiaJS'
        });
    }
}
`;

const productControllerTemplate = `import { Controller } from 'lumpiajs';

export default class ProductController extends Controller {
    mengko tampilBarang() {
        // Contoh API
        ono data = [];
        
        jajal {
            paten respon = nteni fetch('https://fakestoreapi.com/products?limit=3');
            data = nteni respon.json();
            kandani('Data sukses!');
        } gagal (e) {
            kandani(e);
        }

        balek aku->tampil('product', { 
            daftar: data.map(i => '<li>' + i.title + '</li>').join('')
        });
    }
}
`;

const homeViewTemplate = `<lump>
  <klambi>
      h1 { color: #d35400; text-align: center; }
  </klambi>
  <kulit>
    <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
      <h1>{{ message }}</h1>
      <p>{{ info }}</p>
      <a href="/toko">Cek Toko Sebelah</a>
    </div>
  </kulit>
</lump>`;

const productViewTemplate = `<lump>
  <kulit>
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Daftar Barang</h1>
      <ul>{{ daftar }}</ul>
      <a href="/">Balik Omah</a>
    </div>
  </kulit>
</lump>`;

const generatePackageJson = (name, style) => {
    return JSON.stringify({ 
        name, version: "1.0.0", type: "module", 
        scripts: { "start": "lumpia kukus", "build": "lumpia goreng" },
        dependencies: { "lumpiajs": "latest" },
        devDependencies: style==='tailwindcss'?{"tailwindcss":"^3.4.0"}:{}
    }, null, 2);
};

export async function createProject(parameter) {
    let projectName = parameter;
    if (!projectName) {
        const res = await prompts({ type: 'text', name: 'val', message: 'Jeneng project?', initial: 'my-lumpia-app' });
        projectName = res.val;
    }
    if (!projectName) return;
    
    const root = path.join(process.cwd(), projectName);
    if (fs.existsSync(root)) { console.log('❌ Folder Exists'); return; }

    const styleRes = await prompts({
        type: 'select', name: 'val', message: 'Styling?',
        choices: [{title:'Vanilla',value:'none'},{title:'Tailwind',value:'tailwindcss'}],
        initial: 0
    });

    fs.mkdirSync(root);
    fs.mkdirSync(path.join(root, 'app', 'controllers'), { recursive: true });
    fs.mkdirSync(path.join(root, 'routes'));
    fs.mkdirSync(path.join(root, 'views'));
    fs.mkdirSync(path.join(root, 'aset', 'css'), { recursive: true });
    fs.mkdirSync(path.join(root, 'public', 'css'), { recursive: true });

    fs.writeFileSync(path.join(root, 'package.json'), generatePackageJson(projectName, styleRes.val));
    fs.writeFileSync(path.join(root, '.gitignore'), `.lumpia\nnode_modules\n.env\n`);
    fs.writeFileSync(path.join(root, 'config.lmp'), JSON.stringify({ klambi: styleRes.val }, null, 2));

    fs.writeFileSync(path.join(root, 'routes', 'web.lmp'), routesTemplate);
    fs.writeFileSync(path.join(root, 'app', 'controllers', 'HomeController.lmp'), controllerTemplate);
    fs.writeFileSync(path.join(root, 'app', 'controllers', 'ProductController.lmp'), productControllerTemplate);
    fs.writeFileSync(path.join(root, 'views', 'home.lmp'), homeViewTemplate);
    fs.writeFileSync(path.join(root, 'views', 'product.lmp'), productViewTemplate);
    
    if (styleRes.val === 'tailwindcss') {
        fs.writeFileSync(path.join(root, 'tailwind.config.js'), `module.exports={content:["./views/**/*.lmp"],theme:{extend:{}},plugins:[]}`);
        fs.writeFileSync(path.join(root, 'aset', 'css', 'style.css'), '@tailwind base; @tailwind components; @tailwind utilities;');
    } else {
        fs.writeFileSync(path.join(root, 'aset', 'css', 'style.css'), '/* CSS */');
    }

    console.log(`✅ Project "${projectName}" Siap!`);
    console.log('-------------------------------------------');
    console.log(`👉 cd ${projectName}`);
    console.log(`👉 npm install  <-- OJO LALI IKI! (Wajib)`);
    console.log(`👉 lumpia kukus`);
    console.log('-------------------------------------------');
}
