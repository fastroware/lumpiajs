#!/usr/bin/env node
import { createProject } from '../lib/commands/create.js';
import { serveProject } from '../lib/commands/serve.js';

async function main() {
    const args = process.argv.slice(2);
    const perintah = args[0];
    const parameter = args[1];

    // ALIAS LIST
    // create-project : buka-cabang
    // serve : dodolan, kukus
    // build : goreng

    if (perintah === 'create-project' || perintah === 'buka-cabang') {
        createProject(parameter);
    } 
    else if (perintah === 'dodolan' || perintah === 'serve' || perintah === 'kukus') {
        serveProject();
    }
    else if (perintah === 'goreng' || perintah === 'build') {
        console.log("🚧 Fitur 'goreng' (build) saiki wis otomatis digabung karo 'kukus' (serve) via JIT Compiler MVC.");
        console.log("   Silakan gunake: lumpia kukus (atau lumpia serve)");
    }
    else {
        console.log('Perintah ora dikenal / Command not recognized.');
        console.log('------------------------------------------------');
        console.log('1. lumpia create-project <nama>  (Alias: buka-cabang)');
        console.log('2. lumpia serve                  (Alias: kukus, dodolan)');
        console.log('3. lumpia build                  (Alias: goreng)');
        console.log('------------------------------------------------');
    }
}

main();
