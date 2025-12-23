
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { loadConfig } from '../core/Config.js';

// --- HELPERS ---
function transpileContent(content) {
    let code = content;
    code = code.replace(/from\s+['"](.+?)\.lmp['"]/g, "from '$1.js'");
    code = code.split('\n').map(line => {
        if (line.trim().startsWith('//')) return line;
        return line.replace(/->/g, '.');
    }).join('\n');
    
    // Rewrite imports for Browser
    code = code.replace(/from\s+['"]lumpiajs['"]/g, "from '/core/index.js'"); 
    code = code.replace(/from\s+['"]lumpiajs\/lib\/(.+?)['"]/g, "from '/core/$1'");
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
                const content = fs.readFileSync(srcPath, 'utf8');
                const jsContent = transpileContent(content);
                const jsDest = destPath.replace('.lmp', '.js');
                fs.writeFileSync(jsDest, jsContent);
            } else if (item.endsWith('.js')) {
                 const content = fs.readFileSync(srcPath, 'utf8');
                 const jsContent = transpileContent(content); 
                 fs.writeFileSync(destPath, jsContent);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    });
}

// --- 1. PHP BACKEND ADAPTER ---
const phpBridgeContent = `<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// ⚠️ EDIT CONFIG INI
$host = "localhost";
$user = "root";
$pass = "";
$db   = "lumpia_db";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die(json_encode(["error" => $conn->connect_error]));

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) exit;

try {
    $stmt = $conn->prepare($input['sql']);
    if($input['params']) {
        $types = str_repeat("s", count($input['params'])); 
        $stmt->bind_param($types, ...$input['params']);
    }
    $stmt->execute();
    $res = $stmt->get_result();
    $data = $res ? $res->fetch_all(MYSQLI_ASSOC) : ["affected" => $stmt->affected_rows];
    echo json_encode($data);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
$conn->close();
?>`;

// --- 2. NODE.JS / VERCEL BACKEND ADAPTER ---
// Ini file 'api.js' yang akan dijalankan oleh Vercel atau Server.js local
const nodeBridgeContent = `
import { createPool } from 'mysql2/promise';

// ⚠️ CONFIG DARI ENV (Vercel/Node style)
const pool = createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lumpia_db',
    waitForConnections: true,
    connectionLimit: 10
});

export default async function handler(req, res) {
    // Vercel / Express handler signature
    if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end('Method Not Allowed');
    }

    try {
        // Parsing body helper
        let body = req.body;
        if (typeof body === 'string') body = JSON.parse(body); // if raw string

        const { sql, params } = body;
        const [rows] = await pool.execute(sql, params);
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(rows));
    } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error.message }));
    }
}
`;

// --- 3. SERVER.JS (Standalone Node Server) ---
// Server statis + API Handler
const serverJsContent = `
import http from 'http';
import fs from 'fs';
import path from 'path';
import apiHandler from './api.js';

const root = process.cwd();

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://' + req.headers.host);
    
    // API ROUTE
    if (url.pathname === '/api') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            req.body = body ? JSON.parse(body) : {};
            apiHandler(req, res);
        });
        return;
    }

    // STATIC FILES
    let filePath = path.join(root, url.pathname === '/' ? 'index.html' : url.pathname);
    
    // SPA Fallback: If not file, serve index.html
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        filePath = path.join(root, 'index.html');
    }

    const ext = path.extname(filePath);
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log('🚀 Server running on port ' + port));
`;

// --- 4. BROWSER CORE (Polymorphic Client) ---
const browserCoreIndex = `
export class Controller {
    constructor() { this.env = {}; this.params = {}; }
    
    async tampil(viewName, data = {}) {
        const response = await fetch('/views/' + viewName + '.lmp');
        let html = await response.text();
        
        const matchKulit = html.match(/<kulit>([\\s\\S]*?)<\\/kulit>/);
        const matchIsi = html.match(/<isi>([\\s\\S]*?)<\\/isi>/); 
        const matchKlambi = html.match(/<klambi>([\\s\\S]*?)<\\/klambi>/);

        let body = matchKulit ? matchKulit[1] : '';
        let script = matchIsi ? matchIsi[1] : '';
        let css = matchKlambi ? matchKlambi[1] : '';
        
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp('{{\\\\s*' + key + '\\\\s*}}', 'g');
            body = body.replace(regex, value);
        }
        
        document.getElementById('app').innerHTML = body;
        
        if(css) {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        }
        
        const dict = [
            { asal: /ono\\s/g, jadi: 'let ' }, { asal: /paten\\s/g, jadi: 'const ' },
            { asal: /gawe\\s/g, jadi: 'function ' }, { asal: /yen\\s/g, jadi: 'if ' },
            { asal: /liyane/g, jadi: 'else' }, { asal: /mandek;/g, jadi: 'return;' },
            { asal: /ora\\s/g, jadi: '!' },
        ];
        dict.forEach(k => script = script.replace(k.asal, k.jadi));
        
        try { new Function(script)(); } catch(e) { console.error("Error script <isi>:", e); }
    }
    
    json(data) { document.getElementById('app').innerText = JSON.stringify(data, null, 2); }
}

// POLYMORPHIC DB CLIENT
export class DB {
    static table(name) { return new QueryBuilder(name); }
    static async query(sql, params) {
        // Tembak ke endpoint /api
        // Server (Apache/Vercel/Node) yang akan nentuin diteruske ke api.php atau api.js
        const res = await fetch('/api', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({sql, params})
        });
        return await res.json();
    }
}

class QueryBuilder {
    constructor(table) { this.table = table; this.conds = []; this.binds = []; }
    where(c, o, v) { if(v===undefined){v=o;o='=';} this.conds.push(c+' '+o+' ?'); this.binds.push(v); return this; }
    orderBy(c, d='ASC') { this.order = c+' '+d; return this; }
    async get() {
        let sql = 'SELECT * FROM ' + this.table;
        if(this.conds.length) sql += ' WHERE ' + this.conds.join(' AND ');
        if(this.order) sql += ' ORDER BY ' + this.order;
        return await DB.query(sql, this.binds);
    }
}

export const Jalan = {
    routes: [],
    get: (p, a) => Jalan.routes.push({p, a, m:'GET'}),
    post: (p, a) => Jalan.routes.push({p, a, m:'POST'})
};
`;

const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LumpiaJS App</title>
    <link rel="stylesheet" href="/public/css/style.css">
</head>
<body>
    <div id="app">Loading...</div>

    <script type="module">
        import { Jalan } from '/routes/web.js';
        
        async function navigate() {
            const path = window.location.pathname;
            let match = null, params = {};
            for(let r of Jalan.routes) {
                const regexStr = '^' + r.p.replace(/{([a-zA-Z0-9_]+)}/g, '([^/]+)') + '$';
                const regex = new RegExp(regexStr);
                const m = path.match(regex);
                if(m) { match = r; params = m.slice(1); break; }
            }

            if(match) {
                const [cName, mName] = match.a.split('@');
                try {
                    const module = await import('/app/controllers/' + cName + '.js?' + Date.now());
                    const Controller = module.default;
                    const ctrl = new Controller();
                    await ctrl[mName](...params);
                } catch(e) {
                    document.getElementById('app').innerHTML = '<h1>Error</h1><p>' + e.message + '</p>';
                }
            } else {
                 document.getElementById('app').innerHTML = '<h1>404</h1>';
            }
        }

        window.addEventListener('popstate', navigate);
        document.body.addEventListener('click', e => {
            if(e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
                e.preventDefault();
                history.pushState(null, '', e.target.href);
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

    console.log('🍳 Mulai Menggoreng (Universal Hybrid Build)...');

    if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true, force: true });
    fs.mkdirSync(dist);

    if (config.klambi === 'tailwindcss') {
        const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        spawnSync(cmd, ['tailwindcss', '-i', './aset/css/style.css', '-o', './public/css/style.css', '--minify'], { cwd: root, stdio: 'ignore', shell: true });
    }

    console.log('📂 Converting Code...');
    processDirectory(path.join(root, 'app'), path.join(dist, 'app'));
    processDirectory(path.join(root, 'routes'), path.join(dist, 'routes'));
    
    fs.mkdirSync(path.join(dist, 'core'), { recursive: true });
    fs.writeFileSync(path.join(dist, 'core', 'index.js'), browserCoreIndex);

    fs.cpSync(path.join(root, 'views'), path.join(dist, 'views'), { recursive: true });
    
    if (fs.existsSync(path.join(root, 'public'))) {
        fs.cpSync(path.join(root, 'public'), path.join(dist, 'public'), { recursive: true });
    }

    fs.writeFileSync(path.join(dist, 'index.html'), indexHtmlContent);
    
    // --- GENERATE ALL ADAPTERS ---
    
    // 1. PHP Adapter
    fs.writeFileSync(path.join(dist, 'api.php'), phpBridgeContent);
    
    // 2. Node/Vercel Adapter
    fs.writeFileSync(path.join(dist, 'api.js'), nodeBridgeContent);
    fs.writeFileSync(path.join(dist, 'server.js'), serverJsContent);
    fs.writeFileSync(path.join(dist, 'package.json'), JSON.stringify({
        "type": "module",
        "scripts": { "start": "node server.js" },
        "dependencies": { "mysql2": "^3.0.0" }
    }, null, 2));

    // 3. Routing Rules
    
    // .htaccess (Apache) -> Redirect /api ke api.php
    fs.writeFileSync(path.join(dist, '.htaccess'), `
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # API Routing: /api -> api.php
  RewriteRule ^api$ api.php [L]
  
  # SPA Routing: Everything else -> index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`);

    // vercel.json (Vercel) -> Redirect /api ke api.js
    fs.writeFileSync(path.join(dist, 'vercel.json'), JSON.stringify({
        "rewrites": [
            { "source": "/api", "destination": "/api.js" },
            { "source": "/(.*)", "destination": "/index.html" }
        ],
        "functions": {
            "api.js": { "includeFiles": "package.json" }
        }
    }, null, 2));

    console.log('✅ Mateng! (Universal Build)');
    console.log('----------------------------------------------------');
    console.log('📂 Folder "dist" ini UNIVERSAL:');
    console.log('   - Hosting PHP (XAMPP/cPanel): Otomatis pake api.php (via .htaccess)');
    console.log('   - Vercel: Otomatis pake api.js (via vercel.json)');
    console.log('   - Node VPS: Otomatis pake api.js (via server.js)');
    console.log('----------------------------------------------------');
}
