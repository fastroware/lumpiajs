
// 2. ROUTER : Simpan Jalur
export const routes = [];

export const Jalan = {
    gawe: (path, action) => routes.push({ path, action, method: 'GET' }), // GET
    jupuk: (path, action) => routes.push({ path, action, method: 'GET' }), // Alias GET
    kirim: (path, action) => routes.push({ path, action, method: 'POST' }),
    anyar: (path, action) => routes.push({ path, action, method: 'PUT' }),
    bucak: (path, action) => routes.push({ path, action, method: 'DELETE' }),
};

// Global Router Container (for easy access in runtime)
global.LumpiaRouter = routes;
