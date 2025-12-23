import fs from 'fs';
import path from 'path';
import http from 'http';
import { routes } from '../core/Router.js';
import { renderLumpia } from '../core/View.js';
import { loadEnv } from '../core/Env.js';

// Baca versi LumpiaJS global (CLI ini)
const cliPackageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));

// Helper untuk mencocokkan Route dengan Parameter {id} dll
function matchRoute(definedRoute, method, pathname) {
    if (definedRoute.method !== method) return null;

    // 1. Exact Match
    if (definedRoute.path === pathname) return { params: {} };

    // 2. Dynamic Match (Regex)
    // Convert /produk/{id}/{slug} -> ^\/produk\/([^\/]+)\/([^\/]+)$
    const paramNames = [];
    const regexPath = definedRoute.path.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
        paramNames.push(name);
        return '([^/]+)';
    });

    // Skip if no params found in definition (optimization)
    if (regexPath === definedRoute.path) return null;

    const regex = new RegExp(`^${regexPath}$`);
    const match = pathname.match(regex);

    if (match) {
        const params = {};
        paramNames.forEach((name, index) => {
            params[name] = match[index + 1]; // capture groups start at 1
        });
        return { params };
    }

    return null;
}

export async function serveProject() {
    const root = process.cwd();
    
    // --- 1. Version Check ---
    const userPackageJsonPath = path.join(root, 'package.json');
    if (fs.existsSync(userPackageJsonPath)) {
        const userPkg = JSON.parse(fs.readFileSync(userPackageJsonPath, 'utf-8'));
        const userLumpiaVer = (userPkg.dependencies && userPkg.dependencies.lumpiajs) || 'unknown';
        
        console.log(`ℹ️  LumpiaJS CLI Version: ${cliPackageJson.version}`);
        console.log(`ℹ️  Project Dependency Version: ${userLumpiaVer}`);

        const cleanUserVer = userLumpiaVer.replace(/[^0-9.]/g, '');
        if (cleanUserVer !== cliPackageJson.version && userLumpiaVer !== 'latest') {
             console.log('\n⚠️  PERINGATAN BEDA VERSI!');
             console.log(`   Versi CLI kamu (${cliPackageJson.version}) beda dengan versi di project (${userLumpiaVer}).`);
             console.log('   Saran: Update project dependencies agar sinkron.');
             console.log('   Cara update: npm install lumpiajs@latest\n');
        }
    }

    const routesFile = path.join(root, 'routes', 'web.js');
    if (!fs.existsSync(routesFile)) return console.log("❌ This is not a LumpiaJS MVC project! (Cannot find routes/web.js)");

    // --- 2. Load ENV ---
    const env = loadEnv(root);
    console.log(`🌍 Environment: ${env.APP_ENV}`);
    console.log(`🐛 Debug Mode: ${env.APP_DEBUG}`);

    try {
        // Load User Routes
        const userRouteUrl =  path.join(root, 'routes', 'web.js');
        await import('file://' + userRouteUrl);

        console.log(`🛣️  Routes registered: ${routes.length}`);

        // Start Server
        const server = http.createServer(async (req, res) => {
            const method = req.method;
            const url = new URL(req.url, `http://${req.headers.host}`);
            const pathname = url.pathname;

            if (env.APP_DEBUG === 'true') {
                 console.log(`📥 ${method} ${pathname}`);
            }

            // FIND MATCHING ROUTE
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
                    
                    if (!fs.existsSync(controllerPath)) throw new Error(`Controller ${controllerName} not found in app/controllers!`);
                    
                    // In Development/Local, always invalidate cache
                    let importUrl = 'file://' + controllerPath;
                    if (env.APP_ENV === 'local' || env.APP_ENV === 'development') {
                        importUrl += '?update=' + Date.now();
                    }

                    const module = await import(importUrl); 
                    const ControllerClass = module.default;
                    const instance = new ControllerClass();
                    
                    // Inject ENV & Params to Controller
                    instance.env = env;
                    instance.params = params; // Available as this.params

                    if (typeof instance[methodName] !== 'function') {
                        throw new Error(`Method ${methodName} does not exist in ${controllerName}`);
                    }

                    // Pass params as spread arguments to the method: index(id, slug)
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
                    const errorMsg = env.APP_DEBUG === 'true' 
                        ? `<h1>500: Server Error</h1><pre>${e.message}\n${e.stack}</pre>`
                        : `<h1>500: Server Error</h1><p>Something went wrong.</p>`;
                        
                    res.writeHead(500, {'Content-Type': 'text/html'});
                    res.end(errorMsg);
                }
            } else {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end('<h1>404: Not Found</h1>');
            }
        });

        const port = 3000;
        server.listen(port, () => {
            console.log(`🚀 Server running at ${env.BASE_URL || 'http://localhost:3000'}`);
            console.log(`(Press Ctrl+C to stop)`);
        });

    } catch (err) {
        console.error('Fatal Error loading routes:', err);
    }
}
