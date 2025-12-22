import fs from 'fs';

// --- KAMUS BAHASA SEMARANG (Blade-like Template Engine) ---
// Mengubah sintaks .lmp ke HTML siap render dengan interpolasi data
export function renderLumpia(viewPath, data = {}) {
    let content = fs.readFileSync(viewPath, 'utf-8');

    // 1. Ekstrak bagian <klambi>, <kulit>, <isi>
    const matchKulit = content.match(/<kulit>([\s\S]*?)<\/kulit>/);
    const matchIsi = content.match(/<isi>([\s\S]*?)<\/isi>/); // Client-side JS
    const matchKlambi = content.match(/<klambi>([\s\S]*?)<\/klambi>/);

    let htmlBody = matchKulit ? matchKulit[1] : '';
    let clientScript = matchIsi ? matchIsi[1] : '';
    let cssStyle = matchKlambi ? matchKlambi[1] : '';

    // 2. Transpile Client-side JS (Semarangan -> JS Standard)
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

    // 3. Templating Engine (Mirip Blade {{ variable }})
    // Mengganti {{ variable }} dengan value dari `data`
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        // Simple XSS protection could be added here
        htmlBody = htmlBody.replace(regex, value);
    }
    
    // 4. Rakit Akhir
    return `<!DOCTYPE html>
<html>
<head>
    <title>Lumpia App</title>
    <style>body{font-family:sans-serif;padding:20px;} ${cssStyle}</style>
</head>
<body>
    ${htmlBody}
    <div id="output-lumpia"></div>
    <script>
        // Runtime Helper
        function tampil(txt) { 
            let el = document.getElementById('output-lumpia');
            if(el) el.innerText = txt; 
        }
        ${clientScript}
    </script>
</body>
</html>`;
}
