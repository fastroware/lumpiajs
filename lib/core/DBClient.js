export class DB {
    static async query(sql, params = []) {
        // Cek mode: Node.js (Server) atau Browser (Client - Build HTML)
        if (typeof window === 'undefined') {
            // --- SERVER SIDE (NODE) ---
            // Import native mysql driver dynamically to avoid bundle errors in browser
            const { createPool } = await import('mysql2/promise');
             // ... logic koneksi nodejs lama ...
             return []; // placeholder
        } else {
            // --- CLIENT SIDE (BROWSER) ---
            // Tembak ke file PHP Bridge
            const response = await fetch('/api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql, params })
            });
            const json = await response.json();
            if(json.status === 'error') throw new Error(json.message);
            return json.data;
        }
    }
    
    static table(name) {
        return new QueryBuilder(name);
    }
}

class QueryBuilder {
    constructor(table) {
        this.tableName = table;
        this.conditions = [];
        this.bindings = [];
        this.selects = '*';
        this.limitVal = null;
        this.orderByRaw = null;
    }
    
    select(fields) { this.selects = fields; return this; }
    where(col, op, val) { if (val === undefined) { val = op; op = '='; } this.conditions.push(`${col} ${op} ?`); this.bindings.push(val); return this; }
    orderBy(col, dir='ASC') { this.orderByRaw = `${col} ${dir}`; return this; }
    take(n) { this.limitVal = n; return this; }

    async get() {
        let sql = `SELECT ${this.selects} FROM ${this.tableName}`;
        if (this.conditions.length > 0) sql += ' WHERE ' + this.conditions.join(' AND ');
        if (this.orderByRaw) sql += ' ORDER BY ' + this.orderByRaw;
        if (this.limitVal) sql += ' LIMIT ' + this.limitVal;
        
        return await DB.query(sql, this.bindings);
    }
    
    // ... insert/update/delete logic similar ...
}
