# Aggregate.prototype.lookup

Adaugă un operator `$lookup` în pipeline.

```javascript
aggregate.lookup({
  from:         'users',
  localField:   'userId',
  foreignField: '_id',
  as:           'users'
});
```
