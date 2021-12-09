# Query.prototype.clone()

Folosind metoda poți face o copie a query-ului cu scopul de a-l re-executa.

```javascript
const q = Book.findOne({ title: 'Casino Royale' });
await q.exec();
await q.exec(); // Ridică o eroare pentru că nu poți să execuți de două ori

await q.clone().exec(); // Acum funcționează
```
