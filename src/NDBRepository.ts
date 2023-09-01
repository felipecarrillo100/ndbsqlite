import {Database} from "sqlite3";

import {QueryInputs, QueryResult} from "./QueryResult";
import {INDBModel, NDBModel} from "./NDBModel";

export class NDBRepository<T> {
    private db: Database;
    private modelConstructor: INDBModel;

    constructor(options: {db: Database, model: INDBModel }) {
        this.db = options.db;
        this.modelConstructor = options.model;
        this.init();
    }

    init() {
    }

    public add(newRow: NDBModel) {
        const staticMethods = this.modelConstructor;
        return new Promise<number>((resolve, reject)=>{
            const values = staticMethods.getKeysWithoutIndex().map(k=>newRow[k]);
            const sql  = staticMethods.sqlInsert();
            this.db.run(sql, values,function (err){
                if (err) {
                    console.log(err);
                    reject(409);
                    return;
                }
                resolve(this.lastID);
            });
        })
    }

    public get(rowID: number) {
        const staticMethods = this.modelConstructor;
        return new Promise<T>((resolve, reject)=> {
            const sqlQuery  = staticMethods.sqlSelectByID();
            this.db.get(sqlQuery, [rowID], (err, row: any) => {
                if (err) {
                    reject(500);
                } else {
                    if (row) {
                        const newRow = new this.modelConstructor() as T;
                        for (const key of staticMethods.getKeys()) {
                            newRow[key] = row[key];
                        }
                        resolve(newRow);
                    } else {
                        reject(404);
                    }
                }
            });
        })
    }

    public delete(rowID: number) {
        const staticMethods = this.modelConstructor;
        return new Promise<boolean>((resolve, reject)=> {
            const sqlQuery  = staticMethods.sqlDeleteByID();
            this.db.get(sqlQuery, [rowID], function (err, row) {
                if (err) {
                    reject(500);
                } else {
                    resolve(true);
                }
            });
        })
    }

    public queryLikeGroup(options : QueryInputs) {
        const staticMethods = this.modelConstructor;
        return new Promise<QueryResult<T[]>>((resolve, reject)=> {
            const group = options.group ? options.group : "";
            const limit  = typeof options.limit !== "undefined" ? options.limit : 100;
            const offset  = typeof options.offset !== "undefined" ? options.offset : 0;
            const searchText = options.search ? `%${options.search}%` : "%%";
            const sortBy = options.sortBy ? options.sortBy : staticMethods.getIndexKey();
            const asc = options.asc;
            // sqlCountGroup
            const sqlCountAll = staticMethods.sqlCountAll();
            this.db.get(sqlCountAll, [], (err, total: any) => {
                if (err) {
                    console.log(err);
                    reject(400);
                    return;
                }
                const sqlCountGroup = staticMethods.sqlCountGroup();
                this.db.get(sqlCountGroup, [group], (err, groupCount: any) => {
                    if (err) {
                        console.log(err);
                        reject(400);
                        return;
                    }
                    const sqlSelectByGroupAndText = staticMethods.sqlSelectByGroupAndText();
                    const sqlCountMatches = staticMethods.SqlCountSelectQuery(sqlSelectByGroupAndText);
                    this.db.get(sqlCountMatches, [searchText, group], (err, matches: any) => {
                        if (err) {
                            console.log(err);
                            reject(400);
                            return;
                        }
                        const pagination = staticMethods.getPaginationSort(sortBy, asc);
                        const sqlQuery = sqlSelectByGroupAndText + pagination;
                        this.db.all(sqlQuery, [searchText, group, offset, limit], (err, rows) => {
                            if (err) {
                                console.log(err);
                                reject(400);
                                return;
                            }
                            const rowsRemapped = rows.map((row: any) => {
                                const newRow = new this.modelConstructor() as T;
                                for (const key of staticMethods.getKeys()) {
                                    newRow[key] = row[key];
                                }
                                return newRow
                            });
                            resolve({
                                total: total.counter,
                                group: groupCount.counter,
                                matches: matches.counter,
                                items: rowsRemapped,
                            });
                        });
                    });
                });
            })
        })
    }

    public queryLike(options : QueryInputs) {
        const staticMethods = this.modelConstructor;
        return new Promise<QueryResult<T[]>>((resolve, reject)=> {
            const limit  = typeof options.limit !== "undefined" ? options.limit : 100;
            const offset  = typeof options.offset !== "undefined" ? options.offset : 0;
            const searchText = options.search ? `%${options.search}%` : "%%";
            const sortBy = options.sortBy ? options.sortBy : staticMethods.getIndexKey();
            const asc = options.asc;
            const sqlCountAll = staticMethods.sqlCountAll();
            this.db.get(sqlCountAll, [], (err, total: any) => {
                if (err) {
                    console.log(err);
                    reject(400);
                    return;
                }
                const sqlSelectByText = staticMethods.sqlSelectByText();
                const sqlCountMatches = staticMethods.SqlCountSelectQuery(sqlSelectByText);
                this.db.get(sqlCountMatches, [searchText], (err, matches: any) => {
                    if (err) {
                        console.log(err);
                        reject(400);
                        return;
                    }
                    const pagination = staticMethods.getPaginationSort(sortBy, asc);
                    const sqlQuery = sqlSelectByText + pagination;
                    this.db.all(sqlQuery, [searchText, offset, limit], (err, rows) => {
                        if (err) {
                            console.log(err);
                            reject(400);
                            return;
                        }
                        const rowsRemapped = rows.map((row: any) => {
                            const newRow = new this.modelConstructor() as T;
                            for (const key of staticMethods.getKeys()) {
                                newRow[key] = row[key];
                            }
                            return newRow
                        });
                        resolve({
                            total: total.counter,
                            matches: matches.counter,
                            items: rowsRemapped
                        });
                    });
                });
            })
        })
    }

    public  query(options : QueryInputs) {
        const staticMethods = this.modelConstructor;
        return new Promise<T[]>((resolve, reject)=> {
            const limit  = typeof options.limit !== "undefined" ? options.limit : 100;
            const offset  = typeof options.offset !== "undefined" ? options.offset : 0;
            const searchText = options.search ? options.search : "";
            const sqlSelectByExactMatch = staticMethods.sqlSelectByExactMatch();
            const sqlQuery = sqlSelectByExactMatch + staticMethods.getPaginationSort();
            this.db.all(sqlQuery, [searchText, offset, limit], (err, rows) => {
                if (err) {
                    console.log(err);
                    reject(400);
                    return;
                }
                const rowsRemapped = rows.map((row:any) => {
                    const newRow = new this.modelConstructor() as T;
                    for (const key of staticMethods.getKeys()) {
                        newRow[key] = row[key];
                    }
                    return newRow;
                })
                resolve(rowsRemapped);
            });
        })
    }

    public replace(newRow: T) {
        const staticMethods = this.modelConstructor;
        return new Promise<number>((resolve, reject)=>{
            const indexKey = staticMethods.getIndexKey();
            if (typeof newRow[indexKey] !== "undefined") {
                const values = staticMethods.getKeysWithoutIndex().map(k=>newRow[k]);
                const sqlUpdateByID = staticMethods.sqlUpdateByID();
                this.db.run(sqlUpdateByID, [...values, newRow[indexKey]], function (err){
                    if (err) {
                        console.log(err);
                        reject(400);
                        return;
                    }
                    const id = newRow[indexKey] as number;
                    if (id===this.lastID) {
                        resolve(id);
                    } else {
                        reject(404)
                    }
                })
            } else {
                reject(400);
            }
        })

    }

    public update(newRow: T) {
        const staticMethods = this.modelConstructor;
        return new Promise<number>((resolve, reject)=> {
            const indexKey = staticMethods.getIndexKey();
            if (typeof newRow[indexKey] !== "undefined") {
                this.get(newRow[indexKey] as number).then((oldRow) => {
                    for (const key of staticMethods.getKeysWithoutIndex()) {
                        if (typeof newRow[key] !== "undefined") oldRow[key] = newRow[key];
                    }
                    const values = staticMethods.getKeysWithoutIndex().map(k=>oldRow[k]);
                    const sqlUpdateByID = staticMethods.sqlUpdateByID();
                    this.db.run(sqlUpdateByID, [...values, newRow[indexKey]], function (err) {
                        if (err) {
                            console.log(err);
                            reject(400);
                            return;
                        }
                        resolve(newRow[indexKey] as any);
                        const id = newRow[indexKey] as number;
                        if (id===this.lastID) {
                            resolve(id);
                        } else {
                            reject(400)
                        }
                    })
                },(code)=>{
                    reject(code)
                })
            } else {
                reject(400);
            }
        })
    }

}
