#!/usr/bin/env node
import { createProject } from '../lib/commands/create.js';
import { serveProject } from '../lib/commands/serve.js';

async function main() {
    const args = process.argv.slice(2);
    const perintah = args[0];
    const parameter = args[1];

    if (perintah === 'create-project' || perintah === 'buka-cabang') {
        createProject(parameter);
    } 
    else if (perintah === 'dodolan' || perintah === 'serve') {
        serveProject();
    }
    else if (perintah === 'goreng') {
        console.log("🚧 Fitur 'goreng' saiki wis otomatis digabung karo 'dodolan' via JIT Compiler MVC.");
        console.log("   Silakan gunake: lumpia dodolan");
    }
    else {
        console.log('Perintah ora dikenal.');
        console.log('------------------------------------------------');
        console.log('1. lumpia create-project <nama> (Bikin project)');
        console.log('2. lumpia dodolan               (Jalanin server)');
        console.log('------------------------------------------------');
    }
}

main();
