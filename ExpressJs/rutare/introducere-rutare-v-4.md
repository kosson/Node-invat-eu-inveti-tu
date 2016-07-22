# express.Router();

Se comportă ca o miniaplicație. Poți apela o instanță a acesteia și apoi să definești rute pe aceea.

1. cheamă o instanță a ruterului
2. adaugă rute la aceasta
3. adaugă aceste rute la aplicația principală

```js
// obtine o instanta a routerului
var adminRouter = express.Router();

//adauga o ruta pe administrator
adminRouter.get('/', function(req, res){
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

Trebuie reținut faptul că putem avea oricâte rutere avem nevoie. Pentru fiecare zonă a aplicației putem avea un ruter diferit.
Toate acete rutere pot fi adaugate aplicației.

Ordinea în care pui middleware-ul este foarte importantă. Totul se va ăntâmpla în ordinea în care va apărea. Acest lucru înseamnă că de vei pune middleware-ul după o rută, atunci rutarea se va face înainte de middleware iar cererea se va termina acolo nemaiajungând la middleware. Un middleare poare fi folosit pentru a vedea dacă un utilizator este logat sau nu într-o sesiune de lucru.

Rutarea este foarte utilă pentru compartimentarea aplicațiilor complexe.


## Rute simple

### Rută simplă pentru homepage

```js
app.get('/', function(req, res) {
  res.send('Welcome to the home page!');
});
```

### Instanțiază un router

```js
var apiRouter = express.Router();
```

### Fă o rută de text

```js
apiRouter.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});
```

După ce ai scris toate rutele aici trebuie să folosești routerul sau routerele, dacă sunt mai multe cu middlewareul Express

```js
app.use('/api', apiRouter);
```
