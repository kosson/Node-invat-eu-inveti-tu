# Document.prototype.save()

Această metodă se folosește pentru a salva un document în baza de date MongoDB.

Această metodă se aplică numai pe documente. Mențiunea este importantă pentru că uneori poți confunda un `Query` cu un `Document`.

Metoda returnează valoarea `undefined`, dacă este folosită cu un callback, și un `Promise`, dacă nu este menționat callback-ul.

## Parametri

### `[options]`

Metoda poate primi opțional un `Object` care menționează opțiuni `[options]`. Pentru `[options.validateBeforeSave]` va avea o valoarea `Boolean` și va face salvarea documentului fără a face validări pe date.

### `[fn]`

Un al doilea parametru posibil este un callback.

```javascript
documentul.save(function (err, document) {
  if (err) throw err;
  console.log(document);
});
```

Al doilea parametru al callback-ului este chiar documentul care a fost salvat în baza de date.

## Promisiuni

Mai jos avem exemplul unui document salvat, care apoi oferă posibilitatea de a gestiona documentul într-un `then`.

```javascript
document.save().then(function (documentulSalvat) {
  console.log(documentulSalvat);
}).catch(error => {
  if (err) throw err;
});
