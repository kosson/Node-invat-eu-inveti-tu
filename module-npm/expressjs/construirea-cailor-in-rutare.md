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

## Referințe

- [Path examples](http://expressjs.com/en/4x/api.html#path-examples)
