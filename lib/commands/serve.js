import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';
import { loadEnv } from '../core/Env.js';
import { loadConfig } from '../core/Config.js'; 

const KAMUS = [
    { from: /paten\s/g, to: 'const ' },
    { from: /ono\s/g, to: 'let ' },
    { from: /gawe\s/g, to: 'function ' },
    { from: /nteni\s/g, to: 'await ' },
    { from: /mengko\s/g, to: 'async ' }, 
    { from: /balek\s/g, to: 'return ' },
    { from: /yen\s*\(/g, to: 'if(' },     
    { from: /liyane\s/g, to: 'else ' },
    { from: /jajal\s*\{/g, to: 'try {' },
    { from: /gagal\s*\(/g, to: 'catch(' },
    { from: /kandani\(/g, to: 'console.log(' },
    { from: /->/g, to: '.' } 
];

// ... (Rest of serve.js similar, just update loadLumpiaModule)

async function loadLumpiaModule(filePath) {
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    const cacheDir = path.join(process.cwd(), '.lumpia', 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    const relativePath = path.relative(process.cwd(), filePath);
    const flatName = relativePath.replace(/[\/\\]/g, '_').replace('.lmp', '.js');
    const destPath = path.join(cacheDir, flatName);

    let transcoded = originalContent;
    transcoded = transcoded.replace(/from\s+['"](.+?)\.lmp['"]/g, "from '$1.js'");

    // SEMARANGAN TRANSPILE
    transcoded = transcoded.split('\n').map(line => {
        let l = line;
        if (l.trim().startsWith('//')) return l;
        KAMUS.forEach(rule => l = l.replace(rule.from, rule.to));
        return l;
    }).join('\n');

    fs.writeFileSync(destPath, transcoded);
    const module = await import('file://' + destPath + '?t=' + Date.now());
    return module;
}

// ... (Rest of serve.js export function serveProject is same as before, simplified below for brevity)
// I will rewrite full content to ensure correctness.

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
        paramNames.forEach((name, index) => { params[name] = match[index + 1]; });
        return { params };
    }
    return null;
}

const backgroundProcess = [];
function startTailwindWatcher(root) {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const tailwind = spawn(cmd, ['tailwindcss', '-i', './aset/css/style.css', '-o', './public/css/style.css', '--watch'], { cwd: root, stdio: 'ignore', shell: true });
    backgroundProcess.push(tailwind);
}

export async function serveProject() {
    const root = process.cwd();
    const routesFile = path.join(root, 'routes', 'web.lmp');
    if (!fs.existsSync(routesFile)) return console.log("❌ Missing routes/web.lmp");

    const env = loadEnv(root);
    const config = loadConfig(root);
    if (config.klambi === 'tailwindcss') startTailwindWatcher(root);

    try {
        await loadLumpiaModule(routesFile);
        const activeRoutes = global.LumpiaRouter || []; 
        console.log(`🛣️  Routes registered: ${activeRoutes.length}`);
        console.log(`✨ Syntax Mode: Semarangan (paten, ono, gawe) & Laravel (->) enabled!`);

        const server = http.createServer(async (req, res) => {
            const method = req.method;
            const url = new URL(req.url, `http://${req.headers.host}`);
            const pathname = url.pathname;

            const publicMap = { '/css/': path.join(root, 'public', 'css'), '/vendor/': path.join(root, 'public', 'vendor') };
            for (const [prefix, localPath] of Object.entries(publicMap)) {
                if (pathname.startsWith(prefix)) {
                    const filePath = path.join(localPath, pathname.slice(prefix.length));
                    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
                        const ext = path.extname(filePath);
                        const mime = ext === '.css' ? 'text/css' : (ext === '.js' ? 'text/javascript' : 'application/octet-stream');
                        res.writeHead(200, {'Content-Type': mime});
                        res.end(fs.readFileSync(filePath));
                        return;
                    }
                }
            }

            let match = null, params = {};
            const currentRoutes = global.LumpiaRouter || [];
            for (const route of currentRoutes) {
                const result = matchRoute(route, method, pathname);
                if (result) { match = route; params = result.params; break; }
            }
            
            if (match) {
                try {
                    const [cName, mName] = match.action.split('@');
                    const cPath = path.join(root, 'app', 'controllers', cName + '.lmp');
                    if (!fs.existsSync(cPath)) throw new Error('Controller Not Found');
                    
                    const module = await loadLumpiaModule(cPath);
                    const Ctrl = module.default;
                    const instance = new Ctrl();
                    instance.env = env; instance.params = params; instance.config = config;
                    
                    const result = await instance[mName](...Object.values(params)); 
                    // Serve Logic (HTML/JSON) is usually returned by tampil() or json()
                    // But here we are simulating Browser Logic in Node Server for Dev Preview?
                    // Wait, if we moved to Pure Static Architecture, 'lumpia kukus' should ideally serve the static index.html and emulate browser router?
                    // OR stick to Node.js SSR for dev preview to be fast, and Client Side for Build.
                    
                    // For Simplicity and consistency with "Pure Static" request:
                    // `lumpia kukus` SHOULD behave like `vite`, serving the source files to browser.
                    // BUT our user wants "Semarangan Syntax". Browser can't run 'paten', 'ono'.
                    // SO `lumpia kukus` MUST transpile on the fly and serve JS to browser.
                    
                    // CURRENT LOGIC: SSR (Node executing controller).
                    // This works fine for preview if logic is simple.
                    // But if Controller uses DOM/Window, Node will crash.
                    
                    // LET'S KEEP SSR FOR DEV PREVIEW for now, assuming user cleans logic.
                    // OR switch `serve.js` to also serve SPA Shell like build?
                    
                    // Let's keep SSR for now as it's already working and robust enough for basic logic checking.
                    
                    if (result && result.type) {
                        res.writeHead(200, {'Content-Type': result.type==='json'?'application/json':'text/html'});
                        res.end(result.content);
                    } else {
                        res.end(String(result));
                    }
                } catch (e) {
                    res.writeHead(500); res.end(`<pre>${e.stack}</pre>`);
                }
            } else {
                res.writeHead(404); res.end('404 Not Found');
            }
        });
        server.listen(3000, () => console.log('🚀 Server: http://localhost:3000'));
    } catch (e) { console.error(e); }
}
