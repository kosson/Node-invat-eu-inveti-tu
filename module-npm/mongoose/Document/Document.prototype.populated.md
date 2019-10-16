# Document.prototype.populated()

Folosind metoda, se obțin `_id`-urile folosite pentru popularea unei anumite căi.
Dacă respectiva cale nu este populată, este returnat `undefined`.

```javascript
Model.findOne().populate('author').exec(function (err, doc) {
  console.log(doc.author.name)         // Dr.Seuss
  console.log(doc.populated('author')) // '5144cf8050f071d979c118a7'
})
```

Metoda poate returna următoarele tipuri de valori:

- `Array`,
- `ObjectId`,
- `Number`,
- `Buffer`,
- `String`,
- `undefined`.

## Parametrii

### `path`

Este un `String`.
