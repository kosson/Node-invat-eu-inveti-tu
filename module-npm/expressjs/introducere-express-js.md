# Express.js

Express este o bibliotecă de cod care în combinație cu NodeJS are capacitatea de a servi pagini web și alte resurse. Pe scurt, poți face un server HTTP. Pachetul Express.js poate fi adus de la npmjs.com prin instalarea cu `npm`.

```bash
npm i express
```

Pentru a porni, mai întâi trebuie inițiat constructorul `express` prin cerere și apoi constituirea obiectului denumit generic `app`, care are drept sarcină gestionarea cererilor și a răspunsurilor HTTP. Pentru a porni un server HTTP, ai nevoie de cinci linii de cod.

```javascript
const express = require('express');
const app = express(); // generează obiectul aplicație
app.listen('3000', function () {
  console.log('Am pornit serverul pe portul 3000')
});
```

Obiectul `app` este cel care va gestiona rutele pe care o vor lua cererile. În acest proces sunt implicate două obiecte foarte importante, unul dedicat cererii de la client, care se numește generic `request` și celălalt, care va trimite clientului răspunsul, denumit generic `response`. De exemplu, toate rutele definite în aplicația noastră, vor avea o funcție callback, care are drept argumente `req` și `res`. Callback-ul prelucrează cererea care va fi ambalată în obiectul `req` și va oferi un răspuns ambalat în obiectul `res`.

```javascript
app.get('/', function (req, res) {
  // tratează cerea pe prima pagină a site-ului, calea tratată fiind rădăcina.
  res.send("Serverul te salută!");
});
```

## Folosirea middleware-ului

Este considerat a fo middleware orice funcție care se interpune între obiectul `request` și formarea obiectului `respose`. Aceste funcții interpuse au acces la obiectele `request`, `response` și `next`.

În Express, middleware-ul este *consumat* cu `use()`. Din tot middleware-ul folosit cu Express, singurul care a fost păstrat intern este cel responsabil de servirea paginilor statice.

```javascript
app.use(express.static(__dirname + '/public'));
```

Orice middleware (funcție) construit suplimentar, va trebui să se încheie prin apelarea metodei `next()`. Această metodă indică faptul că trebuie returnat controlul următorului middleware.

În combinație cu `use()`, un middleware pasat acestei metode, va fi executat pentru fiecare cerere indiferent de cale. Ce este în `use()` va fi executat înainte de orice altă cale care gestionează cererile, dacă este poziționată înaintea acestor rute.

## Metodele obiectului generat de `express()`

![](img/Cele4Metode.png)

Middleware-urile `express.json()` și `express.urlencoded()` sunt necesare pentru a colecta datele trimise de client și pentru a popula proprietatea `req.body` cu acestea.

### express.json([options])

Acesta este un middleware construit intern în Express. Acest middleware se bazează pe modulul [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

## Referințe

- [Anatomy of an HTTP Transaction | Node.js](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/)
