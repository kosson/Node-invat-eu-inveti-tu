# Modulul body-parser - parsarea corpului cererii

Un server primește solicitări și trimite răspunsuri ca răspuns. Modulul `body-parser` este cel mai important pentru Express și Node ca acestea, împreună să se poată comporta ca un server adevărat. Modulul poate fi găsit pe npm la https://www.npmjs.org/package/body-parser.

În esență ceea ce face este să servească corpul unei cereri ca obiecte ce pot fi procesate în node. În ce formate poți transfoma conținutul primit prin cerere (*payload*):

- JSON folosind metoda `bodyParser.json()` pentru a procesa date de forma `{"nume": "valoare"}`,
- `bodyParser.urlencoded()` cu ajutorul căreia procesăm date venite din URL de forma `nume1=val1&nume2=val2`,
- `bodyParser.raw()` - este returnat corpul ca buffer (tampon de date),
- `bodyParser.text()`, returnează corpul ca text.

Atunci când folosești Express, de cele mai multe ori trebuie înlănțuite middleware-urile de parsare `json()` și `urlencoded()`. Aceste middleware-uri au rolul de a converti datele din formă brută așa cum vin din formular în obiecte JSON.

Pentru includerea middleware-ului de parsare a corpului (request body) se procedează astfel:

```javascript
var bodyParser = require('body-parser');

app.use( bodyParser.json() );       // parsează corpul unei cereri care care Content-Type setat ca application/json
app.use( bodyParser.urlencoded() ); // parsează corpul unei cereri care care Content-Type setat ca application/x-www-form-urlencoded
// uneori configurat și ca: app.use(bodyParser.urlencoded({extended: false}))

app.post('/test-page', function(req, res) {
    console.log('name: ' + req.body.name);
  });
```

| Metodă bodyParser      | Content-Type                   | Când este folosit?                  | OBSERVAȚII                 |
| :--------------------- | :----------------------------- | :------------------------------     | :------------------------- |
| bodyParser.json()      | Content-Type: application/json | În aplicații SPA și realizarea de servicii REST ce folosesc JSON |
| bodyParser.urlencoded()| Content-Type: application/x-www-form-urlencoded | În formulare cu atribut `action`| Poate primi un obiect de configurare {extended: false}|

Odată cu trecerea la versiunea 4, Express a scos `bodyParser` ca modul separat pentru a fi actualizat mai ușor.

Pentru alte modificari vezi si [documentul care explica modificarile de la 3.0 la 4.0](http://scotch.io/bar-talk/expressjs-4-0-new-features-and-upgrading-from-3-0)

Pentru parsarea diferitelor variante particularizate de JSON ca JSON strict, se va trimite un obiect de configurare:

```javascript
app.use( bodyParser.json({ type: 'application/*+json' }) );
```

Parsarea unui Buffer

```javascript
app.use( bodyParser.raw({ type: 'application/vnd.custom-type'}) );
```

Parsarea de HTML

```javascript
app.use( bodyParser.text({type: 'text/html'}) );
```

Are ca efect parsarea de html într-un string.

## bodyParser.json(options)

Este un middleware care parsează doar json. Acceptă un `body` codat Unicode și oferă arhivare/dezarhivare automată gzip.
Astfel, se va popula un nou obiect body cu datele parsate la cererea obiectului care urmează după middleware; adică `req.body`.

## bodyParser.urlencoded({extended: true})
Este constituit un nou obiect ce conține datele parsate la momentul în care sunt solicitate de vreun obiect de după middleware, adică req.body. Acest obiect va conține perechi cheie-valoare. Valorile pot fi stringuri sau array-uri atunci când extended este false sau de orice tip atunci când extended este true.

Un exemplu simplu:

```javascript
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
