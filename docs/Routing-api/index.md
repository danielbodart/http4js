# http4js

### Table of Contents

- [Overview](/http4js/#basics)
- [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)
- [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)
- [URI API](/http4js/Uri-api/#uri-api)
- [Routing API](/http4js/Routing-api/#routing-api)
- [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
- [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
- [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
- [Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Routing API

Routing is declared from a root. We start with something basic and add to it:

```typescript
get("/", () => Promise.resolve(new Response(200, "Root")))
    .withHandler(Method.GET, "/about", () => Promise.resolve(new Response(200, "About us.")));
```

If we want to nest our handlers we can combine them at a later time:

```typescript
// root stays the same 
const root = get("/", () => Promise.resolve(new Response(200, "Root")))
    .withHandler(Method.GET, "/about", () => Promise.resolve(new Response(200, "About us.")));

// some other routes whose root is /hotels/{name}
const nestedRoutes = get("/hotels/{name}", (req) => {
    return Promise.resolve(new Response(200, hotels[req.pathParams.name]));
}).withHandler(Method.GET, "/properties/{property}", (req) => {
    // now we have a handler on /hotels/{name}/properties/{property} and can see both path params
    const body = hotels[req.pathParams.name].properties[req.pathParams.property];
    return Promise.resolve(new Response(200, body)) 
})

// combine them
root.withRoutes(nestedRoutes)
    .asServer()
    .start();

// some data
const hotels = {
    "tom-hotel": {
       name: "Tom Hotel", numberOfProperties: 2, properties: {
           "Cola Beach": {name: "Cola Beach", size: 20, location: "London"},
           "Lilt Lookover": {name: "Lilt Lookover", size: 20, location: "New York"}
       }
    }
}
```

The most specific handler is matched first:

```typescript
return get("/", () => {
    return Promise.resolve(new Response(200, "root"));
}).withHandler("GET", "/family/{name}", () => {
    return Promise.resolve(new Response(200, "least precise"));
}).withHandler("GET", "/family/{name}/then/more", () => {
    return Promise.resolve(new Response(200, "most precise"));
}).withHandler("POST", "/family/{name}/less", () => {
    return Promise.resolve(new Response(200, "medium precise"));
})
    .serve(new Request("GET", "/family/shacham/then/more"))
    .then(response => equal(response.bodyString(), "most precise"))
```

so despite the handler at `/family/{name}/then/more` being declared after the more
generic handler at `/family/{name}` it is matched first.

## Path params

We've seen above how to specify path params:

```typescript
get("/hotels/{name}/property/{property}", (req) => {
  return Promise.resolve(new Response(200, req.pathParams))
}).serve(
  new Request(Method.GET, "http://localhost:3000/hotels/Tom-Hotel/property/Cola-Beach")
);

//pathParams: { name: 'Tom-Hotel', property: 'Cola-Beach' }
```

## Query params

Query params are available in a similar way.

```typescript
get("/hotels", (req) => {
  const nameQuery = req.queries['name'];
  const filteredHotels = hotels.filter(hotel => hotel.name === nameQuery);
  return Promise.resolve(new Response(200, filteredHotels));
}).serve(
  new Request(Method.GET, "http://localhost:3000/hotels").withQuery("name", "Tom Hotel")
);
```

## Form params

And form params are available in a similar way too


```typescript
post("/hotels", (req) => {
  const hotelName = req.form['name'];
  return Promise.resolve(new Response(200, hotelName));
}).serve(
  new Request(Method.POST, "http://localhost:3000/hotels").withFormField("name", "Tom Hotel")
);
```

Prev: [URI API](/http4js/Uri-api/#uri-api)

Next: [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)