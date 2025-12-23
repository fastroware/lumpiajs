import mysql from 'mysql2/promise';
import { loadEnv } from './Env.js';

let pool = null;

export class DB {
    static async connect() {
        if (pool) return pool;

        const env = loadEnv(process.cwd());
        
        if (!env.DB_HOST || !env.DB_USER || !env.DB_NAME) {
            return null;
        }

        try {
            pool = mysql.createPool({
                host: env.DB_HOST,
                user: env.DB_USER,
                password: env.DB_PASSWORD || '',
                database: env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            return pool;
        } catch (e) {
            console.error("❌ Gagal connect database:", e.message);
            return null;
        }
    }

    static async query(sql, params = []) {
        const p = await this.connect();
        if (!p) throw new Error("Database durung disetting nang .env!");
        try {
            const [rows, fields] = await p.execute(sql, params);
            return rows;
        } catch (e) {
            console.error("❌ SQL Error:", e.message);
            throw e;
        }
    }

    static table(tableName) {
        return new QueryBuilder(tableName);
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
        this.executed = false; // Flag to prevent double execution if method chaining is weird
    }

    // SELECT logic
    select(fields) {
        this.selects = fields;
        return this;
    }

    // WHERE logic
    where(col, op, val) {
        if (val === undefined) { val = op; op = '='; }
        this.conditions.push(`${col} ${op} ?`);
        this.bindings.push(val);
        return this;
    }

    orderBy(col, direction = 'ASC') {
        this.orderByRaw = `${col} ${direction}`;
        return this;
    }

    take(n) { // Alias for limit, Laravel style
        this.limitVal = n;
        return this;
    }

    // EKSEKUTOR (Disini logic query dijalankan)
    // Ubah nama method 'get' jadi 'get()' yang mengembalikan Promise<Array>
    async get() {
        let sql = `SELECT ${this.selects} FROM ${this.tableName}`;
        
        if (this.conditions.length > 0) {
            sql += ' WHERE ' + this.conditions.join(' AND ');
        }
        if (this.orderByRaw) {
            sql += ' ORDER BY ' + this.orderByRaw;
        }
        if (this.limitVal) {
            sql += ' LIMIT ' + this.limitVal;
        }
        return await DB.query(sql, this.bindings);
    }

    // Alias first() -> Ambil 1 data
    async first() {
        this.take(1);
        const rows = await this.get();
        return rows.length > 0 ? rows[0] : null;
    }

    // Insert
    async insert(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
        return await DB.query(sql, values);
    }

    // Update
    async update(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        
        let sql = `UPDATE ${this.tableName} SET ${setClause}`;
        if (this.conditions.length > 0) {
            sql += ' WHERE ' + this.conditions.join(' AND ');
        }
        return await DB.query(sql, [...values, ...this.bindings]);
    }

    // Delete
    async delete() {
        let sql = `DELETE FROM ${this.tableName}`;
        if (this.conditions.length > 0) {
            sql += ' WHERE ' + this.conditions.join(' AND ');
        }
        return await DB.query(sql, this.bindings);
    }
}
