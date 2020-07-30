# Ce-i middleware-ul?

O cerere http este un ciclu stabilit între o cerere și un răspuns. Ceea ce se petrece între cerere și momentul răspunsului este gestionat de ceea ce numim middleware, adică software care se interpune între cerere și răspuns pentru a gestiona datele primite și cele care sunt trimise. Model de lucru implică construcția middleware-ului, apelarea lui `next` pentru a trece în următorul middleware. În cazul lui Express.js, în care construiești obiectul aplicației, după ce ai definit middleware-ul, acesta poți să-l introduci în fluxul de prelucrare al cererilor folosind metoda `use`, precum în `app.use(nume_middleware)`.

Un middleware este o funcție care are trei callback-uri: `request`, `response` și la final, `next`. Identificatorii `request`, `response` și `next` sunt denumiți astfel prin convenție pentru a fi ușor de înțeles codul între programatori.

Un middleware este un șablon de lucru care permite reutilizarea codului, fiind pretabil și la distribuirea în pachete `npm`. Middleware-ul are acces la obiectele `request` și `response`, dar trebuie să apeleze `next()` ca să cheme următorul middleware. Cum poți să construiești un middleware?

```javascript
let nume_middleware = function (request, response, next) {
  request.ceva = 10;
  // cod pentru relucrarea req și res
  next();
}
```

Dacă introduci o proprietate nouă în obiectul request, aceasta va putea fi accesată ceva mai departe în middleware-urile care urmează. Poți să-ți imaginezi scenariul în care verifici credențialele unui utilizator și îl trimiți mai departe altui middleware într-o proprietate asemănătoare cu `req.user = {...}`.
Există o practică de a scrie middleware în module pe care să le imporți și propriu-zis să le interpui în ciclul cerere - răspuns.

Dacă middleware-ul elaborat nu are în intenție să încheie ciclul cerere - răspuns, trebuie musai să apelezi `next()`. Dacă omiți acest pas, cererea nu se va rezolva. Un alt motiv pentru care mai pasezi un callback `next` este pentru a pasa eventualele erori mai departe în lanțul operațiunilor.

```javascript
const fs = require("fs");

function citesteFisierSiPrelucreazaDate(next) {
  fs.readFile("./test.txt", (error, data) => {
    if (error) {
      next(error);
    } else {
      next(null, data);
    }
  });
}

citesteFisierSiPrelucreazaDate((error, data) => {
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
});
```

Atenție, ordinea în care menționezi middleware-ul are o deosebită importanță pentru că este și ordinea în care vor fi executate la rulare. Din aceleași rațiuni vom declara middleware-ul înaintea tratării rutelor.

Argumentele `request` și `response` care sunt utilizate în mod curent în Express.js, sunt două obiecte, care vor fi utilizate în toate celelalte middleware-uri folosite ulterior. Acest lucru înseamnă că permit adăugarea de proprietăți care ar putea fi accesate mai târziu, de exemplu `res.ceva = 'mesaj'`.

Middleware-urile sunt implementare de diferitele biblioteci de cod din Node.js. În cazul lui Express.js, de exemplu, middleware-urile vor fi folosite cu `use()`.

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

În cazul construcție de aplicații web, middleware-ul este secvența de cod invocată care se interpune între cererea clientului și răspunsul final. Concluzia este că midlleware-ul se va defini înainte de rute pentru ca rutele să-l folosească.

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

## Folosirea funcțiilor async/await drept middleware

Funcțiie async/await pot fi folosite din poziția de middleware, mai ales în cazurile în care sunt tratate fluxurile `request`/`response`.

```javascript
app.get('/resurse', async (req, res, next) => {
  try {
    // Întreprinde o acțiune
    next();
  } catch (error) {
    next(error);
  }
});
```

Totuși, folosirea șablonului `try...catch` încalcă necesitatea de a fi concis (*Do not repeat yourserf* - DRY). Pentru a rezolva acest lucru, se poate apela la o funcție specializată (*handler*).

```javascript
function asyncHandler (fn) {
  return function rezolvator (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
app.get('/resurse', asyncHandler( (req, res, next) => {
  // Codul de prelucrare. Erorile vor fi captate și pasate lui Express.js
}) );
```

Acest handler, primește drept parametru o funcție *handler* poate fi rescris folosind sintaxa ES6.

```javascript
function asyncHandler (fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
app.get('/resurse', asyncHandler( (req, res, next) => {
  // Codul de prelucrare. Erorile vor fi captate și pasate lui Express.js
}) );
```

## Resurse

- [Essential Node.js patterns and snippets](http://blog.mixu.net/2011/02/02/essential-node-js-patterns-and-snippets/)
- [Using async/await in ExpressJS middlewares](https://www.acuriousanimal.com/blog/2018/03/15/express-async-middleware)
