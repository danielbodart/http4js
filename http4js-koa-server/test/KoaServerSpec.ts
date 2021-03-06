import * as Koa from "koa";
import {get} from "../../http4js-core/src/core/Routing";
import {Req} from "../../http4js-core/src/core/Req";
import {deepEqual, equal} from "assert";
import {KoaServer} from "../src/KoaServer";
import {ResOf} from "../../http4js-core/src/core/Res";
import {HttpClient} from "../../http4js-clients/src/HttpClient";

const bodyParser = require('koa-bodyparser');
const koaApp = new Koa();
koaApp.use(bodyParser());

koaApp.use((ctx, next) => {
    ctx.set("koa", "middleware");
    next();
});

describe("koa", () => {

    const baseUrl = "http://localhost:3002";

    const server = get("/", async (req) => {
        const query = req.query("tomQuery");
        return ResOf(200, req.bodyString())
            .withHeaders(req.headers)
            .withHeader("tomQuery", query || "no tom query");
    })
        .withHandler("POST", "/post-body", async (req) => ResOf(200, req.bodyString()))
        .withHandler("POST", "/post-form-body", async (req) => ResOf(200, JSON.stringify(req.form)))
        .withHandler("GET", "/get", async () => ResOf(200, "Done a GET request init?"))
        .withHandler("POST", "/post", async () => ResOf(200, "Done a POST request init?"))
        .withHandler("PUT", "/put", async () => ResOf(200, "Done a PUT request init?"))
        .withHandler("PATCH", "/patch", async () => ResOf(200, "Done a PATCH request init?"))
        .withHandler("DELETE", "/delete", async () => ResOf(200, "Done a DELETE request init?"))
        .withHandler("OPTIONS", "/options", async () => ResOf(200, "Done a OPTIONS request init?"))
        .withHandler("HEAD", "/head", async () => ResOf(200, "Done a HEAD request init?"))
        .withHandler("TRACE", "/trace", async () => ResOf(200, "Done a TRACE request init?"))
        .asServer(new KoaServer(koaApp, 3002));


    before(() => {
        server.start();
    });

    after(() => {
        server.stop();
    });

    it("respects middleware", async() => {
        const response = await HttpClient(new Req("GET", baseUrl));
        equal(response.header("koa"), "middleware");
    });

    it("sets post body", async() => {
        const request = new Req("POST", `${baseUrl}/post-body`, '{"result": "my humps"}', {"Content-Type": "application/json"});
        const response = await HttpClient(request);
        equal(JSON.parse(response.bodyString())["result"], "my humps");
    });

    it("sets post form body", async() => {
        const request = new Req("POST", `${baseUrl}/post-form-body`).withForm({name: ["tosh", "bosh", "losh"]});
        const response = await HttpClient(request);
        equal(response.bodyString(), JSON.stringify({name: ["tosh", "bosh", "losh"]}));
    });

    it("sets query params", async() => {
        const request = new Req("GET", baseUrl).withQuery("tomQuery", "likes to party");
        const response = await HttpClient(request);
        equal(response.header("tomquery"), "likes to party")
    });

    it("sets multiple headers of same name", async() => {
        const request = new Req("GET", baseUrl, '', {tom: ["smells", "smells more"]});
        const response = await HttpClient(request);
        deepEqual(response.header("tom"), "smells, smells more")
    });

    describe("supports client verbs", () => {

        it("GET", async() => {
            const request = new Req("GET", `${baseUrl}/get`);
            return HttpClient(request)
                .then(response => {
                    equal(response.bodyString(), "Done a GET request init?");
                });
        });

        it("POST", async() => {
            const request = new Req("POST", `${baseUrl}/post`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a POST request init?");
        });

        it("PUT", async() => {
            const request = new Req("PUT", `${baseUrl}/put`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a PUT request init?");
        });

        it("PATCH", async() => {
            const request = new Req("PATCH", `${baseUrl}/patch`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a PATCH request init?");
        });

        it("DELETE", async() => {
            const request = new Req("DELETE", `${baseUrl}/delete`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a DELETE request init?");
        });

        it("HEAD", async() => {
            const request = new Req("HEAD", `${baseUrl}/head`);
            const response = await HttpClient(request);
            equal(response.status, "200");
        });

        it("OPTIONS", async() => {
            const request = new Req("OPTIONS", `${baseUrl}/options`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a OPTIONS request init?")
        });

        it("TRACE", async() => {
            const request = new Req("TRACE", `${baseUrl}/trace`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a TRACE request init?");
        });

    })

})
;
