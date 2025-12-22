import fs from 'fs';
import path from 'path';
import { renderLumpia } from './View.js';

// 3. CONTROLLER BASE
export class Controller {
    tampil(viewName, data = {}) {
        // Cek lokasi view relative dari CWD user (folder 'views')
        const viewPath = path.join(process.cwd(), 'views', `${viewName}.lmp`);
        if (fs.existsSync(viewPath)) {
            return { type: 'html', content: renderLumpia(viewPath, data) };
        } else {
            return { type: 'html', content: `<h1>404: View '${viewName}' not found in 'views' folder.</h1>` };
        }
    }

    json(data) {
        return { type: 'json', content: JSON.stringify(data) };
    }
}
