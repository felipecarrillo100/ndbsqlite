import {Database} from "sqlite3";
import * as fs from "fs";
interface NDBSqLiteConstructorOptions {
    filePath: string
}

export class NDBSqLite {
    private filePath: string;
    private db: Database;

    constructor(options: NDBSqLiteConstructorOptions) {
        this.filePath = options.filePath;
    }

    private connect() {
        const db = new Database(this.filePath);
        return db;
    }

    public init(pathToSchema?: string) {
        return new Promise<Database>((resolve, reject) => {
            this.db = this.connect();
            this.db.get("PRAGMA foreign_keys = ON", (err, row)=>{
                if (err) {
                    return console.error(err.message);
                }
                this.db.get("PRAGMA foreign_keys", (err, row: any)=>{
                    if (err) {
                        reject();
                        return console.error(err.message);
                    }
                    if (pathToSchema) {
                        this.loadInitialSchema(pathToSchema).then(()=>{
                            resolve(this.db);
                        }, (err)=> {
                            reject(err);
                        })
                    } else {
                        resolve(this.db);
                    }
                });
            });
        })
    }

    public loadInitialSchema(pathToSchema: string) {
        return new Promise<void>((resolve, reject) => {
            const sql = fs.readFileSync(pathToSchema).toString();
            return this.db.exec(sql, (err:Error)=> {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            });
        })

    }
}
