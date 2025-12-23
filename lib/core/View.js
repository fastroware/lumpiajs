import fs from 'fs';
import path from 'path';
import { loadConfig } from './Config.js';

// --- KAMUS BAHASA SEMARANG (Blade-like Template Engine) ---
export function renderLumpia(viewPath, data = {}) {
    let content = fs.readFileSync(viewPath, 'utf-8');

    // 1. Ekstrak bagian <klambi>, <kulit>, <isi>
    const matchKulit = content.match(/<kulit>([\s\S]*?)<\/kulit>/);
    const matchIsi = content.match(/<isi>([\s\S]*?)<\/isi>/); 
    const matchKlambi = content.match(/<klambi>([\s\S]*?)<\/klambi>/);

    let htmlBody = matchKulit ? matchKulit[1] : '';
    let clientScript = matchIsi ? matchIsi[1] : '';
    let cssStyle = matchKlambi ? matchKlambi[1] : '';

    // 2. Transpile Client-side JS
    const dictionary = [
        { asal: /ono\s/g, jadi: 'let ' },
        { asal: /paten\s/g, jadi: 'const ' },
        { asal: /gawe\s/g, jadi: 'function ' },
        { asal: /yen\s/g, jadi: 'if ' },
        { asal: /liyane/g, jadi: 'else' },
        { asal: /mandek;/g, jadi: 'return;' },
        { asal: /ora\s/g, jadi: '!' },
        { asal: /panjang\(/g, jadi: 'len(' },
    ];
    dictionary.forEach(kata => clientScript = clientScript.replace(kata.asal, kata.jadi));

    // 3. Templating Engine
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        htmlBody = htmlBody.replace(regex, value);
    }
    
    // --- 4. AUTO INJECT ASSETS BASED ON CONFIG ---
    // Kita baca config dari PROJECT_ROOT (asumsi process.cwd())
    let headInjection = '';
    const config = loadConfig(process.cwd());

    // Inject main.css (Tailwind build result or Custom CSS)
    headInjection += `<link rel="stylesheet" href="/css/style.css">`;

    // Inject Vendor Specific
    if (config.klambi === 'bootstrap') {
        headInjection += `<link rel="stylesheet" href="/vendor/bootstrap/css/bootstrap.min.css">`;
        // Optional JS injection could be added here
    }

    // 4. Rakit Akhir
    return `<!DOCTYPE html>
<html>
<head>
    <title>Lumpia App</title>
    ${headInjection}
    <style> ${cssStyle}</style>
</head>
<body>
    ${htmlBody}
    <div id="output-lumpia"></div>
    <script>
        function tampil(txt) { 
            let el = document.getElementById('output-lumpia');
            if(el) el.innerText = txt; 
        }
        ${clientScript}
    </script>
</body>
</html>`;
}
