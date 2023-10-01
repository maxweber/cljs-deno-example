# ClojureScript Deno example + shadow-cljs REPL

A "Hello, world" HTTP server example running ClojureScript on Deno.

## Running

Start shadow-cljs with:

```shell
npm run shadow
```

Start the Deno process with:

```shell
npm run deno
```

This will compile the ClojureScript into an ECMAScript module and load it in
Deno. Visit http://localhost:8080 for a warm greeting.

Hot reloading does _not_ work, but you can connect to the shadow-cljs nREPL on
port `6001`. There run:

``` clojure
(shadow/repl :main)
```

Type in:

``` clojure
(js/console.log "hello")
```

To print something on the stdout of the Deno process.

Open `src/main/core.cljs` change the body of the response:

``` clojure
(defn handler
  [_request]
  {:status 200
   :body "Hello, world"})
```

Eval this form (`C-x C-e` in Emacs) and refresh http://localhost:8000/ to see
the new response. Loading/compiling the complete namespace does not work yet.
