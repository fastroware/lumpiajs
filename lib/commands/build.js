
// ... (KAMUS dan Helper functions sama seperti sebelumnya) ...
// Saya akan fokus update browserCore dan indexHtml

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
    code = code.replace(/from\s+['"](.+?)\.lmp['"]/g, "from '$1.js'");
    code = code.replace(/from\s+['"]lumpiajs['"]/g, "from './core/lumpia.js'"); // FIX: Relative import to core

    // Handle imports agar path-nya relatif browser freindly
    // Jika import './...' -> aman.
    // Jika import '/...' -> bahaya kalau di subfolder.

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
                
                // ADJUST IMPORT PATHS FOR BROWSER (CRITICAL!)
                // Controller/Route ada di kedalaman tertentu. Core ada di /dist/core.
                // Kita harus rewrite "from 'lumpiajs'" menjadi path relative yang benar ke core.
                // Misal dari /app/controllers (depth 2) -> '../../core/lumpia.js'
                
                // Hitung relative backstep
                let backSteps = '../'.repeat(rootDepth); 
                // Karena structure dist:
                // dist/routes/web.js (depth 1) -> butuh '../core/lumpia.js'
                // dist/app/controllers/Home.js (depth 2) -> butuh '../../core/lumpia.js'
                // Jadi logicnya benar.

                content = content.replace(/from\s+['"]lumpiajs['"]/g, `from '${backSteps}../core/lumpia.js'`);

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
            // Fetch view relative to root (we assume <base> tag is set or we detect root)
            // Biar aman, kita cari 'views' relatif terhadap posisi script ini? Gak bisa.
            // Kita asumsi deployment di root atau subfolder dengan <base> tag HTML yang benar.
            
            const res = await fetch('views/'+viewName+'.lmp'); 
            if(!res.ok) throw new Error('View 404: ' + viewName);
            let html = await res.text();
            
            // ... (Parsing logic same as before) ...
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
    <!-- BASE HREF AUTOMATIC DETECTION MAGIC -->
    <script>
        // Set base href to current folder so imports work in subfolders
        // But for SPA routing, this might fight with History API.
        // Let's rely on relative imports './' everywhere.
        // document.write("<base href='" + document.location.pathname.replace(/index\\.html$/,'') + "' />");
    </script>
    <link rel="stylesheet" href="public/css/style.css">
</head>
<body>
    <div id="app">Loading...</div>
    
    <script type="module">
        // Import paths WITHOUT leading slash to be relative to index.html
        import { Jalan } from './routes/web.js';
        
        async function navigate() {
            // Normalize path: Remove base folder logic needed?
            // Simple approach: Match pathname against routes.
            // If app is in /my-app/, and route is '/', browser pathname is '/my-app/'.
            // WE NEED TO STRIP THE BASE PATH.
            
            // Hacky detection of Base Path (where index.html sits)
            const basePath = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
            let currentPath = window.location.pathname.replace(/\/index\.html$/, '');
            if (basePath && currentPath.startsWith(basePath)) {
                currentPath = currentPath.substring(basePath.length);
            }
            if (!currentPath) currentPath = '/'; // Root

            let m = null, args = {};
            for(let r of Jalan.routes) {
                // Route defined as '/home'
                let reg = new RegExp('^'+r.p.replace(/{([a-zA-Z0-9_]+)}/g, '([^/]+)')+'$');
                let res = currentPath.match(reg);
                if(res){ m=r; args=res.slice(1); break; }
            }

            if(m) {
                const [cName, fName] = m.a.split('@');
                try {
                    // Import Relative to index.html
                    const mod = await import('./app/controllers/'+cName+'.js?'+Date.now());
                    const C = mod.default; const i = new C(); i.params=args;
                    await i[fName](...args);
                } catch(e) { 
                    console.error(e); 
                    document.getElementById('app').innerHTML='<h1>Error Loading Controller</h1><pre>'+e.message+'</pre>'; 
                }
            } else { 
                document.getElementById('app').innerHTML='<h1>404 Not Found</h1><p>Path: '+currentPath+'</p>'; 
            }
        }

        window.addEventListener('popstate', navigate);
        document.body.addEventListener('click', e => {
            if(e.target.tagName==='A' && e.target.href.startsWith(window.location.origin)) {
                e.preventDefault(); 
                // Push relative path?
                history.pushState(null,'',e.target.href); 
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
    
    console.log('🍳 Goreng Project (Mode Bahasa Semarangan + Relative Paths)...');
    if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true, force: true });
    fs.mkdirSync(dist);

    if (config.klambi === 'tailwindcss') {
        const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        spawnSync(cmd, ['tailwindcss', '-i', './aset/css/style.css', '-o', './public/css/style.css', '--minify'], { cwd: root, stdio: 'ignore', shell: true });
    }

    // Process using Relative Path Logic
    // We pass 'rootDepth' to calculate imports to 'core'
    processDirectory(path.join(root, 'app'), path.join(dist, 'app'), 2); // app/controllers/X -> depth 2 from dist
    processDirectory(path.join(root, 'routes'), path.join(dist, 'routes'), 1); // routes/X -> depth 1 from dist
    
    fs.cpSync(path.join(root, 'views'), path.join(dist, 'views'), { recursive: true });
    if (fs.existsSync(path.join(root, 'public'))) fs.cpSync(path.join(root, 'public'), path.join(dist, 'public'), { recursive: true });

    fs.mkdirSync(path.join(dist, 'core'), { recursive: true });
    fs.writeFileSync(path.join(dist, 'core', 'lumpia.js'), browserCore);
    fs.writeFileSync(path.join(dist, 'index.html'), indexHtml);
    
    // .htaccess for "Subfolder Friendly" SPA?
    // RewriteRule ^index\.html$ - [L]
    // RewriteCond %{REQUEST_FILENAME} !-f
    // RewriteRule . index.html [L]
    // Note: Removed leading slash in redirect destination to be relative
    fs.writeFileSync(path.join(dist, '.htaccess'), `<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteRule ^index\\.html$ - [L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . index.html [L]\n</IfModule>`);

    console.log('✅ Mateng! (Support Subfolder Hosting)');
}
