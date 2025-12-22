import fs from 'fs';
import path from 'path';
import { renderLumpia } from './View.js';

// 3. CONTROLLER BASE
export class Kontroler {
    tampil(viewName, data = {}) {
        // Cek lokasi view relative dari CWD user
        const viewPath = path.join(process.cwd(), 'wajah', `${viewName}.lmp`);
        if (fs.existsSync(viewPath)) {
            return { type: 'html', content: renderLumpia(viewPath, data) };
        } else {
            return { type: 'html', content: `<h1>404: Wajah (View) '${viewName}' ora ketemu, Lur.</h1>` };
        }
    }

    json(data) {
        return { type: 'json', content: JSON.stringify(data) };
    }
}
