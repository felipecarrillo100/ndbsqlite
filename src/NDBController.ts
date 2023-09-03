import {Express, Router} from "express";
import {Database} from "sqlite3";
import {NDBRepository} from "./NDBRepository";
import {INDBModel, NDBModel} from "./NDBModel";

export class NDBController<T> {
    private repository: NDBRepository<T>;
    private modelConstructor: INDBModel;
    private readOnly: boolean;

    constructor(options: {db: Database, model: INDBModel, readOnly?: boolean}) {
        this.readOnly = options.readOnly;
        this.modelConstructor = options.model;
        this.repository = new NDBRepository<T>({db:options.db, model:options.model});
    }

    addRoutes(anApp: Express | Router, ) {
        const app = anApp as Express;

        app.get("/", ((req, res) => {
            const search = req.query.search as string;
            const limit = typeof req.query.limit !== "undefined" ? Number(req.query.limit) : undefined;
            const offset = typeof req.query.offset !== "undefined" ? Number(req.query.offset) : undefined;
            const sortBy = req.query.sortBy as string;
            const asc = typeof req.query.sort === "undefined" ? true : req.query.sort.toString().toUpperCase() !== "DESC";
            const query = req.query.query as {[key:string]: any};
            this.repository.queryLike({search, limit, offset, sortBy, asc, query}).then((queryResult) => {
                const output = {
                    total: queryResult.total,
                    matches: queryResult.matches,
                    items: queryResult.items.map( (e:T) => (e as NDBModel).asJson()),
                }
                res.json(output)
            }).catch(()=>{
                res.status(500);
                res.json([])
            })
        }))

        app.get("/group/:group", ((req, res) => {
            const group = Number(req.params.group);
            const search = req.query.search as string;
            const limit = typeof req.query.limit !== "undefined" ? Number(req.query.limit) : undefined;
            const offset = typeof req.query.offset !== "undefined" ? Number(req.query.offset) : undefined;
            const sortBy = req.query.sortBy as string;
            const asc = typeof req.query.sort === "undefined" ? true : req.query.sort.toString().toUpperCase() !== "DESC";
            const query = req.query.query as {[key:string]: any};
            this.repository.queryLikeGroup({group, search, limit, offset, sortBy, asc, query}).then((queryResult) => {
                const output = {
                    total: queryResult.total,
                    group: queryResult.group,
                    matches: queryResult.matches,
                    items: queryResult.items.map( (e:T) => (e as NDBModel).asJson()),
                }
                res.json(output)
            }).catch(()=>{
                res.status(500);
                res.json([])
            })
        }))

        app.get("/match/:name", ((req, res) => {
            const name = req.params.name;
            const limit = typeof req.query.limit !== "undefined" ? Number(req.query.limit) : undefined;
            const offset = typeof req.query.offset !== "undefined" ? Number(req.query.offset) : undefined;
            this.repository.query({search:name, limit, offset}).then((entries) => {
                res.json(entries.map(e=>(e as NDBModel).asJson()))
            }).catch(()=>{
                res.status(500);
                res.json([])
            })
        }))

        app.get("/:id", ((req, res) => {
            const id = Number(req.params.id);
            this.repository.get(id).then((entry) => {
                res.json((entry as NDBModel).asJson());
            }, (code: number)=>{
                res.status(code);
                res.json([])
            })
        }))

        if (!this.readOnly) {
            app.delete("/:id", ((req, res) => {
                const id = Number(req.params.id);
                this.repository.delete(id).then((success) => {
                    res.status(200);
                    res.json(success)
                }, (code: number)=>{
                    res.status(code);
                    res.json([])
                })
            }))

            app.post("", ((req, res) => {
                const entry = new this.modelConstructor();
                const staticMethods = this.modelConstructor;

                const keys = staticMethods.getKeysWithoutIndex();
                for (const key of keys) {
                    entry[key] = req.body[key];
                }
                this.repository.add(entry).then((id: number)=>{
                    res.status(200);
                    res.json(id);
                }).catch((code)=>{
                    res.status(code);
                    res.json([]);
                });
            }))

            app.put("/:id", ((req, res) => {
                const id = Number(req.params.id);
                const entry = new this.modelConstructor();
                const staticMethods = this.modelConstructor;
                const indexKey = staticMethods.getIndexKey();
                entry[indexKey] = id;
                for (const key of staticMethods.getKeysWithoutIndex()) {
                    entry[key] = req.body[key];
                }
                this.repository.replace(entry as T).then((id: number|string)=>{
                    res.status(200);
                    res.json(id);
                }, (code)=>{
                    res.status(code);
                    res.json([]);
                } );
            }))

            app.patch("/:id", ((req, res) => {
                const id = Number(req.params.id);
                const entry = new this.modelConstructor();
                const staticMethods = this.modelConstructor;
                const indexKey = staticMethods.getIndexKey();
                entry[indexKey] = id;
                for (const key of staticMethods.getKeysWithoutIndex()) {
                    entry[key] = req.body[key];
                }
                this.repository.update(entry as T).then((id: number|string)=>{
                    res.status(200);
                    res.json(id);
                }).catch((code)=>{
                    res.status(code);
                    res.json([]);
                });
            }))
        }
    }
}
