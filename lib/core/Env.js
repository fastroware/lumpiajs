import fs from 'fs';
import path from 'path';

export function loadEnv(root) {
    const envPath = path.join(root, '.env');
    const env = {};
    
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split('\n').forEach(line => {
            if(line.includes('=')) {
                const [key, val] = line.split('=');
                env[key.trim()] = val.trim().replace(/"/g, '');
            }
        });
    } else {
        // Default values if .env not found
        env.BASE_URL = "http://localhost:3000";
        env.APP_ENV = "local";
        env.APP_DEBUG = "true";
    }
    return env;
}
