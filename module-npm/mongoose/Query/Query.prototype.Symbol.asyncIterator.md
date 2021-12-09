# Query.prototype.Symbol.asyncIterator()

Metoda returnează un `asyncIterator` care poate fi utilizat în bucle `for...await...of`. Această metodă funcționează dor în cazul query-urilor `find()`. Nu este necesar să apelezi această funcție în mod explicit. Runtime-ul JavaScript o va face.

```javascript
for await (const doc of Model.aggregate([{ $sort: { name: 1 } }])) {
  console.log(doc.name);
}
```
