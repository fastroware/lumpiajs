import fs from 'fs';
import path from 'path';
import prompts from 'prompts';

const routesTemplate = `import { Jalan } from 'lumpiajs';

// Pakai gaya Laravel (->) enak to?
Jalan->get('/', 'HomeController@index');
Jalan->get('/db-test', 'HomeController@testDb');
Jalan->get('/profile', 'HomeController@profile');
Jalan->get('/api/products', 'ProductController@index');
`;

const controllerTemplate = `import { Controller, DB } from 'lumpiajs';

export default class HomeController extends Controller {
    index() {
        // "this.tampil" juga bisa ditulis "this->tampil"
        // Transpiler LumpiaJS sing ngatur, Bos!
        return this->tampil('home', { 
            message: 'Welcome to LumpiaJS MVC!',
            author: 'Pakdhe Koding',
            env: this.env.APP_ENV
        });
    }

    async testDb() {
        try {
            // CONTOH QUERY ALA LARAVEL
            // Pake tanda panah -> biar mantap
            const result = await DB.table('users')
                                   ->limit(1)
                                   ->get();
            
            // Raw Query
            const raw = await DB->query('SELECT 1 + 1 AS solution');
            
            return this->json({
                status: 'Connected!',
                sample_user: result,
                math_check: raw[0].solution
            });
        } catch (e) {
            return this->json({ error: e.message });
        }
    }

    profile() {
        return this->tampil('profile', { name: 'Loyal User' });
    }
}
`;

const modelTemplate = `// Example dummy data (Static)
const productData = [
    { id: 1, name: 'Lumpia Basah', price: 5000 },
    { id: 2, name: 'Lumpia Goreng', price: 6000 }
];
export default productData;
`;

const productControllerTemplate = `import { Controller, Model } from 'lumpiajs';
import ProductData from '../../app/models/Product.lmp'; 

export default class ProductController extends Controller {
    index() {
        // Model Static juga bisa pakai ->
        const result = Model->use(ProductData)
                        ->dimana('price', '>', 5500)
                        ->jupuk();

        return this->json({ status: 'success', data: result });
    }
}
`;

const viewProfileTemplate = `<lump>
  <kulit>
    <div class="container mt-5">
        <h1>User Profile</h1>
        <p>Hello, <strong>{{ name }}</strong>!</p>
        <a href="/" class="btn btn-secondary">Back Home</a>
    </div>
  </kulit>
</lump>`;

const envTemplate = `
BASE_URL="http://localhost:3000"
APP_ENV="local"        
APP_DEBUG="true"

# Database Config
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="lumpia_db"
`;

// Helper for CSS/View generation (Collapsed for brevity but functional as before)
const tailwindConfigTemplate = `/** @type {import('tailwindcss').Config} */
module.exports = { content: ["./views/**/*.{html,js,lmp}"], theme: { extend: {}, }, plugins: [], }`;
const mainCssTemplate = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;

const generateHomeView = (style) => {
    let css = '', html = '';
    if (style === 'bootstrap') {
        html = `
    <div class="container mt-5">
        <div class="card shadow">
            <div class="card-body text-center">
                <h1 class="text-primary">{{ message }}</h1>
                <span class="badge bg-secondary mb-3">Env: {{ env }}</span>
                <p>Created by: <strong>{{ author }}</strong></p>
                <div class="mt-4">
                    <a href="/db-test" class="btn btn-warning">Test DB (Laravel Style)</a>
                    <a href="/profile" class="btn btn-link">Go to Profile</a>
                </div>
            </div>
        </div>
    </div>`;
    } else if (style === 'tailwindcss') {
        html = `
    <div class="container mx-auto mt-10 p-5">
        <div class="bg-white shadow-lg rounded-lg p-8 text-center border border-gray-200">
            <h1 class="text-4xl font-bold text-orange-600 mb-4">{{ message }}</h1>
            <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mb-4">Env: {{ env }}</span>
            <div class="mt-6 space-x-4">
                <a href="/db-test" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Test DB</a>
                <a href="/profile" class="text-blue-500 hover:text-blue-800">Go to Profile</a>
            </div>
        </div>
    </div>`;
    } else {
        css = `h1{text-align:center} .box{text-align:center;margin-top:20px}`;
        html = `<div class="box"><h1>{{ message }}</h1><p>Env: {{ env }}</p><a href="/db-test">Test DB</a> | <a href="/profile">Profile</a><br>(Check Controller for Laravel Syntax Demo)</div>`;
    }
    return `<lump><klambi>${css}</klambi><kulit>${html}</kulit><isi></isi></lump>`;
};

const generatePackageJson = (name, style) => {
    const scripts = { "start": "lumpia kukus", "serve": "lumpia kukus" };
    const dependencies = { "lumpiajs": "latest" };
    const devDependencies = {};
    if (style === 'tailwindcss') {
        devDependencies["tailwindcss"] = "^3.4.0";
        devDependencies["postcss"] = "^8.4.0";
        devDependencies["autoprefixer"] = "^10.4.0";
    } else if (style === 'bootstrap') dependencies["bootstrap"] = "^5.3.0";
    return JSON.stringify({ name, version: "1.0.0", main: "routes/web.lmp", type: "module", scripts, dependencies, devDependencies }, null, 2);
};

export async function createProject(parameter) {
    let projectName = parameter;
    if (!projectName) {
        const res = await prompts({ type: 'text', name: 'val', message: 'Jeneng project?', initial: 'my-app' });
        projectName = res.val;
    }
    if (!projectName) return;
    
    const root = path.join(process.cwd(), projectName);
    if (fs.existsSync(root)) { console.log('❌ Folder Exists'); return; }

    const styleRes = await prompts({
        type: 'select', name: 'val', message: 'Styling?',
        choices: [{title:'Vanilla',value:'none'},{title:'Tailwind',value:'tailwindcss'},{title:'Bootstrap',value:'bootstrap'}],
        initial: 0
    });
    const style = styleRes.val;
    if (!style) return;

    // Structure
    fs.mkdirSync(root);
    fs.mkdirSync(path.join(root, 'app', 'controllers'), { recursive: true });
    fs.mkdirSync(path.join(root, 'app', 'models'), { recursive: true });
    fs.mkdirSync(path.join(root, 'routes'));
    fs.mkdirSync(path.join(root, 'views'));
    fs.mkdirSync(path.join(root, 'aset', 'css'), { recursive: true });
    fs.mkdirSync(path.join(root, 'public', 'css'), { recursive: true });

    // Files
    fs.writeFileSync(path.join(root, 'package.json'), generatePackageJson(projectName, style));
    fs.writeFileSync(path.join(root, '.gitignore'), `.lumpia\nnode_modules\n.env\n`);
    fs.writeFileSync(path.join(root, '.env'), envTemplate);
    fs.writeFileSync(path.join(root, 'config.lmp'), JSON.stringify({ klambi: style }, null, 2));

    fs.writeFileSync(path.join(root, 'routes', 'web.lmp'), routesTemplate);
    fs.writeFileSync(path.join(root, 'app', 'controllers', 'HomeController.lmp'), controllerTemplate);
    fs.writeFileSync(path.join(root, 'app', 'controllers', 'ProductController.lmp'), productControllerTemplate);
    fs.writeFileSync(path.join(root, 'app', 'models', 'Product.lmp'), modelTemplate);
    fs.writeFileSync(path.join(root, 'views', 'home.lmp'), generateHomeView(style));
    fs.writeFileSync(path.join(root, 'views', 'profile.lmp'), viewProfileTemplate);
    
    // Style Assets
    if (style === 'tailwindcss') {
        fs.writeFileSync(path.join(root, 'tailwind.config.js'), tailwindConfigTemplate);
        fs.writeFileSync(path.join(root, 'aset', 'css', 'style.css'), mainCssTemplate);
    } else {
        fs.writeFileSync(path.join(root, 'aset', 'css', 'style.css'), style === 'bootstrap' ? '/* Bootstrap Imported in HTML */' : '/* CSS */');
    }

    console.log(`✅ Project "${projectName}" Ready!`);
    console.log(`cd ${projectName} && npm install && lumpia kukus`);
}
