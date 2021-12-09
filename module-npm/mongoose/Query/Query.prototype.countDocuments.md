# Query.prototype.countDocuments()

Se face o scanare a întregii colecții dacă se pasează un filtru gol (`{}`).
Dacă pasezi un callback, se va executa query-ul.
Această metodă declanșează middleware-ul `countDocuments()`.

```javascript
const countQuery = model.where({ 'color': 'black' }).countDocuments();

query.countDocuments({ color: 'black' }).count(callback);

query.countDocuments({ color: 'black' }, callback);

query.where('color', 'black').countDocuments(function(err, count) {
  if (err) return handleError(err);
  console.log('there are %d kittens', count);
});
```
