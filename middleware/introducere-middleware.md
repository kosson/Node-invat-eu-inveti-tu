# Ce-i middleware?

Un middleware este o funcție care are un callback `next`. Un schelet care ar lămuri lucrurile este următoarea construcție.

```javascript
app.use(
  function(request, response, next){
    // cod
    next();
  },
  function(request, response, next){
    // cod
    next();
  },
  function(request, response, next){
    // cod
    next();
  }
);
```

De fapt, un middleware este un șablon de lucru care permite reutilizarea codului, fiind pretabil și la distribuirea în pachete npm.

```javascript
let nume_middleware = function (request, response, next) {
  // cod pentru relucrarea req și res
  next(rezultat);
}
```

ATENȚIE! Ordinea în care menționezi middleware-ul are o deosebită importanță pentru că este și ordinea în care vor fi executate la rulare. Din aceleași rațiuni vom declara middleware-ul înaintea tratării rutelor.

Argumentele `request` și `response` care sunt utilizate în mod curent în Express, sunt două obiecte, care vor fi utilizate în toate celelalte middleware-uri folosite ulterior. Acest lucru înseamnă că permit adăugarea de proprietăți care ar putea fi accesate mai târziu - `res.ceva = 'mesaj'`.

Middleware-urile sunt implementare de diferitele biblioteci de cod din Node.js. În cazul lui Express, de exemplu, middleware-urile vor fi folosite cu `use()`.

Middleware-ul este secvența de cod invocată care se interpune între cererea clientului și răspunsul final.

Middleware-ul funcționează precum un șir. Cererile lovesc primul middleware definit și apoi următorul și următorul pentru fiecare rută definită. Un exemplu simplu este:

```js
var express = require('express');
var app = express();
var router = express.Router();

// simple logger for this router's requests
// all requests to this router will first hit this middleware
router.use(function(req, res, next) {
  console.log('%s %s %s', req.method, req.url, req.path);
  next();
});

// this will only be invoked if the path starts with /bar from the mount point
router.use('/bar', function(req, res, next) {
  // ... maybe some additional /bar logging ...
  next();
});

// always invoked
router.use(function(req, res, next) {
  res.send('Hello World');
});

app.use('/foo', router);

app.listen(3000);

```
