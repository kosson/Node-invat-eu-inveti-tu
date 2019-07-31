# Express.js

Express este o bibliotecă de cod care în combinație cu NodeJS are capacitatea de a servi pagini web și alte resurse. Pe scurt, poți face un server HTTP. Pachetul Express.js poate fi adus de la npmjs.com prin instalarea cu `npm`.

```bash
npm i express
```

Pentru a porni, mai întâi trebuie inițiat constructorul `express` prin cerere și apoi constituirea obiectului denumit generic `app`, care are drept sarcină gestionarea cererilor și a răspunsurilor HTTP. Pentru a porni un server HTTP, ai nevoie de cinci linii de cod.

```javascript
const express = require('express');
const app = express();
app.listen('3000', function () {
  console.log('Am pronit serverul pe portul 3000')
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

În Express, middleware-ul este *consumat* cu `use()`. Din tot middleware-ul folosit cu Express, singurul care a fost păstrat intern este cel responsabil de servirea paginilor statice.

```javascript
app.use(express.static(__dirname + '/public'));
```
