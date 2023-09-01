import {describe, expect, it} from '@jest/globals';
import {NDBModel} from "./NDBModel";
import {NDBSqLite} from "./NDBSqLite";
import {NDBRepository} from "./NDBRepository";
import {Database} from "sqlite3";
import * as fs from "fs";
import Path from "path";

describe('NDBRepository ',  () => {
    class TestModel extends NDBModel {
        static TableName = "TestModel";

        private _id: number;
        private _a: string;
        private _b: string;

        constructor(options?:{id: number, a: string, b: string}) {
            super();
            this._id = options?.id;
            this._a = options?.a;
            this._b = options?.b;
        }

        get id(): number {
            return this._id;
        }

        set id(value: number) {
            this._id = value;
        }

        get a(): string {
            return this._a;
        }

        set a(value: string) {
            this._a = value;
        }

        get b(): string {
            return this._b;
        }

        set b(value: string) {
            this._b = value;
        }

        static getKeys() {
            return ["id", "a", "b"];
        }

    }

    const ndbSqlite = new NDBSqLite({filePath:"ndb.db.sqlite"});

    it('ndbSqlite instance', async () => {
        expect(ndbSqlite instanceof NDBSqLite).toBe(true);
    });

    it('NDBSqLite instanceof Database', async () => {
        return ndbSqlite.init("./sql/dbschema.sql").then(db => {
            expect(db instanceof Database).toBe(true);
        }, (err)=>{
            expect(true).toBe(false);
        })
    });

    it('NDBSqLite db file created', async () => {
        return ndbSqlite.init("./sql/dbschema.sql").then(db => {
            const Path = require('path')
            const path = Path.join(__dirname, "../ndb.db.sqlite");
            const  exist = fs.existsSync(path);
            expect(exist).toBe(true);
        }, (err)=>{
            expect(true).toBe(false);
        })
    });


})

