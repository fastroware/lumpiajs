#!/usr/bin/env node
import fs from "fs";
import path from "path";
import http from "http";

// --- KAMUS BAHASA SEMARANG ---
const dictionary = [
  { asal: /<lump>/g, jadi: "" },
  { asal: /<\/lump>/g, jadi: "" },
  { asal: /ono\s/g, jadi: "let " },
  { asal: /paten\s/g, jadi: "const " },
  { asal: /gawe\s/g, jadi: "function " },
  { asal: /yen\s/g, jadi: "if " },
  { asal: /liyane/g, jadi: "else" },
  { asal: /mandek;/g, jadi: "return;" },
  { asal: /ora\s/g, jadi: "!" },
  { asal: /panjang\(/g, jadi: "len(" },
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

// --- FUNGSI MASAK (COMPILE) ---
function masak(srcDir, distDir) {
  if (!fs.existsSync(srcDir)) return false;
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

  const files = fs.readdirSync(srcDir).filter((file) => file.endsWith(".lmp"));
  let successCount = 0;

  files.forEach((file) => {
    try {
      let content = fs.readFileSync(path.join(srcDir, file), "utf-8");

      const matchKulit = content.match(/<kulit>([\s\S]*?)<\/kulit>/);
      const matchIsi = content.match(/<isi>([\s\S]*?)<\/isi>/);
      const matchKlambi = content.match(/<klambi>([\s\S]*?)<\/klambi>/);

      let htmlnya = matchKulit ? matchKulit[1] : "";
      let logicnya = matchIsi ? matchIsi[1] : "";
      let cssnya = matchKlambi ? matchKlambi[1] : "";

      dictionary.forEach(
        (kata) => (logicnya = logicnya.replace(kata.asal, kata.jadi))
      );

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

      const namaFileBaru = file.replace(".lmp", ".html");
      fs.writeFileSync(path.join(distDir, namaFileBaru), hasil);
      successCount++;
    } catch (err) {
      console.error(`❌ Gagal masak file ${file}:`, err.message);
    }
  });

  return successCount;
}

async function main() {
  const args = process.argv.slice(2);
  const perintah = args[0]; // misal: 'create-project' atau 'goreng'
  const parameter = args[1]; // misal: 'tokoku'

  // --- FITUR 1: Bikin Project Baru ---
  if (perintah === "create-project" || perintah === "buka-cabang") {
    const namaProject = parameter;

    if (!namaProject) {
      console.log("❌ Eh, jeneng project-e opo?");
      console.log("Contoh: lumpia create-project warung-baru");
      return;
    }

    const projectPath = path.join(process.cwd(), namaProject);
    const srcPath = path.join(projectPath, "src");

    if (fs.existsSync(projectPath)) {
      console.log(
        `⚠️ Waduh, folder "${namaProject}" wis ono, Bro. Ganti jeneng liyo.`
      );
      return;
    }

    console.log(`🔨 Lagi nyiapke lahan kanggo "${namaProject}"...`);

    fs.mkdirSync(projectPath);
    fs.mkdirSync(srcPath);
    fs.writeFileSync(path.join(srcPath, "app.lmp"), boilerplateCode);

    console.log("✅ Siap, Juragan! Project wis dadi.");
    console.log("-------------------------------------------");
    console.log(`cd ${namaProject}`);
    console.log("lumpia dodolan (kanggo njalanke)");
    console.log("-------------------------------------------");
  }

  // --- FITUR 2: Compile (Goreng) ---
  else if (perintah === "goreng") {
    console.log("🍳 Sik, lagi nggoreng kodingan...");
    const count = masak("./src", "./dist");
    if (count !== false) {
      console.log(`✅ Wis mateng! (${count} file masuk ke folder dist)`);
    } else {
      console.log(
        "❌ Folder src ora ono! (Coba: lumpia create-project namaproject)"
      );
    }
  }

  // --- FITUR 3: Serve (Dodolan) ---
  else if (perintah === "dodolan" || perintah === "serve") {
    const srcDir = "./src";
    const distDir = "./dist";
    const port = 3000;

    console.log("🍳 Nyiapke dagangan...");
    masak(srcDir, distDir);

    // Watcher (Nginjen)
    console.log("👀 Nginceng folder src (Auto-goreng aktif)...");
    let fsWait = false;
    fs.watch(srcDir, (event, filename) => {
      if (filename && filename.endsWith(".lmp")) {
        if (fsWait) return;
        fsWait = setTimeout(() => {
          fsWait = false;
        }, 100);

        console.log(`🔥 Ono perubahan nang ${filename}, goreng ulang..`);
        masak(srcDir, distDir);
      }
    });

    // Server
    const server = http.createServer((req, res) => {
      let filePath = path.join(
        distDir,
        req.url === "/" ? "index.html" : req.url
      );
      const extname = path.extname(filePath);
      let contentType = "text/html";

      switch (extname) {
        case ".js":
          contentType = "text/javascript";
          break;
        case ".css":
          contentType = "text/css";
          break;
        case ".json":
          contentType = "application/json";
          break;
        case ".png":
          contentType = "image/png";
          break;
        case ".jpg":
          contentType = "image/jpg";
          break;
      }

      fs.readFile(filePath, (error, content) => {
        if (error) {
          if (error.code == "ENOENT") {
            fs.readFile(
              path.join(distDir, "index.html"),
              (err, indexContent) => {
                if (err) {
                  res.writeHead(404);
                  res.end(`Maaf, dagangan "${req.url}" ora ono.`);
                } else {
                  // Fallback ke index.html (SPA like behavior, optional)
                  res.writeHead(200, { "Content-Type": "text/html" });
                  res.end(indexContent, "utf-8");
                }
              }
            );
          } else {
            res.writeHead(500);
            res.end("Waduh, kompor meleduk (Server Error): " + error.code);
          }
        } else {
          res.writeHead(200, { "Content-Type": contentType });
          res.end(content, "utf-8");
        }
      });
    });

    server.listen(port, () => {
      console.log(`\n🏪 Warung wis buka! (Server Running)`);
      console.log(`👉 http://localhost:${port}`);
      console.log(`(Tekan Ctrl+C kanggo tutup warung)`);
    });
  } else {
    console.log("Perintah ora dikenal.");
    console.log("1. lumpia buka-cabang <nama>");
    console.log("2. lumpia dodolan (serve)");
    console.log("3. lumpia goreng (compile only)");
  }
}

main();
