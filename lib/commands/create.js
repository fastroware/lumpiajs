import fs from 'fs';
import path from 'path';

// --- TEMPLATES ---
const routesTemplate = `import { Jalan } from 'lumpiajs';

// Define Routes
Jalan.gawe('/', 'HomeController@index');
Jalan.gawe('/profile', 'HomeController@profile');
Jalan.gawe('/api/products', 'ProductController@index');
`;

const controllerTemplate = `import { Controller } from 'lumpiajs';

export default class HomeController extends Controller {
    index() {
        // Tampilkan halaman home
        // this.env bisa diakses di sini
        return this.tampil('home', { 
            message: 'Welcome to LumpiaJS MVC!',
            author: 'Pakdhe Koding',
            env: this.env.APP_ENV
        });
    }

    profile() {
        return this.tampil('profile', { name: 'Loyal User' });
    }
}
`;

const modelTemplate = `// Example dummy data
const productData = [
    { id: 1, name: 'Lumpia Basah', price: 5000 },
    { id: 2, name: 'Lumpia Goreng', price: 6000 },
    { id: 3, name: 'Tahu Gimbal', price: 12000 }
];

export default productData;
`;

const productControllerTemplate = `import { Controller, Model } from 'lumpiajs';
import ProductData from '../../app/models/Product.js';

export default class ProductController extends Controller {
    index() {
        const result = Model.use(ProductData)
                        .dimana('price', '>', 5500)
                        .jupuk();

        return this.json({
            status: 'success',
            data: result,
            debug_mode: this.env.APP_DEBUG
        });
    }
}
`;

const viewHomeTemplate = `<lump>
  <klambi>
    h1 { color: #d35400; text-align: center; }
    .box { border: 1px solid #ddd; padding: 20px; text-align: center; margin-top: 20px; }
    .badge { background: #eee; padding: 5px; border-radius: 4px; font-size: 12px; }
  </klambi>

  <kulit>
    <h1>{{ message }}</h1>
    <div class="box">
        <span class="badge">Environment: {{ env }}</span>
        <p>Created with love by: <strong>{{ author }}</strong></p>
        <button onclick="checkPrice()">Check Price API</button>
        <br><br>
        <a href="/profile">Go to Profile</a>
    </div>
  </kulit>

  <isi>
    gawe checkPrice() {
       fetch('/api/products')
         .then(res => res.json())
         .then(data => {
            alert('Data from API: ' + JSON.stringify(data));
         });
    }
  </isi>
</lump>`;

const viewProfileTemplate = `<lump>
  <kulit>
    <h1>User Profile</h1>
    <p>Hello, <strong>{{ name }}</strong>!</p>
    <a href="/">Back Home</a>
  </kulit>
</lump>`;

const packageJsonTemplate = (name) => `{
  "name": "${name}",
  "version": "1.0.0",
  "main": "routes/web.js",
  "type": "module",
  "scripts": {
    "start": "lumpia kukus",
    "serve": "lumpia kukus"
  },
  "dependencies": {
    "lumpiajs": "latest"
  }
}
`;

const envTemplate = `
BASE_URL="http://localhost:3000"
APP_ENV="local"        
# Pilihan: 'local', 'development', 'production'
APP_DEBUG="true"
# Pilihan: 'true', 'false'
`;

export function createProject(parameter) {
    const projectName = parameter;
    if (!projectName) {
        console.log('❌ Please specify project name.');
        console.log('Example: lumpia create-project my-app');
        return;
    }

    const root = path.join(process.cwd(), projectName);
    if (fs.existsSync(root)) return console.log(`❌ Folder ${projectName} already exists.`);

    console.log(`🔨 Building MVC foundation in ${projectName}...`);
    
    fs.mkdirSync(root);
    
    fs.mkdirSync(path.join(root, 'app', 'controllers'), { recursive: true });
    fs.mkdirSync(path.join(root, 'app', 'models'), { recursive: true });
    fs.mkdirSync(path.join(root, 'routes'));
    fs.mkdirSync(path.join(root, 'views')); 

    // Write files
    fs.writeFileSync(path.join(root, 'package.json'), packageJsonTemplate(projectName));
    fs.writeFileSync(path.join(root, '.env'), envTemplate); // Create .env
    fs.writeFileSync(path.join(root, 'routes', 'web.js'), routesTemplate);
    fs.writeFileSync(path.join(root, 'app', 'controllers', 'HomeController.js'), controllerTemplate);
    fs.writeFileSync(path.join(root, 'app', 'controllers', 'ProductController.js'), productControllerTemplate);
    fs.writeFileSync(path.join(root, 'app', 'models', 'Product.js'), modelTemplate);
    fs.writeFileSync(path.join(root, 'views', 'home.lmp'), viewHomeTemplate);
    fs.writeFileSync(path.join(root, 'views', 'profile.lmp'), viewProfileTemplate);

    console.log('✅ Project ready! Standard MVC Structure with .env Support.');
    console.log('----------------------------------------------------');
    console.log(`cd ${projectName}`);
    console.log('npm install');
    console.log('lumpia kukus');
    console.log('----------------------------------------------------');
}
