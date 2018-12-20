# Ce este `use()`

> app.use([path], [function...], function)

Acest middleware are ca efect montarea funcțiilor sale la calea specificată. Dacă nu este specificată calea, este considerat automat că este folosit `/`. Aceste funcții vor fi executate ori de câte ori va fi făcută o cerere pe acea cale. De vreme ce calea va fi default `/` dacă nu este specificată, middleware-ul va fi executat pentru fiecare cerere la `app`. De exemplu:

```js
// this middleware will be executed for every request to the app
app.use(function (req, res, next) {
  console.log('Time: %d', Date.now());
  next();
})
```

## Starea unui middleware lovit de toate cererile la momentul 0:

```js
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});
```

Utilizarea middleware-ului în acest mod este foarte potentă. Se pot face validări pentru a vedea dacă ceea ce vine de la cerere este corect. Putem arunca erori în caz de probleme. Putem face jurnalizare pentru analize statistice care pot fi oferite sau pentru interes de administrare. Aici sunt o grămadă de posibilități.

Testarea rutei pentru a vedea că totul funcționează bine:

```js
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
```

## Execuția funcțiilor middleware-ului și ordinea

ATENȚIE! Funcțiile middleware-ului vor fi executate una după cealaltă așa că ordinea includerii middleware-ului este foarte importantă

De exemplu:

```js
// this middleware will not allow the request to go beyond it
app.use(function(req, res, next) {
  res.send('Hello World');
})

// requests will never reach this route
app.get('/', function (req, res) {
  res.send('Welcome');
})

```

Calea este un string reprezentând:

1.	o cale scrisă explicit:

  ```js
    // will match paths starting with /abcd
  app.use('/abcd', function (req, res, next) {
    next();
  })
  ```

2.	un pattern care reprezintă o cale:

  ```js
  // will match paths starting with /abcd and /abd
  app.use('/abc?d', function (req, res, next) {
    next();
  })

  // will match paths starting with /abcd, /abbcd, /abbbbbcd and so on
  app.use('/ab+cd', function (req, res, next) {
    next();
  })

  // will match paths starting with /abcd, /abxcd, /abFOOcd, /abbArcd and so on
  app.use('/ab*cd', function (req, res, next) {
    next();
  })

  // will match paths starting with /ad and /abcd
  app.use('/a(bc)?d', function (req, res, next) {
    next();
  })
  ```
3.	o expresie regulată

```js
// will match paths starting with /abc and /xyz
app.use(/\/abc|\/xyz/, function (req, res, next) {
  next();
})
```

4.	un array de combinații a variantelor menționate anterior

```js
// will match paths starting with /abcd, /xyza, /lmn, and /pqr
app.use(['/abcd', '/xyza', /\/lmn|\/pqr/], function (req, res, next) {
  next();
})
```

În ceea ce privește funcțiile, acestea pot fi funcțiile middleware-ului, un array de funcții ale middleware-ului sau o combinație a acestora.

1. Funcție de middleware care poate fi definită și montată local.

  ```js
  // A middleware function can be defined and mounted locally.
  app.use(function (req, res, next) {
    next();
  })
  ```

  ```js
  // A router is a valid middleware.
  var router = express.Router();
  router.get('/', function (req, res, next) {
    next();
  })
  app.use(router);

  ```

  ```js
  //  An Express app is a valid middleware.
  var subApp = express();
  subApp.get('/', function (req, res, next) {
    next();
  })
  app.use(subApp);
  ```

2. Poate fi constituit un array

  ```js
  // Clubbing middleware in arrays is a good way to logically group them. The mount path has to be specified, if an array of middleware is passed as the first or the only set of middleware

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

  ```js
  //  All the above ways of mounting middleware can be combined.
  function mw1(req, res, next) { next(); }
  function mw2(req, res, next) { next(); }

  var r1 = express.Router();
  r1.get('/', function (req, res, next) { next(); });

  var r2 = express.Router();
  r2.get('/', function (req, res, next) { next(); });

  var subApp = express();
  subApp.get('/', function (req, res, next) { next(); });

  app.use(mw1, [mw2, r1, r2], subApp)
  ```

## app.use()

exemplu de compartimentare:

```js
app.use('/', basicRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);
```
