# Căi

Express permite mai multe modalități de formare a căilor necesare rutării.

## Căi explicite

Introduci calea ca prim argument.

```javascript
app.use('/abcd', function (req, res, next) {
  next();
});
```

## Căi după șabloane

O cale care începe cu `ab`, este urmat de caracterul `c`, care poate exista sau nu, urmat de orice caracter, dacă este menționat vreunul, dar care se încheie cu `d`.

```javascript
app.use('/abc?d', function (req, res, next) {
  next();
});
```

Calea de mai jos trebuie să înceapă cu `ab`, poate continua cu orice, dar trebuie să se încheie cu `cd`.

```javascript
app.use('/ab+cd', function (req, res, next) {
  next();
});
```

În cazul de mai jos `\*` înseamnă absolut orice caracter

```javascript
app.use('/ab\*cd', function (req, res, next) {
  next();
});
```

Se pot grupa caractere pentru care se fac opțiuni. În exemplul de mai jos, grupul `(bc)` poate să apară sau nu.

```javascript
app.use('/a(bc)?d', function (req, res, next) {
  next();
});
```

## Expresii regulate

```javascript
app.use(/\/abc|\/xyz/, function (req, res, next) {
  next();
});
```

## Array-uri în orice combinație

Ceea ce permite Express este combinarea de fragmente de text sau șabloane într-un singur array, care va fi folosit pentru a se face potrivirea pe rută.

```javascript
app.use(['/abcd', '/xyza', /\/lmn|\/pqr/], function (req, res, next) {
  next();
});
```

## Parametrii în rute

Parametrii din căi sunt segmente URL folosite pentru a captura valori în funcție de poziția lor din URL. Valorile care sunt extrase din URL sunt introduse în obiectul `req.params`.

```text
Route path: /users/:userId/books/:bookId
Request URL: http://localhost:3000/users/34/books/8989
/* req.params: { "userId": "34", "bookId": "8989"} */
```

Numele parametrilor din rute pot fi caractere literale: ([A-Za-z0-9_]).

```javascript
app.get('/users/:userId/books/:bookId', function (req, res) {
  res.send(req.params)
})
```

Liniuța (`-`) și punctul (`.`) sunt interpretate literal, ceea ce permite realizarea de astfel de parametri precum cei de mai jos.

```text
Route path: /flights/:from-:to
Request URL: http://localhost:3000/flights/LAX-SFO
req.params: { "from": "LAX", "to": "SFO" }
```

Sunt permise și astfel de construcții cu punct.

```text
Route path: /plantae/:genus.:species
Request URL: http://localhost:3000/plantae/Prunus.persica
req.params: { "genus": "Prunus", "species": "persica" }
```

Pentru a controla mai bine string-urile care se vor potrivi cu un anumit șablon, se poate folosi și o expresie regulată, care va fi menționată între paranteze.

```text
Route path: /user/:userId(\d+)
Request URL: http://localhost:3000/user/42
req.params: {"userId": "42"}
```

Referitor la expresii regulate, în Express caracterul `*` este interpretat diferit, recomandarea fiind evitarea folosirii acestuia. În locul lui `*` se poate folosi `{0,}`.

## Referințe

- [Path examples](http://expressjs.com/en/4x/api.html#path-examples)
