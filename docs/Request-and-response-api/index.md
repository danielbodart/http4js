# http4js

### Table of Contents

- [Overview](/http4js/#basics)
- [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)
- [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)
- [URI API](/http4js/Uri-api/#uri-api)
- [Routing API](/http4js/Routing-api/#routing-api)
- [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
- [End to End Testing](/http4js/End-to-end-testing/#end-to-end-testing)
- [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
- [Zipkin tracing](/http4js/Zipkin-tracing/#zipkin-tracing)
- [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
- [Https Server](/http4js/Https-server/#https-server)
- [Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Request and Response API

There are two ways to build a `Req` or `Res`:
  - you can new up the class
  - you can use the builder function
  
```typescript
new Res(200, 'body'); //or
ResOf(200, 'body');

new Req("GET", "/"); //or
ReqOf("GET", "/")
```

They are named `Req` and `Res` in this short-hand manner so that they don't 
conflict with other objects named Request and Response. 

## Immutability - why?

Both `Req` and `Res` are immutable, so every method on them returns a new object. 
For example we might want to set a header on a `Req` but then replace it:

```typescript
const request = ReqOf(Method.GET, "/")
                    .withHeader(Headers.EXPIRES, "max-age=60")
                    
const noMaxAgeRequest = request.replaceHeader(Headers.EXPIRES, "max-age=0");
```

`request` and `noMaxAgeRequest` are different objects. This stops us from passing around
state all over our codebase and finding it hard to know where our `Req` or `Res`
is mutated. For example, it stops the following:

```typescript
get("/" , async (req: Req) => {
    doSomethingOverThere(req)
    return ResOf(200, req.bodyString());
})

function doSomethingOverThere(req: Req): number {
    req.withHeader(Headers.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
    return Math.random();
}
```

where our function `doSomethingOverThere` takes a `Req` and tries to set a cache control directive
but is actually doing something else - returning a number. Because `doSomethingOverThere` doesn't return
the `Req` explicitly and because `Req` is immutable, it actually has no effect on the `Req`
used in `new Res(200, req.body)` because `Req` is immutable.

## API

We provide builder functions `Req` and `Res` because `Req` and `Res` 
conflict with other libraries using the same name, so you might write:

```typescript
get("/", async (req) => ResOf(200, "Hello, world!"))
    .asServer()
    .start();

HttpClient(ReqOf("GET", "http://localhost:3000/")).then(res=>console.log(res));
```

We also have a dumb redirect helper 

```typescript
Redirect(302, "/somewhere/else") 
```

which is just sugar for `ResOf(302).withHeader("Location", "/somewhere/else")`

The full api is as follows:

```typescript

class Request {
    withUri(uri: Uri | string): Req
    
    header(name: string): string 
    
    withHeader(name: string, value: string): Req 
    
    replaceHeader(name: string, value: string): Req 
    
    removeHeader(name: string): Req
    
    withBody(body: string): Req
    
    withFormField(name: string, value: string | string[]): Req 
    
    withForm(form: object): Req 
    
    bodyString(): string 
    
    formBodystring(): string 
    
    withQuery(name: string, value: string): Req
    
    withQueries(queries: {}): Req
    
    query(name: string): string
}

class Response {
    header(name: string): string

    withHeader(name: string, value: string): Res 

    withHeaders(headers: HeadersType): Res 

    replaceAllHeaders(headers: HeadersType): Res 

    replaceHeader(name: string, value: string): Res 

    removeHeader(name: string): Res 

    withBody(body: string): Res 

    bodyString(): string 
}
 ```
 
Prev: [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)

Next: [URI API](/http4js/Uri-api/#uri-api)
