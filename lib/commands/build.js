
// ... (KAMUS same as before) ...
const KAMUS = [
    { from: /paten\s/g, to: 'const ' },
    { from: /ono\s/g, to: 'let ' },
    { from: /fungsi\s/g, to: 'function ' }, 
    { from: /nteni\s/g, to: 'await ' },
    { from: /mengko\s/g, to: 'async ' }, 
    { from: /balek\s/g, to: 'return ' },
    { from: /yen\s*\(/g, to: 'if(' },     
    { from: /liyane\s/g, to: 'else ' },
    { from: /jajal\s*\{/g, to: 'try {' },
    { from: /gagal\s*\(/g, to: 'catch(' },
    { from: /kandani\(/g, to: 'console.log(' },
    { from: /aku->/g, to: 'this.' },
    { from: /aku\./g, to: 'this.' },
    { from: /->/g, to: '.' } 
];

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { loadConfig } from '../core/Config.js';

function transpileSemarangan(content) {
    let code = content;
    // 1. Keep .lmp import relative for now, or assume .js
    code = code.replace(/from\s+['"](.+?)\.lmp['"]/g, "from '$1.js'");
    
    // 2. DO NOT TOUCH 'lumpiajs' IMPORT.
    // We will use Import Map in index.html to resolve 'lumpiajs' to './core/lumpia.js'
    // This solves the relative path hell once and for all.

    code = code.split('\n').map(line => {
        let l = line;
        if (l.trim().startsWith('//')) return l;
        KAMUS.forEach(rule => { l = l.replace(rule.from, rule.to); });
        return l;
    }).join('\n');
    return code;
}

function processDirectory(source, dest, rootDepth = 0) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(source).forEach(item => {
        const srcPath = path.join(source, item);
        const destPath = path.join(dest, item);
        if (fs.statSync(srcPath).isDirectory()) {
            processDirectory(srcPath, destPath, rootDepth + 1);
        } else {
            if (item.endsWith('.lmp') || item.endsWith('.js')) {
                let content = fs.readFileSync(srcPath, 'utf8');
                content = transpileSemarangan(content); 
                const finalDest = destPath.replace('.lmp', '.js');
                fs.writeFileSync(finalDest, content);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    });
}

const browserCore = `
export class Controller {
    constructor() { this.params={}; }
    async tampil(viewName, data={}) {
        try {
            // Fetch view must be relative to root of dist.
            // Since we use Import Map, we are modernized. 
            // Better to assume deployment at known base or use explicit relative if possible.
            // But fetch('views/...') is relative to current page URL.
            // If current page is /2025/lumpiajs/produk, fetch('views/home.lmp') -> /2025/lumpiajs/views/home.lmp (Works!)
            // Wait, if /produk is virtual path, browser thinks we are in folder /lumpiajs/.
            // If /produk/detail/1 -> browser thinks folder is /lumpiajs/produk/detail/.
            // Fetch 'views/...' will fail (404).
            
            // SOLUSI: Selalu fetch dari ROOT relative (pakai Window Base yang kita set di index.html)
            const basePath = window.LUMPIA_BASE || '';
            // Ensure slash
            const url = basePath + '/views/' + viewName + '.lmp';
            
            const res = await fetch(url.replace('//', '/')); // simple cleanup
            if(!res.ok) throw new Error('View 404: ' + viewName);
            let html = await res.text();
            
            const matchKulit = html.match(/<kulit>([\\s\\S]*?)<\\/kulit>/);
            const matchIsi = html.match(/<isi>([\\s\\S]*?)<\\/isi>/); 
            const matchKlambi = html.match(/<klambi>([\\s\\S]*?)<\\/klambi>/);
            
            let body = matchKulit?matchKulit[1]:'', script=matchIsi?matchIsi[1]:'', css=matchKlambi?matchKlambi[1]:'';

            for(const [k,v] of Object.entries(data)) {
                let s = typeof v === 'object' ? JSON.stringify(v) : v;
                body = body.replace(new RegExp('{{\\\\s*'+k+'\\\\s*}}','g'), s);
            }
            
            document.getElementById('app').innerHTML = body;
            if(css && !document.getElementById('css-'+viewName)) {
                const s = document.createElement('style'); s.id='css-'+viewName; s.textContent=css;
                document.head.appendChild(s);
            }
            
            if(script) {
                const kamus = [
                    {f:/paten\\s/g,t:'const '}, {f:/ono\\s/g,t:'let '}, {f:/fungsi\\s/g,t:'function '},
                    {f:/nteni\\s/g,t:'await '}, {f:/mengko\\s/g,t:'async '}, {f:/balek\\s/g,t:'return '},
                    {f:/yen\\s*\\(/g,t:'if('}, {f:/liyane\\s/g,t:'else '}, {f:/kandani\\(/g,t:'console.log('},
                    {f:/aku->/g,t:'this.'}, {f:/aku\\./g,t:'this.'}
                ];
                kamus.forEach(r => script = script.replace(r.f, r.t));
                try { new Function(script)(); } catch(e){ console.error(e); }
            }
        } catch(e) { document.getElementById('app').innerHTML = e.message; }
    }
}
export const Jalan = { routes:[], get:(p,a)=>Jalan.routes.push({p,a}) };
`;

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>LumpiaJS</title>
    <!-- IMPORT MAP: KUNCI SUKSES LOAD MODULE DI SUBFOLDER -->
    <script type="importmap">
    {
        "imports": {
            "lumpiajs": "./core/lumpia.js"
        }
    }
    </script>
    <link rel="stylesheet" href="public/css/style.css">
    <script>
        // DETEKSI BASE PATH DENGAN LEBIH AMAN (Via current script location fallback)
        // Kita ambil lokasi index.html ini sebagai 'Source of Truth' root aplikasi.
        window.LUMPIA_BASE = window.location.pathname
            .replace(new RegExp('/index\\\\.html$'), '')
            .replace(new RegExp('/$'), '');
        // console.log('Base:', window.LUMPIA_BASE);
    </script>
</head>
<body>
    <div id="app">Loading...</div>
    
    <script type="module">
        // Import Map makes this work:
        import { Jalan } from './routes/web.js';
        
        async function navigate() {
            let currentPath = window.location.pathname;
            
            // Normalize: Strip Base Path
            if (window.LUMPIA_BASE && currentPath.startsWith(window.LUMPIA_BASE)) {
                currentPath = currentPath.substring(window.LUMPIA_BASE.length);
            }
            if (!currentPath || currentPath === '/index.html') currentPath = '/';

            let m = null, args = {};
            for(let r of Jalan.routes) {
                let regexStr = '^' + r.p.replace(/{([a-zA-Z0-9_]+)}/g, '([^/]+)') + '$';
                let reg = new RegExp(regexStr);
                let res = currentPath.match(reg);
                if(res){ m=r; args=res.slice(1); break; }
            }

            if(m) {
                const [cName, fName] = m.a.split('@');
                try {
                    // Import Relative to index.html (selalu root dist)
                    const mod = await import('./app/controllers/'+cName+'.js?'+Date.now());
                    const C = mod.default; const i = new C(); i.params=args;
                    await i[fName](...args);
                } catch(e) { 
                    console.error(e); 
                    document.getElementById('app').innerHTML='<h1>Error</h1><pre>'+e.message+'</pre>'; 
                }
            } else { 
                document.getElementById('app').innerHTML='<h1>404 Not Found</h1><p>Route: '+currentPath+'</p>'; 
            }
        }

        window.addEventListener('popstate', navigate);
        
        // SPA LINK INTERCEPTOR (SAT SET MODE)
        document.body.addEventListener('click', e => {
            // Cari elemen <a> (bisa jadi klik di span dalam a)
            const link = e.target.closest('a');
            if (link && link.href.startsWith(window.location.origin)) {
                // Ignore if target blank or control click
                if (link.target === '_blank' || e.ctrlKey) return;

                e.preventDefault(); 
                history.pushState(null, '', link.href); 
                navigate();
            }
        });
        
        navigate();
    </script>
</body>
</html>`;

export function buildProject() {
    const root = process.cwd();
    const dist = path.join(root, 'dist');
    const config = loadConfig(root);
    
    console.log('🍳 Goreng Project (Mode Import Map + Sat Set SPA)...');
    if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true, force: true });
    fs.mkdirSync(dist);

    if (config.klambi === 'tailwindcss') {
        const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        spawnSync(cmd, ['tailwindcss', '-i', './aset/css/style.css', '-o', './public/css/style.css', '--minify'], { cwd: root, stdio: 'ignore', shell: true });
    }

    processDirectory(path.join(root, 'app'), path.join(dist, 'app'), 2); 
    processDirectory(path.join(root, 'routes'), path.join(dist, 'routes'), 1); 
    
    fs.cpSync(path.join(root, 'views'), path.join(dist, 'views'), { recursive: true });
    if (fs.existsSync(path.join(root, 'public'))) fs.cpSync(path.join(root, 'public'), path.join(dist, 'public'), { recursive: true });

    fs.mkdirSync(path.join(dist, 'core'), { recursive: true });
    fs.writeFileSync(path.join(dist, 'core', 'lumpia.js'), browserCore);
    fs.writeFileSync(path.join(dist, 'index.html'), indexHtml);
    
    fs.writeFileSync(path.join(dist, '.htaccess'), `<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteRule ^index\\.html$ - [L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . index.html [L]\n</IfModule>`);

    console.log('✅ Mateng! Siap dihidangkan di folder manapun.');
}
