# Query.prototype.estimatedDocumentCount()

Această metodă este mai rapidă decât `countDocuments()` pentru cazul în care ai de-a face cu dimensiuni mari ale unei colecții deoarece `estimatedDocumentCount` se bazează pe metadatele colecției fără a scana întreaga colecție.

Metoda nu acceptă filtre.

`Model.find({ foo: bar }).estimatedDocumentCount()` este echivalent cu `Model.find().estimatedDocumentCount()`.

Metoda declanșează executarea următorului middleware: `estimatedDocumentCount()`.

```javascript
await Model.find().estimatedDocumentCount();
```
