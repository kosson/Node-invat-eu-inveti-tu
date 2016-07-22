# bodyParser - parsarea corpului cererii

Trebuie înlănțuit middleware-ul de parsare json() și urlencoded(). Aceste middleware-uri au rolul de a converti datele din formă brută așa cum vin din formular în obiecte JSON.

Pentru includerea middleware-ului de parsare a corpului (request body) se face asa:

```js
var bodyParser = require('body-parser');

app.use( bodyParser.json() );       // parsează corpul unei cereri care care Content-Type setat ca application/json
app.use( bodyParser.urlencoded() ); // parsează corpul unei cereri care care Content-Type setat ca application/x-www-form-urlencoded
// uneori configurat și ca: app.use(bodyParser.urlencoded({extended: false}))

app.post('/test-page', function(req, res) {
    console.log('name: ' + req.body.name);
  });
```

| Metodă bodyParser      | Content-Type                   | Când este folosit?                  | OBSERVAȚII                 ||
| :--------------------- | :----------------------------- | :------------------------------     | :------------------------- ||
| bodyParser.json()      | Content-Type: application/json | În aplicații SPA și realizarea de servicii REST ce folosesc JSON ||
| bodyParser.urlencoded()| Content-Type: application/x-www-form-urlencoded | În formulare cu atribut `action`| Poate primi un obiect de configurare {extended: false}|

Odată cu trecerea la versiunea 4, Express a scos bodyParser ca modul separat pentru a fi actualizat mai ușor.

Pentru alte modificari vezi si [documentul care explica modificarile de la 3.0 la 4.0](http://scotch.io/bar-talk/expressjs-4-0-new-features-and-upgrading-from-3-0)

Pentru parsarea diferitelor variante particularizate de JSON ca JSON, se va trimite un obiect de configurare:

```js
app.use(bodyParser.json({ type: 'application/*+json' }));
```

Parsarea unui Buffer

```js
app.use(bodyParser.raw({ type: 'application/vnd.custom-type'}));
```

Parsarea de HTML

```js
// app.use(bodyParser.text({ type: 'text/html'});
```

Are ca efect parsarea de html într-un string

## bodyParser.json(options)

Este un middleware care parsează doar json. Acceptă un body codat Unicode și oferă arhivare/dezarhivare automată gzip.
Astfel, se va popula un nou obiect body cu datele parsate la cererea obiectului care urmează după middleware; adică req.body.

## bodyParser.urlencoded({extended: true})
Este constituit un nou obiect ce conține datele parsate la momentul în care sunt solicitate de vreun obiect de după middleware, adică req.body. Acest obiect va conține perechi cheie-valoare. Valorile pot fi stringuri sau array-uri atunci când extended este false sau de orice tip atunci când extended este true.

Un exemplu simplu:

```js
var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.write('you posted:\n')
  res.end(JSON.stringify(req.body, null, 2))
})
```

# Inițializare aplicație prin inițializare de middleware

```js
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    port = process.env.PORT || 8080
;
```

Nu uita că inițializarea serverului se face la final prin

```js
app.listen(port);
```

Trimite și la consolă un mesaj privind portul

```js
console.log('Magic happens on port ' + port);
```
