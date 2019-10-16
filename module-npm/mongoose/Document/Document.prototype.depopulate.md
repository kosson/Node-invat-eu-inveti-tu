# Document.prototype.depopulate()

Metoda primește un câmp populat și returnează același câmp la valoarea de dinainte să fie populat. În cazul în care câmpul nu a fost populat, metoda este un no-op.

Returnează un obiect de tip `Document`, la care se realizează și legătura `this`.

```javascript
Model.findOne().populate('author').exec(function (err, doc) {
  console.log(doc.author.name); // Dr.Seuss
  console.log(doc.depopulate('author'));
  console.log(doc.author); // '5144cf8050f071d979c118a7'
})
```
