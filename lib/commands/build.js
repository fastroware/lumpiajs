
// KAMUS SEMARANGAN (Regex Replacement Rules)
// Urutan penting! Keyword panjang dulu baru pendek.
const KAMUS = [
    { from: /paten\s/g, to: 'const ' },
    { from: /ono\s/g, to: 'let ' },
    { from: /fungsi\s/g, to: 'function ' }, // Changed from 'gawe'
    { from: /nteni\s/g, to: 'await ' },
    { from: /mengko\s/g, to: 'async ' }, 
    { from: /balek\s/g, to: 'return ' },
    { from: /yen\s*\(/g, to: 'if(' },     
    { from: /liyane\s/g, to: 'else ' },
    { from: /jajal\s*\{/g, to: 'try {' },
    { from: /gagal\s*\(/g, to: 'catch(' },
    { from: /kandani\(/g, to: 'console.log(' },
    { from: /aku->/g, to: 'this.' }, // NEW: this -> aku
    { from: /aku\./g, to: 'this.' }, // Support dot notation too
    { from: /->/g, to: '.' } 
];

function transpileSemarangan(content) {
    let code = content;
    
    // Import .lmp -> .js
    code = code.replace(/from\s+['"](.+?)\.lmp['"]/g, "from '$1.js'");
    code = code.replace(/from\s+['"]lumpiajs['"]/g, "from '/core/lumpia.js'"); 

    // Safe Replace Logic
    // We must handle this carefully to not break valid JS code if mixed.
    // 'aku' is common word, but as keyword usually followed by -> or .
    
    code = code.split('\n').map(line => {
        let l = line;
        if (l.trim().startsWith('//')) return l;
        
        KAMUS.forEach(rule => {
            l = l.replace(rule.from, rule.to);
        });
        return l;
    }).join('\n');

    return code;
}

// ... Rest of build.js code (processDirectory, browserCore, indexHtml, buildProject) ...
// ... I will copy the previous logic but update browserCore as well.

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { loadConfig } from '../core/Config.js';

function processDirectory(source, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(source).forEach(item => {
        const srcPath = path.join(source, item);
        const destPath = path.join(dest, item);
        if (fs.statSync(srcPath).isDirectory()) {
            processDirectory(srcPath, destPath);
        } else {
            if (item.endsWith('.lmp') || item.endsWith('.js')) {
                const content = fs.readFileSync(srcPath, 'utf8');
                const jsContent = transpileSemarangan(content); 
                const finalDest = destPath.replace('.lmp', '.js');
                fs.writeFileSync(finalDest, jsContent);
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
            const res = await fetch('/views/'+viewName+'.lmp');
            if(!res.ok) throw new Error('View 404');
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
                // Client-side transpile
                const kamus = [
                    {f:/paten\\s/g,t:'const '}, {f:/ono\\s/g,t:'let '}, {f:/fungsi\\s/g,t:'function '},
                    {f:/nteni\\s/g,t:'await '}, {f:/mengko\\s/g,t:'async '}, {f:/balek\\s/g,t:'return '},
                    {f:/yen\\s*\\(/g,t:'if('}, {f:/liyane\\s/g,t:'else '}, {f:/kandani\\(/g,t:'console.log('},
                    {f:/aku->/g,t:'this.'}, {f:/aku\\./g,t:'this.'}
                ];
                kamus.forEach(r => script = script.replace(r.f, r.t));
                new Function(script)();
            }
        } catch(e) { document.getElementById('app').innerHTML = e.message; }
    }
}
export const Jalan = { routes:[], get:(p,a)=>Jalan.routes.push({p,a}) };
`;

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>LumpiaJS</title><link rel="stylesheet" href="/public/css/style.css"></head>
<body><div id="app">Loading...</div>
<script type="module">
import { Jalan } from '/routes/web.js';
async function navigate() {
    const p = window.location.pathname;
    let m = null, args = {};
    for(let r of Jalan.routes) {
        let reg = new RegExp('^'+r.p.replace(/{([a-zA-Z0-9_]+)}/g, '([^/]+)')+'$');
        let res = p.match(reg);
        if(res){ m=r; args=res.slice(1); break; }
    }
    if(m) {
        const [cName, fName] = m.a.split('@');
        try {
            const mod = await import('/app/controllers/'+cName+'.js?'+Date.now());
            const C = mod.default; const i = new C(); i.params=args;
            await i[fName](...args);
        } catch(e) { console.error(e); document.getElementById('app').innerHTML='Error'; }
    } else { document.getElementById('app').innerHTML='404'; }
}
window.addEventListener('popstate', navigate);
document.body.addEventListener('click', e => {
    if(e.target.tagName==='A' && e.target.href.startsWith(window.location.origin)) {
        e.preventDefault(); history.pushState(null,'',e.target.href); navigate();
    }
});
navigate();
</script></body></html>`;

export function buildProject() {
    const root = process.cwd();
    const dist = path.join(root, 'dist');
    const config = loadConfig(root);
    
    console.log('🍳 Goreng Project (Mode Bahasa Semarangan)...');
    if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true, force: true });
    fs.mkdirSync(dist);

    if (config.klambi === 'tailwindcss') {
        const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        spawnSync(cmd, ['tailwindcss', '-i', './aset/css/style.css', '-o', './public/css/style.css', '--minify'], { cwd: root, stdio: 'ignore', shell: true });
    }

    processDirectory(path.join(root, 'app'), path.join(dist, 'app'));
    processDirectory(path.join(root, 'routes'), path.join(dist, 'routes'));
    fs.cpSync(path.join(root, 'views'), path.join(dist, 'views'), { recursive: true });
    if (fs.existsSync(path.join(root, 'public'))) fs.cpSync(path.join(root, 'public'), path.join(dist, 'public'), { recursive: true });

    fs.mkdirSync(path.join(dist, 'core'), { recursive: true });
    fs.writeFileSync(path.join(dist, 'core', 'lumpia.js'), browserCore);
    fs.writeFileSync(path.join(dist, 'index.html'), indexHtml);
    fs.writeFileSync(path.join(dist, '.htaccess'), `<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteBase /\nRewriteRule ^index\\.html$ - [L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . /index.html [L]\n</IfModule>`);

    console.log('✅ Mateng! (Support Bahasa Semarangan)');
}
