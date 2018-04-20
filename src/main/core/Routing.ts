import {Response} from "./Response";
import {HttpHandler} from "./HttpMessage";
import {Request} from "./Request";
import {Body} from "./Body";
import {Uri} from "./Uri";
import {Filter} from "./Filters";
import {Http4jsServer} from "../servers/Server";
import {NativeServer} from "../servers/NativeServer";

export interface RoutingHttpHandler {
    withFilter(filter: (HttpHandler) => HttpHandler): RoutingHttpHandler
    asServer(server: Http4jsServer): Http4jsServer
    match(request: Request): Promise<Response>
}

export class ResourceRoutingHttpHandler implements RoutingHttpHandler {

    server: Http4jsServer;
    private root: string;
    private handlers = [];
    private filters: Array<(HttpHandler) => HttpHandler> = [];

    constructor(path: string,
                method: string,
                handler: HttpHandler) {
        this.root = path;
        this.handlers.push({path: path, verb: method, handler: handler});
    }

    withRoutes(routes: ResourceRoutingHttpHandler): ResourceRoutingHttpHandler {
        this.handlers = this.handlers.concat(routes.handlers);
        return this;
    }

    withFilter(filter: Filter): ResourceRoutingHttpHandler {
        this.filters.push(filter);
        return this;
    }

    withHandler(path: string, method: string, handler: HttpHandler): ResourceRoutingHttpHandler {
        const existingPath = this.root != "/" ? this.root : "";
        const nestedPath = existingPath + path;
        this.handlers.push({path: nestedPath, verb: method, handler: handler});
        return this;
    }

    asServer(server: Http4jsServer = new NativeServer(3000)): Http4jsServer {
        this.server = server;
        server.registerCatchAllHandler(this);
        return this.server;
    }

    match(request: Request): Promise<Response> {
        const exactMatch = this.handlers.find(it => {
            return request.uri.exactMatch(it.path) && request.method.match(it.verb) != null;
        });
        const fuzzyMatch = this.handlers.find(it => {
            if (it.path == "/") return false;
            return it.path.includes("{")
                && Uri.of(it.path).templateMatch(request.uri.path)
                && request.method.match(it.verb) != null;
        });
        const matchedHandler = exactMatch || fuzzyMatch;
        if (matchedHandler) {
            const filtered = this.filters.reduce((acc, next) => {
                return next(acc)
            }, matchedHandler.handler);
            request.pathParams = matchedHandler.path.includes("{")
                ? Uri.of(matchedHandler.path).extract(request.uri.path).matches
                : {};
            return filtered(request);
        } else {
            const filtered = this.filters.reduce((acc, next) => {
                return next(acc)
            }, this.defaultNotFoundHandler);
            return filtered(request);
        }
    }

    private defaultNotFoundHandler = (request: Request) => {
        const notFoundBodystring = `${request.method} to ${request.uri.template} did not match routes`;
        return Promise.resolve(new Response(404, notFoundBodystring));
    };

}

export function routes(method: string, path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, method, handler);
}

export function getTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "GET", handler);
}

export function postTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "POST", handler);
}

export function putTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "PUT", handler);
}

export function patchTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "PATCH", handler);
}

export function deleteTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "DELETE", handler);
}
