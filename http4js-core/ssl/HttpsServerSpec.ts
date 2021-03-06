import {equal} from "assert";
import {get, ReqOf, ResOf} from "../src/index";
import {NativeHttpsServer} from "../src/servers/NativeHttpsServer";
import {HttpsClient} from "../../http4js-clients/src/HttpsClient";

describe('https server', () => {

    const httpsServer = get('/', async () => ResOf(200, 'hello, world!'))
        .withPost('/', async() => ResOf(200, 'hello, world!'))
        .asServer(new NativeHttpsServer(8000));

    before(() => {
        httpsServer.start();
    });

    after(() => {
        httpsServer.stop();
    });

    it('serves a get request', async () => {
        const response = await HttpsClient(ReqOf('GET', 'https://localhost:8000/'));
        equal(response.status, 200);
        equal(response.bodyString(), 'hello, world!');
    });

    it('serves a post request', async () => {
        const response = await HttpsClient(ReqOf('POST', 'https://localhost:8000/'));
        equal(response.status, 200);
        equal(response.bodyString(), 'hello, world!');
    });

});