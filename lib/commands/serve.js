
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';
import { loadEnv } from '../core/Env.js';
import { loadConfig } from '../core/Config.js'; 

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

function transpileOnTheFly(content) {
    let code = content;
    code = code.replace(/from\s+['"](.+?)\.lmp['"]/g, "from '$1.js'");
    code = code.split('\n').map(line => {
        let l = line;
        if (l.trim().startsWith('//')) return l;
        KAMUS.forEach(rule => { l = l.replace(rule.from, rule.to); });
        return l;
    }).join('\n');
    return code;
}

const backgroundProcess = [];
function startTailwindWatcher(root) {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const tailwind = spawn(cmd, ['tailwindcss', '-i', './aset/css/style.css', '-o', './public/css/style.css', '--watch'], { cwd: root, stdio: 'inherit', shell: true });
    backgroundProcess.push(tailwind);
}

// BROWSER CORE DEFINITION (Updated with Metadata Support)
// Copied to keep serve.js independent
const browserCore = `
export class Controller {
    constructor() { this.params={}; }
    async tampil(viewName, data={}) {
        try {
            const url = '/views/' + viewName + '.lmp';
            const res = await fetch(url);
            if(!res.ok) throw new Error('View 404: ' + viewName);
            let html = await res.text();
            
            const matchKulit = html.match(/<kulit>([\\s\\S]*?)<\\/kulit>/);
            const matchIsi = html.match(/<isi>([\\s\\S]*?)<\\/isi>/); 
            const matchKlambi = html.match(/<klambi>([\\s\\S]*?)<\\/klambi>/);
            const matchMeta = html.match(/<meta>([\\s\\S]*?)<\\/meta>/);
            
            let body = matchKulit?matchKulit[1]:'', script=matchIsi?matchIsi[1]:'', css=matchKlambi?matchKlambi[1]:'';

            for(const [k,v] of Object.entries(data)) {
                let s = typeof v === 'object' ? JSON.stringify(v) : v;
                body = body.replace(new RegExp('{{\\\\s*'+k+'\\\\s*}}','g'), s);
            }

            if (matchMeta) {
                let metaContent = matchMeta[1];
                for(const [k,v] of Object.entries(data)) {
                    let s = typeof v === 'object' ? JSON.stringify(v) : v;
                    metaContent = metaContent.replace(new RegExp('{{\\\\s*'+k+'\\\\s*}}','g'), s);
                }
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = metaContent;
                document.querySelectorAll('.lumpia-seo').forEach(e => e.remove());
                Array.from(tempDiv.children).forEach(child => {
                    child.classList.add('lumpia-seo');
                    if(child.tagName === 'TITLE') {
                        document.title = child.innerText;
                    } else {
                        document.head.appendChild(child);
                    }
                });
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

// Dev HTML (same as before but updated script)
const devIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>LumpiaJS (Dev)</title>
    <script type="importmap">{"imports": {"lumpiajs": "/core/lumpia.js"}}</script>
    <link rel="stylesheet" href="/public/css/style.css">
    <script>window.LUMPIA_BASE = '';</script>
</head>
<body>
    <div id="app">Loading...</div>
    <script type="module">
        import { Jalan } from 'lumpiajs';
        import '/routes/web.js'; 
        async function navigate() {
            let currentPath = window.location.pathname;
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
                    const mod = await import('/app/controllers/'+cName+'.js?'+Date.now());
                    const C = mod.default; const i = new C(); i.params=args;
                    await i[fName](...args);
                } catch(e) { 
                    console.error(e); 
                    document.getElementById('app').innerHTML='<h1>Dev Error</h1><pre>'+e.message+'</pre>'; 
                }
            } else { 
                document.getElementById('app').innerHTML='<h1>404 Not Found</h1><p>Route: '+currentPath+'</p>'; 
            }
        }
        window.addEventListener('popstate', navigate);
        document.body.addEventListener('click', e => {
            const link = e.target.closest('a');
            if (link && link.href.startsWith(window.location.origin)) {
                if (link.target === '_blank' || e.ctrlKey) return;
                e.preventDefault(); history.pushState(null, '', link.href); navigate();
            }
        });
        navigate();
    </script>
</body>
</html>`;

export async function serveProject() {
    const root = process.cwd();
    const routesFile = path.join(root, 'routes', 'web.lmp');
    if (!fs.existsSync(routesFile)) return console.log("❌ Not a LumpiaJS Project");
    if (!fs.existsSync(path.join(root, 'node_modules'))) return console.log("⚠️  Please run 'npm install'");

    const config = loadConfig(root);
    if (config.klambi === 'tailwindcss') startTailwindWatcher(root);

    console.log('🍳 Kukus Project (Meta Support)...');
    
    http.createServer((req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        let pathname = url.pathname;
        
        if (pathname === '/core/lumpia.js') {
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            return res.end(browserCore);
        }

        if (pathname.startsWith('/public/')) {
            const f = path.join(root, pathname);
            if(fs.existsSync(f)) {
                res.writeHead(200, {'Content-Type': pathname.endsWith('.css')?'text/css':'application/javascript'});
                return res.end(fs.readFileSync(f));
            }
        }

        if (pathname.startsWith('/views/') && pathname.endsWith('.lmp')) {
             const f = path.join(root, pathname);
             if(fs.existsSync(f)) return res.end(fs.readFileSync(f));
             else { res.writeHead(404); return res.end('View 404'); }
        }

        if (pathname.endsWith('.js')) {
            const lmpPath = path.join(root, pathname.replace('.js', '.lmp'));
            if (fs.existsSync(lmpPath)) {
                const content = fs.readFileSync(lmpPath, 'utf8');
                const js = transpileOnTheFly(content);
                res.writeHead(200, {'Content-Type': 'text/javascript'});
                return res.end(js);
            }
            const jsPath = path.join(root, pathname);
            if (fs.existsSync(jsPath)) {
                 res.writeHead(200, {'Content-Type': 'text/javascript'});
                 return res.end(fs.readFileSync(jsPath));
            }
        }

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(devIndexHtml);

    }).listen(3000, () => console.log('🚀 Server: http://localhost:3000'));
}
