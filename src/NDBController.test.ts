import express, {Express, Router} from "express";
import request from "supertest";
import {describe, expect, it} from '@jest/globals';
import {NDBModel} from "./NDBModel";
import {NDBSqLite} from "./NDBSqLite";
import {NDBController} from "./NDBController";
import {Database} from "sqlite3";

const PORT = 3601;
const URL = "http://localhost:"+PORT;
const ROUTE = "/test"
describe('NDBController ',  () => {
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

        constructor(options?:{id?: number, a: string, b: string, g:number}) {
            super();
            this._id = options?.id;
            this._a = options?.a;
            this._b = options?.b;
            this._g = options?.g;
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

    it('NDBSqLite post get', async () => {
        const db = await ndbSqlite.init("./sql/dbschema.sql");
        const controller = new NDBController<TestModel>({db, model: TestModel});

        const app = express();
        app.use(express.json());

        const router = Router()
        controller.addRoutes(router);

        app.use(ROUTE, router);

        const server = await startToPromise(app, db) as any;
        const urlRequest = URL ;

        const payload = {a:"test1", b:"second", g:1}
        const index = JSON.parse((await request(urlRequest).post(ROUTE).send(payload)).text);
        const entry = JSON.parse((await request(urlRequest).get(`${ROUTE}/${index}`)).text);

        db.close();
        server.close();
        expect(entry).toStrictEqual({id: index, ...payload});
    });

    it('NDBSqLite post query', async () => {
        const db = await ndbSqlite.init("./sql/dbschema.sql");
        const controller = new NDBController<TestModel>({db, model: TestModel});

        const app = express();
        app.use(express.json());

        const router = Router()
        controller.addRoutes(router);

        app.use(ROUTE, router);

        const server = await startToPromise(app, db) as any;
        const urlRequest = URL ;

        const payload = {a:"test1", b:"second", g:1}
        const index = JSON.parse((await request(urlRequest).post(ROUTE).send(payload)).text);
        const entry = JSON.parse((await request(urlRequest).get(`${ROUTE}`)).text);

        db.close();
        server.close();
        expect(entry.total).toBeGreaterThan(0);
    });

    it('NDBSqLite post query match', async () => {
        const db = await ndbSqlite.init("./sql/dbschema.sql");
        const controller = new NDBController<TestModel>({db, model: TestModel});

        const app = express();
        app.use(express.json());

        const router = Router()
        controller.addRoutes(router);

        app.use(ROUTE, router);

        const server = await startToPromise(app, db) as any;
        const urlRequest = URL ;

        const payload = {a:"test1", b:"exact", g:1}
        const index = JSON.parse((await request(urlRequest).post(ROUTE).send(payload)).text);
        const entry = JSON.parse((await request(urlRequest).get(`${ROUTE}?[query][b]=exact`)).text);

        db.close();
        server.close();
        expect(entry.items[0].b).toBe(payload.b);
    });

    it('NDBSqLite post query group match', async () => {
        const db = await ndbSqlite.init("./sql/dbschema.sql");
        const controller = new NDBController<TestModel>({db, model: TestModel});

        const app = express();
        app.use(express.json());

        const router = Router()
        controller.addRoutes(router);

        app.use(ROUTE, router);

        const server = await startToPromise(app, db) as any;
        const urlRequest = URL ;

        const GROUP = 2;
        const payload = {a:"test1", b:"exact", g:GROUP}
        const index = JSON.parse((await request(urlRequest).post(ROUTE).send(payload)).text);
        const entry = JSON.parse((await request(urlRequest).get(`${ROUTE}/group/${GROUP}?[query][b]=exact`)).text);

        db.close();
        server.close();
        expect(entry.items[0].b).toBe(payload.b);
    });

})

function startToPromise(app: Express, db: Database) {
    return new Promise(resolve=>{
        const server =app.listen(PORT, ()=> {
            resolve(server);
        })
    })
}
