# Aggregate.prototype.cursor

Metoda setează opțiunea care creează un cursor și apoi execută agregarea prin returnarea cursorului respectivei agregări. Cursoarele sunt utile dacă dorești să procesezi rezultatele agregării bucată cu bucată pentru că rezultatele agregării sunt prea mari pentru a fi păstrate în memorie.

```javascript
const cursor = Model.aggregate(..).cursor({ batchSize: 1000 });
cursor.eachAsync(function(doc, i) {
  // folosește documentul
});
```
