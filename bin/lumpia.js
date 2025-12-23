#!/usr/bin/env node
import { createProject } from '../lib/commands/create.js';
import { serveProject } from '../lib/commands/serve.js';
import { buildProject } from '../lib/commands/build.js'; // Import build

async function main() {
    const args = process.argv.slice(2);
    const perintah = args[0];
    const parameter = args[1];

    if (perintah === 'create-project' || perintah === 'buka-cabang') {
        createProject(parameter);
    } 
    else if (perintah === 'dodolan' || perintah === 'serve' || perintah === 'kukus') {
        serveProject();
    }
    else if (perintah === 'goreng' || perintah === 'build') {
        buildProject(); // Activate functionality
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
