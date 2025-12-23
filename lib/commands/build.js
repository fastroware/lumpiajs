import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { loadConfig } from '../core/Config.js';

// Transpiler Logic (Sama kayak serve.js tapi ini permanen ke disk)
function transpileContent(content) {
    let code = content;
    // 1. Import: .lmp -> .js
    code = code.replace(/from\s+['"](.+?)\.lmp['"]/g, "from '$1.js'");
    // 2. Syntax: "->" -> "."
    code = code.split('\n').map(line => {
        if (line.trim().startsWith('//')) return line;
        return line.replace(/->/g, '.');
    }).join('\n');
    return code;
}

function processDirectory(source, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    
    const items = fs.readdirSync(source);
    items.forEach(item => {
        const srcPath = path.join(source, item);
        const destPath = path.join(dest, item);
        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            processDirectory(srcPath, destPath);
        } else {
            if (item.endsWith('.lmp')) {
                // Transpile .lmp to .js
                const content = fs.readFileSync(srcPath, 'utf8');
                const jsContent = transpileContent(content);
                const jsDest = destPath.replace('.lmp', '.js');
                fs.writeFileSync(jsDest, jsContent);
            } else if (item.endsWith('.js') || item.endsWith('.json') || item.endsWith('.css') || item.endsWith('.html')) {
                // Copy as is (but maybe transpile .js too for "->" support if mixed?)
                // For safety, let's also transpile .js files just in case user used "->" there
                if (item.endsWith('.js')) {
                     const content = fs.readFileSync(srcPath, 'utf8');
                     const jsContent = transpileContent(content);
                     fs.writeFileSync(destPath, jsContent);
                } else {
                     fs.copyFileSync(srcPath, destPath);
                }
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    });
}

const serverScript = `
import http from 'http';
import fs from 'fs';
import path from 'path';
import { routes, Jalan } from 'lumpiajs/lib/core/Router.js';
import { loadEnv } from 'lumpiajs/lib/core/Env.js';
import { loadConfig } from 'lumpiajs/lib/core/Config.js';

const root = process.cwd();
const env = loadEnv(root);
const config = loadConfig(root);

// ROUTE MATCHER (Copied from Core)
function matchRoute(definedRoute, method, pathname) {
    if (definedRoute.method !== method) return null;
    if (definedRoute.path === pathname) return { params: {} };
    const paramNames = [];
    const regexPath = definedRoute.path.replace(/\\{([a-zA-Z0-9_]+)\\}/g, (match, name) => {
        paramNames.push(name);
        return '([^/]+)';
    });
    if (regexPath === definedRoute.path) return null;
    const regex = new RegExp('^' + regexPath + '$');
    const match = pathname.match(regex);
    if (match) {
        const params = {};
        paramNames.forEach((name, index) => params[name] = match[index + 1]);
        return { params };
    }
    return null;
}

async function start() {
    // 1. Load Routes (Compiled JS)
    const routesUrl = path.join(root, 'routes', 'web.js');
    if (fs.existsSync(routesUrl)) {
        await import('file://' + routesUrl);
    } else {
         console.error("❌ Error: routes/web.js not found in build!");
    }

    // 2. Start Server
    const server = http.createServer(async (req, res) => {
        const method = req.method;
        const url = new URL(req.url, 'http://' + req.headers.host);
        const pathname = url.pathname;

        // Static Files
        const publicMap = {
            '/css/': path.join(root, 'public', 'css'),
            '/vendor/': path.join(root, 'public', 'vendor')
        };
        for (const [prefix, localPath] of Object.entries(publicMap)) {
            if (pathname.startsWith(prefix)) {
                const relativePath = pathname.slice(prefix.length);
                const filePath = path.join(localPath, relativePath);
                if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
                    const ext = path.extname(filePath);
                    const mime = ext === '.css' ? 'text/css' : (ext === '.js' ? 'text/javascript' : 'application/octet-stream');
                    res.writeHead(200, {'Content-Type': mime});
                    res.end(fs.readFileSync(filePath));
                    return;
                }
            }
        }

        // Routing
        let match = null;
        let params = {};
        for (const route of routes) {
            const result = matchRoute(route, method, pathname);
            if (result) {
                match = route;
                params = result.params;
                break;
            }
        }

        if (match) {
            try {
                const [controllerName, methodName] = match.action.split('@');
                const controllerPath = path.join(root, 'app', 'controllers', controllerName + '.js');
                if (!fs.existsSync(controllerPath)) throw new Error('Controller ' + controllerName + ' not found');
                
                const module = await import('file://' + controllerPath);
                const ControllerClass = module.default;
                const instance = new ControllerClass();
                instance.env = env;
                instance.params = params;
                instance.config = config;
                
                const result = await instance[methodName](...Object.values(params));
                 if (result.type === 'html') {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(result.content);
                } else if (result.type === 'json') {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(result.content);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end(String(result));
                }
            } catch (e) {
                console.error(e);
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.end('<h1>500 Server Error</h1>');
            }
        } else {
            res.writeHead(404);
            res.end('404 Not Found');
        }
    });

    const port = env.PORT || 3000;
    server.listen(port, () => {
        console.log('🚀 Production Server running on port ' + port);
    });
}

start();
`;

export function buildProject() {
    const root = process.cwd();
    const dist = path.join(root, 'dist');
    const config = loadConfig(root);

    console.log('🍳 Mulai Menggoreng (Building Project)...');

    // 1. Cleanup Old Dist
    if (fs.existsSync(dist)) {
        fs.rmSync(dist, { recursive: true, force: true });
    }
    fs.mkdirSync(dist);

    // 2. Build Assets (Tailwind)
    if (config.klambi === 'tailwindcss') {
        console.log('🎨 Compiling Tailwind CSS (Minified)...');
        const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        spawnSync(cmd, ['tailwindcss', '-i', './aset/css/style.css', '-o', './public/css/style.css', '--minify'], { 
            cwd: root, stdio: 'inherit', shell: true 
        });
    }

    // 3. Copy & Transpile Code
    console.log('📂 Copying & Transpiling (.lmp -> .js)...');
    processDirectory(path.join(root, 'app'), path.join(dist, 'app'));
    processDirectory(path.join(root, 'routes'), path.join(dist, 'routes'));
    processDirectory(path.join(root, 'views'), path.join(dist, 'views')); // Views .lmp usually not imported, but kept as is? OR Transpiled?
    // Wait, View.js reads raw .lmp file content. So views should strictly be copied AS IS, or renamed to .lmp but content untouched generally?
    // Actually View.js `renderLumpia` expects file path.
    // Let's COPY views folder AS IS (recursive copy), no renaming extensions usually needed for View Engine unless we change View.js to look for .html?
    // Lumpia View Engine expects `<lump>` tags. 
    // Let's just copy views folder using simple copy to ensure .lmp extension stays for view engine to find it.
    
    // RE-DO views copy: FORCE copy only
    // Overwrite the 'processDirectory' for views to be simple copy
    fs.cpSync(path.join(root, 'views'), path.join(dist, 'views'), { recursive: true });

    // 4. Copy Static Assets
    if (fs.existsSync(path.join(root, 'public'))) {
        fs.cpSync(path.join(root, 'public'), path.join(dist, 'public'), { recursive: true });
    }
    
    // 5. Configs & Env
    fs.copyFileSync(path.join(root, 'package.json'), path.join(dist, 'package.json'));
    fs.copyFileSync(path.join(root, 'config.lmp'), path.join(dist, 'config.lmp'));
    if (fs.existsSync(path.join(root, '.env'))) {
        fs.copyFileSync(path.join(root, '.env'), path.join(dist, '.env'));
    }

    // 6. Generate Standalone Server Entry
    fs.writeFileSync(path.join(dist, 'server.js'), serverScript);

    // 7. Update package.json in dist
    const pkg = JSON.parse(fs.readFileSync(path.join(dist, 'package.json'), 'utf8'));
    pkg.scripts = {
        "start": "node server.js"
    };
    // Ensure lumpiajs dependency is preserved
    fs.writeFileSync(path.join(dist, 'package.json'), JSON.stringify(pkg, null, 2));

    console.log('✅ Mateng! (Build Finished)');
    console.log('----------------------------------------------------');
    console.log('🎁 Yang harus dikirim ke Server (Production):');
    console.log('   📂 Folder: dist/');
    console.log('');
    console.log('👉 Cara Deploy:');
    console.log('   1. Upload isi folder "dist" ke server.');
    console.log('   2. Jalankan "npm install --production" di server.');
    console.log('   3. Jalankan "npm start".');
    console.log('----------------------------------------------------');
}
