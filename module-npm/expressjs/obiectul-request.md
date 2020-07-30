# Obiectul request

Acest obiect reprezintă cererea HTTP. Obiectul are proprietăți corespondente *query string*, parametri, *body*, headere HTTP ș.a.m.d. Prin convenție acesta este denumit **req** (*request*), fiind primul parametru pasat unui middleware.

Acest obiect este o variantă îmbunătățită a propriului obiect request (vezi [Class: http.IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)). Urmând documentația Node.js, vom afla că `http.Server` va crea un obiect `IncomingMessage`. Acest obiect este pasat ca prim argument, fie unui eveniment `request`, fie unuia `response`. Acest obiect poate fi utilizat pentru a accesa starea răspunsului, headerele și datele.

Acest obiect implementează interfața `Readable Stream`, fiind un obiect *stream*, de fapt. Precizarea este importantă deoarece putem *asculta* evenimente `data` sau `end`. Nu uita că în spate, avem de fapt modulul `http` a lui NodeJS.

```javascript
app.get('/produse/:id', function clbkGetProdId (err, req, res, next) {
  req.on('data', function clbkData () {
    console.log('Apare un chunk...');
  });
  req.on('end', function clbkEnd () {
    console.log('Am primit body...')
  });
});
```

Corpul unui mesaj este transmis în *chunks*. În NodeJS, fragmentele de date numite *chunks* sunt obiecte `Buffer`.

## req.app

Această proprietate a obiectului `req` este o referință către obiectul `app`, adică către instanța Express.js care este utilizată de funcția middleware.

## req.body

Este un obiect generat de middleware-ul `express.urlencoded()` sau `express.json()` a cărui proprietăți sunt culese din valorile existente în `name` pentru fiecare element de form, iar valoarea fiind cea introdusă de utilizator în form.

```javascript
var express = require('express');
var app     = express();

app.use(express.json()); // pentru parsing-ul dateleor cu mimetype-ul application/json
app.use(express.urlencoded({ extended: true })); // pentru parsing-ul dateleor cu mimetype-ul application/x-www-form-urlencoded

app.post('/profile', function (req, res, next) {
  console.log(req.body);
  res.json(req.body);
})

## req.method

Această proprietate indică metoda HTTP folosită de cerere.

## req.protocol

Această proprietate indică protocolul folosit în cerere, de exemplu http sau https.

## req.get()

Folosind `req.get('host')` ai acces la stringul care indică host-ul și portul pe care s-a fpcut cererea.

## req.originalUrl

Proprietatea indică calea pe care s-a făcut cererea.
