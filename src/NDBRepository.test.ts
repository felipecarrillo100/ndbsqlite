import {describe, expect, it} from '@jest/globals';
import {NDBModel} from "./NDBModel";
import {NDBSqLite} from "./NDBSqLite";
import {NDBRepository} from "./NDBRepository";
import {Database} from "sqlite3";
import * as fs from "fs";
import Path from "path";

describe('NDBRepository ',  () => {
    class TestModel extends NDBModel {
        get g(): number {
            return this._g;
        }

        set g(value: number) {
            this._g = value;
        }
        static TableName = "TestModel";

        private _id: number;
        private _a: string;
        private _b: string;
        private _g: number;

        constructor(options?:{id?: number, a: string, b: string, g: number}) {
            super();
            this._id = options?.id;
            this._a = options?.a;
            this._b = options?.b;
            this._g = options?.g
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
            return ["id", "a", "b", "g"];
        }

        static getTextSearchKey() {
            return "a";
        }

        static getGroupName() {
            return "g";
        }


    }

    const ndbSqlite = new NDBSqLite({filePath:"ndb.db.sqlite"});

    it('ndbSqlite instance', async () => {
        expect(ndbSqlite instanceof NDBSqLite).toBe(true);
    });

    it('NDBSqLite instanceof Database', async () => {
        return ndbSqlite.init("./sql/dbschema.sql").then(db => {
            db.close();
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
            db.close();
            expect(exist).toBe(true);
        }, (err)=>{
            expect(true).toBe(false);
        })
    });

    it('NDBSqLite post get', async () => {
        const db = await ndbSqlite.init("./sql/dbschema.sql");
        const repository = new NDBRepository<TestModel>({db, model: TestModel});

        const inputs = {a:"abc", b:"def", g:1};
        const index = await repository.add(new TestModel(inputs));
        const entry=await repository.get(index);
        expect(entry.asJson()).toStrictEqual({id: index, ...inputs });
        db.close();
    });

    it('NDBSqLite queryLike', async () => {
        const db = await ndbSqlite.init("./sql/dbschema.sql");
        const repository = new NDBRepository<TestModel>({db, model: TestModel});

        const matches = await repository.queryLike({});
        expect(typeof matches.total !== "undefined" && typeof matches.matches !== "undefined").toStrictEqual(true);
        db.close();
    });

    it('NDBSqLite queryLike Group', async () => {
        const db = await ndbSqlite.init("./sql/dbschema.sql");
        const repository = new NDBRepository<TestModel>({db, model: TestModel});
        const inputs1 = {a:"abc", b:"exact match",g:1};
        const index = await repository.add(new TestModel(inputs1));
        const matches = await repository.queryLikeGroup({group:1, query: {b:"exact match"}});
        expect(matches.items[0].b).toBe(inputs1.b);
        db.close();
    });

    it('NDBSqLite post put', async () => {
        const db = await ndbSqlite.init("./sql/dbschema.sql");
        const repository = new NDBRepository<TestModel>({db, model: TestModel});

        const inputs1 = {a:"abc", b:"before", g:2};
        const index = await repository.add(new TestModel(inputs1));
        const inputs2 = {a:"xyz", b:"after", g: 2}
        const index2 = await repository.replace(new TestModel({id: index, ...inputs2}));
        const entry=await repository.get(index2);
        expect(entry.asJson()).toStrictEqual({id: index, ...inputs2 });
        db.close();
    });

    it('NDBSqLite post patch', async () => {
        const db = await ndbSqlite.init("./sql/dbschema.sql");
        const repository = new NDBRepository<TestModel>({db, model: TestModel});

        const inputs1 = {a:"abc", b:"before", g: 3};
        const index = await repository.add(new TestModel(inputs1));
        const inputs2 = { b:"after"}
        const index2 = await repository.update(new TestModel({id: index, a: undefined,g:undefined, ... inputs2}));
        const entry=await repository.get(index2);
        expect(entry.asJson()).toStrictEqual({id: index, ...inputs1, ...inputs2});
        db.close();
    });

    it('NDBSqLite delete', async () => {
        const db = await ndbSqlite.init("./sql/dbschema.sql");
        const repository = new NDBRepository<TestModel>({db, model: TestModel});

        const matches = await repository.queryLike({});
        if (matches.total>0) {
            for (const item of matches.items) {
                const deleted = await repository.delete(item.id);
            }
        }
        const matchesAfterDelete = await repository.queryLike({});
        expect(matchesAfterDelete.total ).toStrictEqual(0);
        db.close();
    });

})

