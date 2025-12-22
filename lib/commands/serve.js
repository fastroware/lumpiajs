import fs from 'fs';
import path from 'path';
import http from 'http';
import { routes } from '../core/Router.js';
import { renderLumpia } from '../core/View.js';

export async function serveProject() {
    const root = process.cwd();
    const routesFile = path.join(root, 'jalur', 'web.js');

    if (!fs.existsSync(routesFile)) return console.log("❌ Iki dudu warung LumpiaJS MVC! (Ora nemu jalur/web.js)");

    console.log('🔄 Loading core framework...');
    
    try {
        // Load User Routes
        const userRouteUrl =  path.join(root, 'jalur', 'web.js');
        await import('file://' + userRouteUrl);

        console.log(`🛣️  Total jalur ditemu: ${routes.length}`);

        // Start Server
        const server = http.createServer(async (req, res) => {
            const method = req.method;
            const url = new URL(req.url, `http://${req.headers.host}`);
            const pathname = url.pathname;

            console.log(`📥 ${method} ${pathname}`);

            const match = routes.find(r => r.path === pathname && r.method === method);
            
            if (match) {
                try {
                    // Action format: 'NamaLogika@method'
                    const [controllerName, methodName] = match.action.split('@');
                    
                    // Path ke folder 'app/logika'
                    const controllerPath = path.join(root, 'app', 'logika', controllerName + '.js');
                    
                    if (!fs.existsSync(controllerPath)) throw new Error(`Logika (Controller) ${controllerName} ora ketemu ning app/logika!`);
                    
                    const module = await import('file://' + controllerPath + '?update=' + Date.now()); 
                    const ControllerClass = module.default;
                    const instance = new ControllerClass();
                    
                    if (typeof instance[methodName] !== 'function') {
                        throw new Error(`Method ${methodName} ora ono nang ${controllerName}`);
                    }

                    const result = await instance[methodName](); 

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
                    res.end(`<h1>500: Kompor Meleduk</h1><pre>${e.message}\n${e.stack}</pre>`);
                }
            } else {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end('<h1>404: Dalane buntu, Mas.</h1>');
            }
        });

        const port = 3000;
        server.listen(port, () => {
            console.log(`🚀 Warung buka ning http://localhost:${port}`);
            console.log(`(Tekan Ctrl+C kanggo tutup warung)`);
        });

    } catch (err) {
        console.error('Fatal Error saat loading routes:', err);
    }
}
