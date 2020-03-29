# `express.Router()`

Se comportă ca o miniaplicație care rulează în izolare. Obiectul `express` are o metodă care permite instanțierea de orutere. Poți seta rute pe această aplicație, apelând o instanță a acesteia și apoi să definind rute pe aceea. Rutarea este foarte utilă pentru compartimentarea aplicațiilor complexe.

Un posibil scenariu implică următorii pași:

1. cheamă o instanță a ruterului
2. adaugă rute la aceasta
3. adaugă aceste rute la aplicația principală

```js
// obtine o instanta a routerului
var adminRouter = express.Router();

//adauga o ruta pe administrator
adminRouter.get('/', function (req, res) {
  res.send('sunt locul in care trebuia sa fii');
});

//adauga o ruta pe administrator/utilizatori
adminRouter.get('/users', function(req, res){
  res.send('Arat care sunt utilizatorii');
  });

//adauga o ruta spre postari
adminRouter.get('/posts', function(req, res){
  res.send('Arat postarile');
  });

//adaug rutele la aplicatie
app.add('/administrator', adminRouter);
```

Trebuie reținut faptul că putem avea oricâte rutere avem nevoie. Pentru fiecare zonă a aplicației putem avea un router diferit. Acest lucru este posibil pentru că un router se comportă ca un middleware în sine. Toate aceste rutere pot fi adăugate aplicației pasând referința către miniaplicație într-un `app.use('/', numeMiniAppCuRouter)`.

## Ordinea rutelor

Ordinea în care pui middleware-ul este foarte importantă. Cererile vor fi prelucrate în funcție de lanțul de prelucrare pe care îl creezi.

De exemplu, dacă ai următoarele posibile rute:

```javascript
let router = express.Router();

router.get('/', functieDePrelucrareACererii);
router.get('/carti', functieDePrelucrareACererii);
router.get('/carti/:idCarte', functieDePrelucrareACererii);
router.get('/carti/delete', functieDePrelucrareACererii);
```

În exemplul de mai sus, dacă am poziționat ruta care are o parte variabilă marcată prin două puncte înaintea altor rute cu acelați prefix, în cazul nostru `/carti/`, lanțul de prelucrare se va opri la acest middleware cu două puncte pentru că următoarea cale `/carti/delete` va fi prelucrată de `/carti/:idCarte`, ceea ce înseamnă că nu va mai ajunge niciodată pe `/carti/delete`.
Reține faptul că modul în care ordonezi căile, indică cine va prelucra cererea. În exemplul dat, pentru a ajunge la `/carti/delete`, va trebui să punem această cale înaintea celei care are partea variabilă.

```javascript
let router = express.Router();

router.get('/', functieDePrelucrareACererii);
router.get('/carti', functieDePrelucrareACererii);
router.get('/carti/delete', functieDePrelucrareACererii);
router.get('/carti/:idCarte', functieDePrelucrareACererii);
```

Numele părții variabile va fi o cheie a obiectului `req.params`.

## Rute simple

### Rută simplă pentru homepage

```js
app.get('/', function(req, res) {
  res.send('Welcome to the home page!');
});
```

## Instanțiază un router

```js
var apiRouter = express.Router();
```

### O rută de text

```js
apiRouter.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});
```

După ce ai scris toate rutele aici trebuie să folosești routerul sau routerele, dacă sunt mai multe cu middleware-ul Express.

```js
app.use('/api', apiRouter);
```

## Rute gestionate pe orizontală

Atunci când ai de gestionat o întreagă aplicație cu mai multe căi, devine impractic să folosești un singur fișier care să gestioneze toate căile. Din acest motiv, poți sparge gestionarea căilor în mai multe fișiere pe care să le pui într-un director generic `/routes`. În acest director, creezi câte un fișier pentru fiecare din ramificațiile principale ale aplicației.

![](../img/RouterExpressPeFisiere.png)

## Metoda `route.use()`

Cu ajutorul metodei `use()` se realizează atașarea de middleware specific unei rute.

```javascript
var express = require('express');
var router  = express.Router();

// middleware specific rutei prezente
router.use(function timeLog (req, res, next) {
  console.log('Data și ora: ', Date.now());
  next();
})
// calea rădăcină pe ruta servită de acest fișier
router.get('/', function (req, res) {
  res.send('Ceva de pe ruta asta');
})

module.exports = router;
```
