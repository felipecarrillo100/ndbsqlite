export type INDBModel = typeof NDBModel;

export class NDBModel {
    static TableName = "";

    static sqlCountAll() {
        const TableName = this.TableName;
        return `SELECT COUNT(*) AS counter FROM "${TableName}";`
    }

    static sqlCountGroup() {
        const TableName = this.TableName;
        const group = this.getGroupName();
        return `SELECT COUNT(*) AS counter FROM "${TableName}" WHERE "${group}"=?;`
    }

    static sqlInsert(){
        const TableName = this.TableName;
        return `INSERT INTO "${TableName}" (${this.getKeysWithoutIndex().join(',')}) VALUES(${this.getKeysWithoutIndex().map(e=>'?').join(',')});`
    }
    static sqlUpdateByID() {
        const TableName = this.TableName;
        const indexKey = this.getIndexKey();
        return `UPDATE "${TableName}" SET ${this.getKeysWithoutIndex().map(e=>e+"=?").join(',')} WHERE "${indexKey}"=?`;
    }
    static sqlSelectByID() {
        const TableName = this.TableName;
        const indexKey = this.getIndexKey();
        return `SELECT * FROM "${TableName}" WHERE "${indexKey}"=?;`
    }
    static sqlDeleteByID() {
        const TableName = this.TableName;
        const indexKey = this.getIndexKey();
        return `DELETE FROM "${TableName}" WHERE "${indexKey}"=?;`
    }
    static sqlSelectByText() {
        const TableName = this.TableName;
        const name = this.getTextSearchKey();
        return `SELECT * FROM "${TableName}" WHERE "${name}" LIKE ?`
    }

    static sqlSelectByTextAndMatch(matches: string[]) {
        const TableName = this.TableName;
        const name = this.getTextSearchKey();
        const sql = `SELECT * FROM "${TableName}" WHERE "${name}" LIKE ?`
        if (matches.length===0) return sql;
        const queries = [];
        const validKeys = this.getKeysWithoutIndex();
        for (const key of matches) {
            if (validKeys.includes(key)) {
                queries.push(`"${key}"=?`);
            }
        }
        const matchQuery = queries.join(" AND ");
        return `${sql} AND ${matchQuery}`;
    }

    static sqlSelectByGroupAndText() {
        const sql = this.sqlSelectByText();
        const group = this.getGroupName();
        return `${sql} AND "${group}"=?`
    }

    static sqlCleanQuery(match?: {[key:string]: any}) {
        if (typeof match === "undefined") {
            return {keys: [], values: []}
        }
        const cleanQuery:string[] = [];
        const cleanValues:any[] = [];
        const validKeys = this.getKeysWithoutIndex();
        for (const key in match) {
            if (validKeys.includes(key)) {
                cleanQuery.push(key);
                cleanValues.push(match[key]);
            }
        };
        return {
            keys: cleanQuery,
            values: cleanValues
        }
    }
    static sqlSelectByGroupAndTextAndMatch(matches: string[]) {
        const sql = this.sqlSelectByText();
        const group = this.getGroupName();
        const queries = [`"${group}"=?`];
        const validKeys = this.getKeysWithoutIndex();
        for (const key of matches) {
            if (validKeys.includes(key)) {
                queries.push(`"${key}"=?`);
            }
        }
        const matchQuery = queries.join(" AND ");
        return `${sql} AND ${matchQuery}`;
    }

    static getPaginationSort(sortBy?: string, asc?: boolean) {
        const Paginate = " LIMIT ?, ?"
        if (!sortBy) return Paginate;
        const keys = [...this.getKeys()];
        if (keys.includes(sortBy)) {
            if (typeof asc !== "undefined" && asc === false ) return ` ORDER BY ${sortBy} DESC ${Paginate}`;
            return ` ORDER BY ${sortBy} ASC ${Paginate}`;
        }
        return Paginate;
    }
    static sqlSelectByExactMatch() {
        const TableName = this.TableName;
        const name = this.getTextSearchKey();
        return `SELECT * FROM "${TableName}" WHERE "${name}"=?`
    }

    static SqlCountSelectQuery(selectQuery: string) {
        let r = selectQuery;
        if (selectQuery.trim().startsWith("SELECT *")) {
            r = selectQuery.replace("SELECT *", "SELECT COUNT(*) AS counter")
        }
        return r;
    }


    static getKeys() {
        return [] as string [];
    }

    static getIndexKey() {
        return "id";
    }

    static getTextSearchKey() {
        return "";
    }

    static getGroupName() {
        return "";
    }

    static getKeysWithoutIndex() {
        const keys = [...this.getKeys()];
        const index =  keys.findIndex(k=>k===this.getIndexKey());
        if (index<0) return keys;
        keys.splice(index, 1);
        return keys;
    }

    public asJson() {
        const json = {};
        // @ts-ignore
        const keys = this.constructor.getKeys();
        for (const key of keys) {
            json[key] = this[key];
        }
        return json
    }

}
