# Rutare dinamică

Rutele vor fi gestionate în ordinea în care sunt create.

Pentru a adăuga rute într-un mod dinamic, poți crea un ruter cu rol de rezervare și apoi poți adăuga rutele la acesta.

Express nu permite ștergerea rutelor din moment ce acestea sunt deja definite. Totuși este permisă [înlocuirea unui întreg ruter](https://github.com/expressjs/express/issues/2596#issuecomment-81353034). Un model este următorul exemplu.

```javascript
var express = require('express');
var app     = express();
var router  = undefined;

// acest middleware ar trebui cel care atașează rutele dinamice
app.use(function (req, res, next) {
  // funcția callback atașează ruterul de lucru
  router(req, res, next);
});

function defineșteRutele () {
  router = express.Router();

  // definește tot pe un ruter, nu pe app
  router.get('/', ...);
};
```

Modelul ar fi definit de următorii pași.

1) creează o instanță de ruter pentru montarea endpoint-urilor dinamice.
2) când vrei să modifici rutele, redefinești ruterul.

Nu uita că oricărui ruter îi poți adăuga la stiva sa o rută nouă.

```javascript
// Rutele statice pentru care sunt definite clar middleware-urile
app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);

let dynamicApiRouter = null;

export function setupDynamicRouter (config) {
  dynamicApiRouter = new express.Router();
  // Adaugă rutele la dynamicApiRouter dintr-un obiect de configurare `config`
  dynamicApiRouter[config.method](config.path, config.handler);
}

// Montarea rutelor dinamice
app.use('/api', (req, res, next) => dynamicApiRouter(req, res, next));
/*
`app.use(router)` sau `app.use((req, res, next) => router(req, res, next))` sunt același lucru
cu diferența că cea de-a doua formă îți permite modificarea numelui variabilei a cărei valoare este funcția
*/

// Gestionează erorile
app.use((req, res, next) => {
    const err = new Error('Not found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({error: {message: err.message}});
});

module.exports = app;
```

În momentul în care montezi un nou endpoint, pasezi ruterul și te asiguri că ștergi prefixul `/api` pentru că acesta este gestionat în afara ruterului, adică în părintele care este `app`.

```javascript
let express = require('express');
let router = express.Router();

const mountEndpoints = (path, router) => {
  const module = require(`../routes/${path}`);
  router.use(`/${module.plural ? `${module.plural}` : `${path}s`}`, module);
}
```

## Resurse

- [ExpressJS: Adding routes dynamically at runtime](https://stackoverflow.com/questions/63199945/expressjs-adding-routes-dynamically-at-runtime)
- [#NodeJS / #ExpressJS: Adding routes dynamically at runtime](https://alexanderzeitler.com/articles/expressjs-dynamic-runtime-routing/)
- [Dynamically load routes with express.js](https://stackoverflow.com/questions/16784129/dynamically-load-routes-with-express-js)
- [Replace route at runtime #3726 | github.com/expressjs/express](https://github.com/expressjs/express/issues/3726#issuecomment-432843190)
