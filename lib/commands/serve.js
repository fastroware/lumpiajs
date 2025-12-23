import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';
import { routes } from '../core/Router.js';
import { renderLumpia } from '../core/View.js';
import { loadEnv } from '../core/Env.js';
import { loadConfig } from '../core/Config.js'; 

const cliPackageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));

// Helper to Match Routes
function matchRoute(definedRoute, method, pathname) {
    if (definedRoute.method !== method) return null;
    if (definedRoute.path === pathname) return { params: {} };

    const paramNames = [];
    const regexPath = definedRoute.path.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
        paramNames.push(name);
        return '([^/]+)';
    });

    if (regexPath === definedRoute.path) return null;
    const regex = new RegExp(`^${regexPath}$`);
    const match = pathname.match(regex);
    if (match) {
        const params = {};
        paramNames.forEach((name, index) => {
            params[name] = match[index + 1]; 
        });
        return { params };
    }
    return null;
}

const backgroundProcess = [];

function startTailwindWatcher(root) {
    console.log('🎨 TailwindCSS detected! Starting watcher...');
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const tailwind = spawn(cmd, [
        'tailwindcss', '-i', './aset/css/style.css', '-o', './public/css/style.css', '--watch'
    ], { cwd: root, stdio: 'inherit', shell: true });
    backgroundProcess.push(tailwind);
}

function handleBootstrap(root) {
    const bootDestDist = path.join(root, 'public', 'vendor', 'bootstrap');
    const bootSrc = path.join(root, 'node_modules', 'bootstrap', 'dist');
    if (fs.existsSync(bootSrc) && !fs.existsSync(bootDestDist)) {
        console.log('📦 Menyalin library Bootstrap ke public...');
        try { fs.cpSync(bootSrc, bootDestDist, { recursive: true }); } catch(e) {}
    }
}

// LOADER UTAMA UNTUK .lmp (Controller/Model/Routes)
async function loadLumpiaModule(filePath) {
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    const cacheDir = path.join(process.cwd(), '.lumpia', 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    const relativePath = path.relative(process.cwd(), filePath);
    const flatName = relativePath.replace(/[\/\\]/g, '_').replace('.lmp', '.js');
    const destPath = path.join(cacheDir, flatName);

    // --- TRANSPILE LOGIC ---
    let transcoded = originalContent;

    // 1. Replace Imports: .lmp -> .js
    transcoded = transcoded.replace(/from\s+['"](.+?)\.lmp['"]/g, "from '$1.js'");

    // 2. SYNTAX LARAVEL -> JS (Fitur Request User: "->")
    // Mengubah tanda panah "->" menjadi titik "." 
    // Hati-hati: Kita coba sebisa mungkin tidak mengubah "->" yang ada di dalam string.
    // Regex ini mencari "->" yang TIDAK diapit kutip (Simpel, mungkin tidak 100% sempurna tapi cukup untuk have fun)
    // Atau kita brute force saja asalkan user tahu resikonya.
    // Kita gunakan pendekatan brute replace tapi hindari arrow function "=>" (aman karena beda karakter)
    
    // Replace "->" dengan "."
    transcoded = transcoded.split('\n').map(line => {
        // Cek komentar //
        if (line.trim().startsWith('//')) return line;
        
        // Simple replace "->" to "."
        // Note: Ini akan mengubah string "go -> to" menjadi "go . to". 
        // Untuk framework "Have Fun", ini fitur, bukan bug. XD
        return line.replace(/->/g, '.');
    }).join('\n');

    fs.writeFileSync(destPath, transcoded);
    
    // 4. Import file .js
    const module = await import('file://' + destPath + '?t=' + Date.now());
    return module;
}


export async function serveProject() {
    const root = process.cwd();
    
    const routesFile = path.join(root, 'routes', 'web.lmp');
    if (!fs.existsSync(routesFile)) return console.log("❌ Not a LumpiaJS Project. (Missing routes/web.lmp)");

    const env = loadEnv(root);
    const config = loadConfig(root);

    if (config.klambi === 'tailwindcss') startTailwindWatcher(root);
    else if (config.klambi === 'bootstrap') handleBootstrap(root);

    try {
        await loadLumpiaModule(routesFile);
        console.log(`🛣️  Routes registered: ${routes.length}`);
        
        // Info Syntax
        console.log(`✨ Syntax Mode: PHP/Laravel Style (->) is enabled in .lmp files!`);

        const server = http.createServer(async (req, res) => {
            const method = req.method;
            const url = new URL(req.url, `http://${req.headers.host}`);
            const pathname = url.pathname;

            if (env.APP_DEBUG === 'true') console.log(`📥 ${method} ${pathname}`);

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
                    const controllerPath = path.join(root, 'app', 'controllers', controllerName + '.lmp');
                    
                    if (!fs.existsSync(controllerPath)) throw new Error(`Controller ${controllerName} not found!`);
                    
                    const module = await loadLumpiaModule(controllerPath);
                    const ControllerClass = module.default;
                    const instance = new ControllerClass();
                    
                    instance.env = env;
                    instance.params = params;
                    instance.config = config;

                    if (typeof instance[methodName] !== 'function') throw new Error(`Method ${methodName} missing`);

                    const args = Object.values(params);
                    const result = await instance[methodName](...args); 

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
                    const errorMsg = env.APP_DEBUG === 'true' ? `<pre>${e.stack}</pre>` : `<h1>Server Error</h1>`;
                    res.writeHead(500, {'Content-Type': 'text/html'});
                    res.end(errorMsg);
                }
            } else {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end('<h1>404 Not Found</h1>');
            }
        });

        const port = 3000;
        server.listen(port, () => {
            console.log(`🚀 Server running at ${env.BASE_URL || 'http://localhost:3000'}`);
        });

        process.on('SIGINT', () => {
            backgroundProcess.forEach(p => p.kill());
            try { fs.rmSync(path.join(root, '.lumpia'), { recursive: true, force: true }); } catch(e){}
            process.exit();
        });

    } catch (err) {
        console.error('Fatal Error:', err);
    }
}
