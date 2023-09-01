import {describe, expect, it} from '@jest/globals';
import {NDBModel} from "./NDBModel";

describe('NDBModel ',  () => {
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

    class TestModel2  extends NDBModel {
        static TableName = "TestModel2";
        static getKeys() {
            return ["an_id", "a", "b"]
        }

        static getIndexKey() {
            return "an_id";
        }
    }

    it('NDBModel.constructor', async () => {
        const model = new NDBModel();
        expect(model instanceof NDBModel).toBe(true);
    });

    it('NDBModel.getKeys in NDBModel', async () => {
        expect(NDBModel.getKeys()).toStrictEqual([]);
    });

    it('NDBModel.getKeys in TestModel', async () => {
        expect(TestModel.getKeys()).toStrictEqual(["id", "a", "b"]);
    });

    it('NDBModel.getKeys in TestModel2', async () => {
        expect(TestModel2.getKeys()).toStrictEqual(["an_id", "a", "b"]);
    });


    it('NDBModel.getIndexKey TestModel2 instance constructor', async () => {
        const model = new TestModel2();
        // @ts-ignore
        expect(model.constructor.getIndexKey()).toBe("an_id");
    });

    it('NDBModel.getKeys TestModel2 instance constructor', async () => {
        const model = new TestModel2();
        // @ts-ignore
        expect(model.constructor.getKeys()).toStrictEqual([model.constructor.getIndexKey(), "a", "b"]);
    });

    it('NDBModel.getKeysWithoutIndex', async () => {
        const model = new TestModel();
        // @ts-ignore
        expect(model.constructor.getKeysWithoutIndex()).toStrictEqual(["a", "b"]);
    });

    it('NDBModel.TableName TestModel', async () => {
        const model = new TestModel();
        // @ts-ignore
        expect(model.constructor.TableName).toBe("TestModel");
    });

    it('NDBModel.TableName TestModel2', async () => {
        const model = new TestModel2();
        // @ts-ignore
        expect(model.constructor.TableName).toBe("TestModel2");
    });

    it('NDBModel.TableName TestModel', async () => {
        const model = new TestModel({
            id:1,
            a:"text a",
            b:"text b"
        });
        // @ts-ignore
        expect(model.asJson()).toStrictEqual({
            id:1,
            a:"text a",
            b:"text b"
        });
    });

    it('NDBModel.TableName TestModel', async () => {
        const model = new TestModel({
            id:1,
            a:"text a",
            b:"text b"
        });
        expect(model.a).toBe("text a");
    });

    it('NDBModel.TableName TestModel', async () => {
        const model = new TestModel({
            id:1,
            a:"text a",
            b:"text b"
        });
        // @ts-ignore
        const indexKey = model.constructor.getIndexKey();
        expect(model[indexKey]).toBe(1);
    });

})

