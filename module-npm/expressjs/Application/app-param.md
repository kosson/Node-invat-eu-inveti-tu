# Metoda `app.param([name], callback)`

Această metodă declanșează execuția unui callback pentru un *route parameter* sau pentru un array al acestora.
În cazul în care numele parametrului de rută este identificatorul unui array, callback-ul este apelat pentru fiecare din elementele acestuia în ordinea în care sunt în array. Pentru fiecare element din array va fi apelat `next()`, mai puțin pentru ultimul. Apelarea lui `next()` din interiorul callback-ului este necesară pentru a declanșa apelarea callback-ului pentru următorul element ș.a.m.d.

```javascript
app.param('user', function (req, res, next, id) {
  User.find(id, function (err, user) {
    if (err) {
      next(err)
    } else if (user) {
      req.user = user
      next()
    } else {
      next(new Error('nu am putut încărca userul'))
    }
  })
})
```

Valorile din URL sunt disponibile și din obiectul `req.params`, care are drept chei numele date după două puncte, iar valoarea este cea corespondentă din URL (vezi construirea rutelor).

Să presupunem că avem un apel pe `/user/12`. Dacă vom avea un lanț de prelucrare al apelului precum cel de mai jos, toate callback-urile rutelor pentru care cererea se potrivește, vor fi executate.

```javascript
app.param('id', function (req, res, next, id) {
  console.log('AICI VA FI APELAT prima dată')
  next()
})

app.get('/user/:id', function (req, res, next) {
  console.log('dar și aici')
  next()
})

app.get('/user/:id', function (req, res) {
  console.log('chiar și aici.')
  res.end()
})
```

Pentru secvența de callback-uri de mai sus, cererea va declanșa execuția tuturor callback-urilor care au șablonul căii potrivit acesteia. În cazul nostru, toate cele trei mesaje vor fi afișate. La fel se ve întâmpla și în cazul în care parametrii sunt într-un array pentru o cale asemănătoare cu `/user/42/3`.

```javascript
app.param(['id', 'page'], function (req, res, next, value) {
  console.log('AICI VA FI APELAT cu valoarea: ', value);
  next();
})

app.get('/user/:id/:page', function (req, res, next) {
  console.log('dar și aici');
  next();
})

app.get('/user/:id/:page', function (req, res) {
  console.log('dar și aici');
  res.end();
})
```
