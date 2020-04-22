# Middleware-ul `use()`

Semnătura acestui middleware este următoarea:

> app.use([path], [function...], function)

Acest middleware are ca efect montarea funcțiilor sale la calea specificată. Dacă nu este specificată calea, este considerat automat că este folosit `/`. Aceste funcții vor fi executate ori de câte ori va fi făcută o cerere pe acea cale. De vreme ce calea va fi default `/` dacă nu este specificată, middleware-ul va fi executat pentru fiecare cerere la `app`.

```javascript
// middleware-ul va fi executat pentru fiecare cerere pe app
app.use( function (req, res, next) {
  console.log('Time: %d', Date.now());
  next();
})
```

## Primirea cererilor pe middleware

În cazul folosirii bibliotecii specializate `Express.js`, de regulă se va constitui un router pentru gestionarea căilor. La conectarea inițială, care se face pe rădăcină, deja poate fi utilizat `use` pentru a introduce componente pe lanțul de prelucrare a cererii.

```javascript
router.use( function (req, res, next) {
	console.log('Aici se face o prelucrare inițială a cererii');
	next(); // după prelucrare, pasează datele cererii următorului middleware
});
```

Utilizarea middleware-ului în acest mod este foarte utilă. Se pot face validări pentru a vedea dacă ceea ce vine de la cerere este corect. Putem semnala erori în caz de probleme. Putem face jurnalizare pentru analize statistice, care pot fi oferite sau în interes de administrare. Aici sunt o grămadă de posibilități.

Testarea rutei pentru a vedea că totul funcționează bine:

```javascript
router.get('/', function (req, res) {
	res.json({ message: 'Bine ai venit la API!' }); // trimite mesaj la client
});
// începe prelucrarea cererii
router.use( function (req, res, next) {
  console.log('Aici se face o prelucrare inițială a cererii');
  next(); // după prelucrare, pasează datele cererii următorului middleware
});

// Înregistrarea posibilelor rute
// în cazul de mai jos, toate rutele vor fi prefixate de /api
app.use('/api', router);
// motivul este că întreg obiectul router este înregistrat pe namespace-ul /api
```

## Execuția funcțiilor middleware-ului și ordinea

Atenție, funcțiile middleware-ului vor fi executate una după cealaltă așa că ordinea includerii middleware-ului este foarte importantă. De exemplu, dacă pui middleware-ul `use` înaintea tratării căilor pe care vin cererile, acestea nu vor mai trece.

```javascript
// use înainte de punctul de intrare a cererii
app.use(function(req, res, next) {
  res.send('de aici cererea nu pleacă mai departe');
})

// cererile nu vor mai ajunge la punctul de intrare
app.get('/', function (req, res) {
  res.send('Bine ai venit pe rădăcina site-ului.');
})

```

Calea este un string reprezentând:

1.	o cale scrisă explicit:

```javascript
// va răspunde la căi care încep cu /abcd
app.use('/abcd', function (req, res, next) {
  next();
})
```

2.	un șablon regex care reprezintă o cale:

```javascript
// va răspunde la căi care încep cu /abcd și /abd
app.use('/abc?d', function (req, res, next) {
  next();
})

// va răspunde la căi care încep cu /abcd, /abbcd, /abbbbbcd ș.a.m.d.
app.use('/ab+cd', function (req, res, next) {
  next();
})

// va răspunde la căi care încep cu /abcd, /abxcd, /abFOOcd, /abbArcd ș.a.m.d.
app.use('/ab*cd', function (req, res, next) {
  next();
})

// va răspunde la căi care încep cu /ad și /abcd
app.use('/a(bc)?d', function (req, res, next) {
  next();
})
```
3.	o expresie regulată RegExp

```javascript
// va răspunde la căi care încep cu /abc și /xyz
app.use(/\/abc|\/xyz/, function (req, res, next) {
  next();
})
```

4.	un array de combinații a variantelor menționate anterior

```javascript
// va răspunde la căi care încep cu /abcd, /xyza, /lmn, și /pqr
app.use(['/abcd', '/xyza', /\/lmn|\/pqr/], function (req, res, next) {
  next();
})
```

În ceea ce privește funcțiile, acestea pot fi funcțiile middleware-ului, un array de funcții ale middleware-ului sau o combinație a acestora.

1. Funcție de middleware care poate fi definită și montată local.

  ```javascript
  // Funcție definită și atașată pe loc
  app.use(function (req, res, next) {
    next();
  })
  ```
  Routerul este și el un middleware care trebuie atașat aplicației Express.

  ```javascript
  // definire router
  var router = express.Router();
  // tratarea cererilor pe rădăcină
  router.get('/', function (req, res, next) {
    next();
  });
  // atașarea routerului la aplicația Express
  app.use(router);

  ```
  Cu Express.js poți crea oricâte aplicații dorești. Acestea pot fi atașate unei alteia cu rol *central* folosind `use`.

  ```javascript
  //  inițierea altei aplicații Express
  var subApp = express();
  subApp.get('/', function (req, res, next) {
    next();
  })
  app.use(subApp);
  ```

2. Poate fi constituit un array

  Unul din modelele posibile este gruparea middleware-ului folosit pentru o cale într-un array. Ceea ce se obține este o grupare logică a lanțului de prelucrare pe o anumită cale. Ceea ce trebuie ținut în vedere este ca array-ul să fie pasat primul sau să fie singurul lucru care este pasat.

  ```javascript
  var r1 = express.Router();
  r1.get('/', function (req, res, next) {
    next();
  })

  var r2 = express.Router();
  r2.get('/', function (req, res, next) {
    next();
  })

  app.use('/', [r1, r2]);

  ```
3. Combinatii

  Toate modalitățile de lucru menționate anterior pot combinate.

  ```javascript
  function mw1(req, res, next) { next() };
  function mw2(req, res, next) { next() };

  var r1 = express.Router();
  r1.get('/', function (req, res, next) { next() });

  var r2 = express.Router();
  r2.get('/', function (req, res, next) { next() });

  var subApp = express();
  subApp.get('/', function (req, res, next) { next() });

  app.use(mw1, [mw2, r1, r2], subApp)
  ```

## `app.use()`

Exemplu de compartimentare:

```javascript
app.use('/',      basicRoutes);
app.use('/admin', adminRoutes);
app.use('/api',   apiRoutes);
```
