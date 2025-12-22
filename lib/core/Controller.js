import fs from 'fs';
import path from 'path';
import { renderLumpia } from './View.js';

// 3. BASE LOGIKA (Controller)
export class Logika {
    tampil(viewName, data = {}) {
        // Cek lokasi view relative dari CWD user (folder 'depan')
        const viewPath = path.join(process.cwd(), 'depan', `${viewName}.lmp`);
        if (fs.existsSync(viewPath)) {
            return { type: 'html', content: renderLumpia(viewPath, data) };
        } else {
            return { type: 'html', content: `<h1>404: Tampilan '${viewName}' ora ketemu ning folder 'depan', Lur.</h1>` };
        }
    }

    json(data) {
        return { type: 'json', content: JSON.stringify(data) };
    }
}
