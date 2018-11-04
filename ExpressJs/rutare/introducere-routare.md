# Routarea

Un apel către serverul motorizat de Express, va conține o cale de la care agentul așteaptă o resursă. Express, are nevoie de un gestionar de rute, care să poată gestiona solicitarea. Trebuie precizat faptul că o aplicație Express odată pornită, va asculta toate apelurile. Fiecare cerere venită la server va fi tratată conform unui lanț de middleware și rute definite.

Dacă în cazul setării aplicației Express am folosit funcția specială `app.set()`, în cazul necesității de a realiza rutarea, se va folosi funcția de extragere a unei valori din obiectul Express. Aceasta va primi doi parametri. Primul este calea pe care ruterul va asculta solicitările, iar al doilea este o funcție anonimă cu rol de callback construită de noi pentru a gestiona răspunsul. Această funcție este numită **request handler**.

```javascript
app.get('/', function (req, res) {
  res.send('Salut prietene!');
});
```

Funcția callback va primi două obiecte drept argumente. Unul este cel care reflectă ceea ce s-a obținut în urma solicitării făcută pe calea specificată și este numit, de regulă `req` (de la *request*), iar celălalt este `res` (de la *response*), care este obiectul cu ajutorul căruia se va construi răspunsul către agent.

Răspunsul poate fi configurabil în cele mai mici amănunte.

```javascript
app.get('/test/:nume', function (req, res) {
  res.status(200);
  res.set('Content-type', 'text/html');
  res.send('<html lang="ro"><head><title>Bau!</title></head><body>' + req.params.nume + '</body></html>');
});
```

## Rutarea folosind express.Router()

Middleware-ul la nivelul rutării lucrează în același fel precum cel folosit în aplicație, dar toate solicitările vor fi direcționate către o instanță `Router`.

```javascript
var router = express.Router();
```

În acest moment, tot middleware-ul va fi utilizat trecându-l în instanța router.

```javascript
router.use(function (req, res, next) {
  console.log('Acest middleware va executa acest log pentru oricare cerere');
  next();
});
```

## Referințe

- [Express. Using middleware](https://expressjs.com/en/guide/using-middleware.html)
