# Document.prototype.populate()

Metoda populează cu documentele referite în câmpuri și execută callback-ul atunci când operațiunea se încheie. În cazul în care dorești să folosești promisiuni, vei folosi metoda `execPopulate()`. Metoda returnează un `Document`, care este legat la `this`.

```javascript
doc
.populate('company')
.populate({
  path: 'notes',
  match: /airline/,
  select: 'text',
  model: 'modelName'
  options: opts
}, function (err, user) {
  assert(doc._id === user._id) // este pasat callback-ului însuși documentul
})

// summary
doc.populate(path)                   // nu se execută
doc.populate(options);               // nu se execută
doc.populate(path, callback)         // se execută
doc.populate(options, callback);     // se execută
doc.populate(callback);              // se execută
doc.populate(options).execPopulate() // se execută și returnează o promisiune
```

Popularea câmpurilor nu se va face dacă nu este pasat un callback sau dacă nu apelezi explicit metoda `execPopulate()`.

## Argumente

### [path]

Este un `String` sau un `Object` și reprezintă calea care trebuie populată. În cazul unui obiect, acesta poate avea opțiuni.

### [callback]

Este un `Function`, care atunci când este pasat se face și popularea cu date.

## Referințe

- [https://mongoosejs.com/docs/api.html#document_Document-populate](https://mongoosejs.com/docs/api.html#document_Document-populate)
