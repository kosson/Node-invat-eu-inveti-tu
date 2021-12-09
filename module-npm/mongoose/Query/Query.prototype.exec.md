# Query.prototype.exec()

Aceasta este metoda, care aplicată pe un obiect `Query`, se va face interogarea bazei de date MongoDB. Această metodă returnează un `Promise`.

Drept parametri poate primi un `String` sau un `Function`, care să indice o anumită operațiune, dar și un callback.

```javascript
var promise = query.exec();
var promise = query.exec('update');

query.exec(callback);
query.exec('find', callback);

query.exec((err, rezultat) => {
  console.log(rezultat);
});
```

Executarea unui `then()` pe obiectul `Query` va avea drept efect apelarea în spate a lui `exec()` care va produce promisiunea pe care se va executa `then()`.

```javascript
query.then((err, rezultat) => {
  console.log(rezultat);
});
```

Se pot folosi și async/await-urile direct pe obiectul `Query` tocmai pentru că un `await query` va apela în spate `exec()` ce va genera promisiunea necesară.

```javascript
var query = Resursa.findById(req.params.idres).populate({
    path: 'competenteS'
});
const rezultat = await query;
````
