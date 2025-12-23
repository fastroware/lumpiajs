
import fs from 'fs';
import path from 'path';
import prompts from 'prompts';

// --- TEMPLATES ---
const routesTemplateSimple = `import { Jalan } from 'lumpiajs';

Jalan.get('/', 'HomeController@index');
`;

const controllerSimple = `import { Controller } from 'lumpiajs';

export default class HomeController extends Controller {
    mengko index() {
        balek aku->tampil('home', { msg: 'Halo Semarangan!' });
    }
}
`;

const viewSimple = `<lump>
  <meta>
      <title>LumpiaJS Home</title>
      <meta name="description" content="Simple App">
  </meta>
  <kulit>
    <div class="center">
      <h1>{{ msg }}</h1>
    </div>
  </kulit>
  <klambi>
      .center { text-align: center; margin-top: 50px; }
  </klambi>
</lump>`;

// --- EXAMPLE PROJECT TEMPLATES ---
const routesExample = `import { Jalan } from 'lumpiajs';

Jalan.get('/', 'HomeController@index');
Jalan.get('/products', 'ProductController@index');
Jalan.get('/product/{id}', 'ProductController@detail');
`;

const homeControllerExample = `import { Controller } from 'lumpiajs';

export default class HomeController extends Controller {
    mengko index() {
        balek aku->tampil('home', { title: 'Dashboard' });
    }
}
`;

const productControllerExample = `import { Controller } from 'lumpiajs';

export default class ProductController extends Controller {
    mengko index() {
        paten url = 'https://dummyjson.com/products?limit=8';
        ono listHtml = '<p>Loading...</p>';
        
        jajal {
            paten res = nteni fetch(url);
            paten data = nteni res.json();
            
            listHtml = data.products.map(p => \`
                <div class="card">
                    <img src="\${p.thumbnail}" alt="\${p.title}">
                    <div class="card-body">
                        <h3>\${p.title}</h3>
                        <p>$\${p.price}</p>
                        <a href="/product/\${p.id}" class="btn">Detail</a>
                    </div>
                </div>
            \`).join('');
            
        } gagal (e) {
            listHtml = '<p class="error">Gagal njupuk data: ' + e + '</p>';
        }

        balek aku->tampil('product_list', { list: listHtml });
    }

    mengko detail(id) {
         paten url = 'https://dummyjson.com/products/' + id;
         ono detailHtml = '';
         
         jajal {
            paten res = nteni fetch(url);
            paten p = nteni res.json();
            
            detailHtml = \`
                <div class="detail-container">
                    <img src="\${p.thumbnail}" class="big-img">
                    <div class="info">
                        <h1>\${p.title}</h1>
                        <p class="desc">\${p.description}</p>
                        <h2 class="price">$\${p.price}</h2>
                        <button class="btn-buy">Tuku Saiki</button>
                    </div>
                </div>
            \`;
         } gagal (e) {
             detailHtml = 'Error';
         }

         balek aku->tampil('product_detail', { content: detailHtml, namaproduk: 'Detail Produk' });
    }
}
`;

// VIEWS FOR EXAMPLE (WITH META & STYLE)
const homeViewExampleTailwind = `<lump>
  <meta>
    <title>{{ title }} - Toko Lumpia</title>
  </meta>
  <kulit>
    <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold text-orange-600 mb-4">Warung LumpiaJS</h1>
      <p class="text-gray-600 mb-8">Contoh Aplikasi Fetch Data DummyJSON</p>
      <div class="space-x-4">
        <a href="/products" class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Lihat Produk</a>
        <a href="https://lumpiajs.com" class="px-6 py-3 bg-white text-orange-500 border border-orange-500 rounded-lg">Dokumentasi</a>
      </div>
    </div>
  </kulit>
</lump>`;

const prodListViewExampleTailwind = `<lump>
  <meta>
      <title>Katalok Produk</title>
  </meta>
  <kulit>
    <div class="p-8 max-w-6xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Daftar Produk Terbaru</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {{ list }}
        </div>
        <div class="mt-8 text-center">
            <a href="/" class="text-blue-500 hover:underline">&larr; Balik Home</a>
        </div>
    </div>
  </kulit>
  <klambi>
      /* Custom overrides if needed, but Tailwind mostly used */
      .card { @apply bg-white shadow rounded-lg overflow-hidden flex flex-col; }
      .card img { @apply h-48 w-full object-cover; }
      .card-body { @apply p-4 flex-1 flex flex-col; }
      .card-body h3 { @apply font-semibold text-lg mb-2 truncate; }
      .card-body p { @apply text-green-600 font-bold mb-4; }
      .btn { @apply mt-auto block text-center bg-gray-800 text-white py-2 rounded hover:bg-gray-700; }
  </klambi>
</lump>`;

const prodDetailViewExampleTailwind = `<lump>
    <meta>
        <title>{{ namaproduk }}</title>
    </meta>
    <kulit>
        <div class="p-8">
            <a href="/products" class="mb-4 inline-block text-gray-500">&larr; Kembali</a>
            {{ content }}
        </div>
    </kulit>
    <klambi>
         .detail-container { @apply flex flex-col md:flex-row gap-8 bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto; }
         .big-img { @apply w-full md:w-1/2 rounded-lg object-cover; }
         .info { @apply flex-1; }
         .desc { @apply text-gray-600 my-4; }
         .price { @apply text-3xl font-bold text-green-600 mb-6; }
         .btn-buy { @apply bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 w-full md:w-auto; }
    </klambi>
</lump>`;


const homeViewExampleVanilla = `<lump>
  <meta>
    <title>{{ title }}</title>
  </meta>
  <kulit>
    <div class="hero">
      <h1>Warung LumpiaJS</h1>
      <p>Vanilla CSS Version</p>
      <a href="/products" class="btn">Browse Products</a>
    </div>
  </kulit>
  <klambi>
    .hero { text-align: center; padding: 100px 20px; background: #f9f9f9; }
    h1 { color: #d35400; font-size: 3rem; }
    .btn { display: inline-block; background: #d35400; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </klambi>
</lump>`;

const prodListViewExampleVanilla = `<lump>
  <meta>
      <title>Katalog</title>
  </meta>
  <kulit>
    <div class="container">
        <h1>Produk</h1>
        <div class="grid">
            {{ list }}
        </div>
    </div>
  </kulit>
  <klambi>
    .container { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
    .card img { width: 100%; height: 150px; object-fit: cover; }
    .card-body { padding: 15px; flex: 1; display: flex; flex-direction: column; }
    .card h3 { margin: 0 0 10px; font-size: 1.1rem; }
    .btn { margin-top: auto; background: #333; color: white; text-align: center; padding: 8px; text-decoration: none; border-radius: 4px; }
  </klambi>
</lump>`;

const prodDetailViewExampleVanilla = `<lump>
    <meta>
        <title>{{ namaproduk }}</title>
    </meta>
    <kulit>
        <div class="container">
             <a href="/products" style="display:block; margin-bottom: 20px;">&larr; Back</a>
             {{ content }}
        </div>
    </kulit>
    <klambi>
        .container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
        .detail-container { display: flex; gap: 40px; }
        .big-img { width: 50%; border-radius: 10px; }
        .info { width: 50%; }
        .price { color: green; font-size: 2rem; margin: 20px 0; }
        .btn-buy { background: orangered; color: white; border: none; padding: 15px 30px; font-size: 1.2rem; cursor: pointer; border-radius: 5px; }
    </klambi>
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
        const res = await prompts({ type: 'text', name: 'val', message: 'Jeneng project?', initial: 'wshop' });
        projectName = res.val;
    }
    if (!projectName) return;
    
    const root = path.join(process.cwd(), projectName);
    if (fs.existsSync(root)) { console.log('❌ Folder Exists'); return; }

    // PROMPTS
    const typeRes = await prompts({
        type: 'select', name: 'val', message: 'Tipe Project?',
        choices: [
            {title:'Kosongan (Skeleton)', value:'empty'},
            {title:'Contoh Toko Online (DummyJSON)', value:'example'}
        ],
        initial: 1
    });
    
    const styleRes = await prompts({
        type: 'select', name: 'val', message: 'Styling Framework?',
        choices: [{title:'Vanilla CSS',value:'none'},{title:'Tailwind CSS',value:'tailwindcss'}],
        initial: 1
    });

    const isExample = typeRes.val === 'example';
    const isTailwind = styleRes.val === 'tailwindcss';

    // SCAFFOLD
    fs.mkdirSync(root);
    fs.mkdirSync(path.join(root, 'app', 'controllers'), { recursive: true });
    fs.mkdirSync(path.join(root, 'routes'));
    fs.mkdirSync(path.join(root, 'views'));
    fs.mkdirSync(path.join(root, 'aset', 'css'), { recursive: true });
    fs.mkdirSync(path.join(root, 'public', 'css'), { recursive: true });

    fs.writeFileSync(path.join(root, 'package.json'), generatePackageJson(projectName, styleRes.val));
    fs.writeFileSync(path.join(root, '.gitignore'), `.lumpia\nnode_modules\n.env\ndist\n`);
    fs.writeFileSync(path.join(root, 'config.lmp'), JSON.stringify({ klambi: styleRes.val }, null, 2));

    if (styleRes.val === 'tailwindcss') {
        fs.writeFileSync(path.join(root, 'tailwind.config.js'), `module.exports={content:["./views/**/*.lmp"],theme:{extend:{}},plugins:[]}`);
        fs.writeFileSync(path.join(root, 'aset', 'css', 'style.css'), '@tailwind base; @tailwind components; @tailwind utilities;');
    } else {
        fs.writeFileSync(path.join(root, 'aset', 'css', 'style.css'), '/* Main CSS */ body { margin:0; }');
    }

    // CONTENT GENERATION
    if (!isExample) {
        // EMPTY TEMPLATE
        fs.writeFileSync(path.join(root, 'routes', 'web.lmp'), routesTemplateSimple);
        fs.writeFileSync(path.join(root, 'app', 'controllers', 'HomeController.lmp'), controllerSimple);
        fs.writeFileSync(path.join(root, 'views', 'home.lmp'), viewSimple);
    } else {
        // COMPLEX EXAMPLE
        fs.writeFileSync(path.join(root, 'routes', 'web.lmp'), routesExample);
        fs.writeFileSync(path.join(root, 'app', 'controllers', 'HomeController.lmp'), homeControllerExample);
        fs.writeFileSync(path.join(root, 'app', 'controllers', 'ProductController.lmp'), productControllerExample);
        
        if (isTailwind) {
            fs.writeFileSync(path.join(root, 'views', 'home.lmp'), homeViewExampleTailwind);
            fs.writeFileSync(path.join(root, 'views', 'product_list.lmp'), prodListViewExampleTailwind);
            fs.writeFileSync(path.join(root, 'views', 'product_detail.lmp'), prodDetailViewExampleTailwind);
        } else {
            fs.writeFileSync(path.join(root, 'views', 'home.lmp'), homeViewExampleVanilla);
            fs.writeFileSync(path.join(root, 'views', 'product_list.lmp'), prodListViewExampleVanilla);
            fs.writeFileSync(path.join(root, 'views', 'product_detail.lmp'), prodDetailViewExampleVanilla);
        }
    }

    console.log(`✅ Project "${projectName}" Siap!`);
    console.log('-------------------------------------------');
    console.log(`👉 cd ${projectName}`);
    console.log(`👉 npm install`);
    console.log(`👉 lumpia kukus`);
    console.log('-------------------------------------------');
}
