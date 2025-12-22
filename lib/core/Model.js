// 1. MODEL (Eloquent-like)
export class LumpiaModel {
    constructor(data = []) {
        this.data = data;
    }

    static use(jsonData) {
        return new LumpiaModel(jsonData);
    }

    // Ambil kabeh data
    kabeh() {
        return this.data;
    }

    // Filter cari (where)
    dimana(key, operator, value) {
        if (value === undefined) { value = operator; operator = '=='; }
        
        const filtered = this.data.filter(item => {
            if (operator === '==') return item[key] == value;
            if (operator === '>') return item[key] > value;
            if (operator === '<') return item[key] < value;
            if (operator === '>=') return item[key] >= value;
            if (operator === '<=') return item[key] <= value;
            if (operator === '!=') return item[key] != value;
            return false;
        });
        return new LumpiaModel(filtered);
    }

    // Ambil satu (first)
    siji() {
        return this.data[0] || null;
    }

    // Return raw array
    jupuk() {
        return this.data;
    }
}
