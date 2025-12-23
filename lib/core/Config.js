import fs from 'fs';
import path from 'path';

export function loadConfig(root) {
    const configPath = path.join(root, 'config.lmp');
    const config = {
        klambi: 'none' // default
    };
    
    if (fs.existsSync(configPath)) {
        try {
            const content = fs.readFileSync(configPath, 'utf-8');
            const parsed = JSON.parse(content);
            if (parsed.klambi) config.klambi = parsed.klambi;
        } catch (e) {
            console.error('⚠️ Gagal moco config.lmp', e.message);
        }
    }
    return config;
}
