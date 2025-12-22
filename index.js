#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// --- KAMUS BAHASA SEMARANG ---
const dictionary = [
    { asal: /<lump>/g, jadi: '' },
    { asal: /<\/lump>/g, jadi: '' },
    { asal: /ono\s/g, jadi: 'let ' },
    { asal: /paten\s/g, jadi: 'const ' },
    { asal: /gawe\s/g, jadi: 'function ' },
    { asal: /yen\s/g, jadi: 'if ' },
    { asal: /liyane/g, jadi: 'else' },
    { asal: /mandek;/g, jadi: 'return;' },
    { asal: /ora\s/g, jadi: '!' },
    { asal: /panjang\(/g, jadi: 'len(' },
];

const runtimeScript = `
<script>
    function ambil(sel) { return document.querySelector(sel).value; }
    function tampil(txt) { 
        let el = document.getElementById('output-lumpia');
        if(el) el.innerText = txt;
        else alert(txt);
    }
    function len(x) { return x.length; }
</script>
`;

// --- TEMPLATE PROJECT BARU ---
const boilerplateCode = `<lump>
  <klambi>
    h1 { color: #d35400; font-family: sans-serif; }
    button { padding: 10px 20px; background: #2ecc71; border: none; color: white; cursor: pointer; }
    button:hover { background: #27ae60; }
  </klambi>

  <kulit>
    <h1>Sugeng Rawuh di LumpiaJS</h1>
    <p>Project anyar siap dimasak!</p>
    <button onclick="sapa()">Pencet Aku</button>
  </kulit>

  <isi>
    gawe sapa() {
       tampil("Halo! Iki project pertamamu, Bro!");
    }
  </isi>
</lump>`;

async function main() {
    const args = process.argv.slice(2);
    const perintah = args[0];       // misal: 'create-project' atau 'goreng'
    const parameter = args[1];      // misal: 'tokoku'

    // --- FITUR 1: Bikin Project Baru ---
    if (perintah === 'create-project' || perintah === 'buka-cabang') {
        const namaProject = parameter;

        if (!namaProject) {
            console.log('❌ Eh, jeneng project-e opo?');
            console.log('Contoh: lumpia create-project warung-baru');
            return;
        }

        const projectPath = path.join(process.cwd(), namaProject);
        const srcPath = path.join(projectPath, 'src');

        if (fs.existsSync(projectPath)) {
            console.log(`⚠️ Waduh, folder "${namaProject}" wis ono, Bro. Ganti jeneng liyo.`);
            return;
        }

        console.log(`🔨 Lagi nyiapke lahan kanggo "${namaProject}"...`);
        
        // 1. Bikin Folder Utama
        fs.mkdirSync(projectPath);
        
        // 2. Bikin Folder src
        fs.mkdirSync(srcPath);

        // 3. Tulis file contoh (Boilerplate)
        fs.writeFileSync(path.join(srcPath, 'app.lmp'), boilerplateCode);

        console.log('✅ Siap, Juragan! Project wis dadi.');
        console.log('-------------------------------------------');
        console.log(`cd ${namaProject}`);
        console.log('lumpia goreng');
        console.log('-------------------------------------------');
    } 
    
    // --- FITUR 2: Compile (Goreng) ---
    else if (perintah === 'goreng') {
        console.log('🍳 Sik, lagi nggoreng kodingan...');
        const srcDir = './src';
        const distDir = './dist';

        if (!fs.existsSync(srcDir)) return console.log('❌ Folder src ora ono! (Coba: lumpia create-project namaproject)');
        if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

        const files = fs.readdirSync(srcDir).filter(file => file.endsWith('.lmp'));

        files.forEach(file => {
            let content = fs.readFileSync(path.join(srcDir, file), 'utf-8');

            const matchKulit = content.match(/<kulit>([\s\S]*?)<\/kulit>/);
            const matchIsi = content.match(/<isi>([\s\S]*?)<\/isi>/);
            const matchKlambi = content.match(/<klambi>([\s\S]*?)<\/klambi>/);

            let htmlnya = matchKulit ? matchKulit[1] : '';
            let logicnya = matchIsi ? matchIsi[1] : '';
            let cssnya = matchKlambi ? matchKlambi[1] : '';

            dictionary.forEach(kata => logicnya = logicnya.replace(kata.asal, kata.jadi));

            const hasil = `<!DOCTYPE html>
<html>
<head>
    <title>Lumpia App</title>
    <style>body{font-family:sans-serif;padding:20px;} ${cssnya}</style>
</head>
<body>
    ${htmlnya}
    <div id="output-lumpia" style="margin-top:20px; font-weight:bold;"></div>
    ${runtimeScript}
    <script>${logicnya}</script>
</body>
</html>`;

            const namaFileBaru = file.replace('.lmp', '.html');
            fs.writeFileSync(path.join(distDir, namaFileBaru), hasil);
            console.log(`✅ Mateng: dist/${namaFileBaru}`);
        });
    } else {
        console.log('Perintah ora dikenal.');
        console.log('1. lumpia create-project <nama>');
        console.log('2. lumpia goreng');
    }
}

main();