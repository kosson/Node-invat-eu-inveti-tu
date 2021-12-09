# Query.prototype.elemMatch()

Specifici condițiile pentru `$elemMatch`.

```javascript
query.elemMatch('comment', { author: 'autobot', votes: {$gte: 5}});

query.where('comment').elemMatch({ author: 'autobot', votes: {$gte: 5}});

query.elemMatch('comment', function (elem) {
  elem.where('author').equals('autobot');
  elem.where('votes').gte(5);
});

query.where('comment').elemMatch(function (elem) {
  elem.where({ author: 'autobot' });
  elem.where('votes').gte(5);
});
```
