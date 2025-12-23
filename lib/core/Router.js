
// 2. ROUTER : Simpan Jalur
export const routes = [];

export const Jalan = {
    // Semarangan
    gawe: (path, action) => routes.push({ path, action, method: 'GET' }), 
    jupuk: (path, action) => routes.push({ path, action, method: 'GET' }), 
    kirim: (path, action) => routes.push({ path, action, method: 'POST' }),
    anyar: (path, action) => routes.push({ path, action, method: 'PUT' }),
    bucak: (path, action) => routes.push({ path, action, method: 'DELETE' }),

    // Internasional (Laravel-like)
    get: (path, action) => routes.push({ path, action, method: 'GET' }),
    post: (path, action) => routes.push({ path, action, method: 'POST' }),
    put: (path, action) => routes.push({ path, action, method: 'PUT' }),
    delete: (path, action) => routes.push({ path, action, method: 'DELETE' }),
};

// Global Router Container
global.LumpiaRouter = routes;
