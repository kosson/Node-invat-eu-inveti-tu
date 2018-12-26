# Ce-i middleware-ul?

Un middleware este o funcție care are trei callback-uri: `request`, `response` și la final, `next`.

Un schelet care ar lămuri lucrurile este următoarea construcție. De fapt, un middleware este un șablon de lucru care permite reutilizarea codului, fiind pretabil și la distribuirea în pachete `npm`. Middleware-ul are acces la obiectele `request` și `response`, dar trebuie să apeleze `next()` ca să cheme următorul middleware. Cum poți să construiești un middleware?

```javascript
let nume_middleware = function (request, response, next) {
  // cod pentru relucrarea req și res
  next();
}
```

Dacă middleware-ul elaborat nu are în intenție să încheie ciclul cerere - răspuns, trebuie musai să apelezi `next()`. Dacă omiți acest pas, cererea nu se va rezolva.

Atenție, ordinea în care menționezi middleware-ul are o deosebită importanță pentru că este și ordinea în care vor fi executate la rulare. Din aceleași rațiuni vom declara middleware-ul înaintea tratării rutelor.

Argumentele `request` și `response` care sunt utilizate în mod curent în Express, sunt două obiecte, care vor fi utilizate în toate celelalte middleware-uri folosite ulterior. Acest lucru înseamnă că permit adăugarea de proprietăți care ar putea fi accesate mai târziu, de exemplu `res.ceva = 'mesaj'`.

Middleware-urile sunt implementare de diferitele biblioteci de cod din Node.js. În cazul lui Express, de exemplu, middleware-urile vor fi folosite cu `use()`.

```javascript
let nume_middleware = function (request, response, next) {
  // cod pentru relucrarea req și res
  next();
};
app.use(nume_middleware);
// pentru a aplica pe o rută
app.use('/o_ruta', nume_middleware);
// poți aplica pe o anumită rută cu verb
app.get(`/ruta`, nume_middleware);
```

Middleware-ul este secvența de cod invocată care se interpune între cererea clientului și răspunsul final. Concluzia este că midlleware-ul se va defini înainte de rute pentru ca rutele să-l folosească.

Middleware-ul funcționează precum un șir. Cererile lovesc primul middleware definit și apoi următorul și următorul pentru fiecare rută definită. Un exemplu simplu este:

```javascript
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

## Middleware-ul poate fi modularizat

Funcțiile cu rol de middleware pot fi puse în propriile fișiere precum oricare modul.

```javascript
// fișier modul.js
module.exports = function (req, res) {
  res.send('Directorul views este' + req.app.get('views'));
};
```

Să presupunem că avem nevoie de middleware-ul acesta pe o anume rută.

```javascript
app.get('/anume_ruta', require('./modul.js'));
```
