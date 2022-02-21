# Aggregate.prototype.unionWith

Adaugă un operator `$unionWith` în agregare.

```javascript
aggregate.unionWith({ coll: 'users', pipeline: [ { $match: { _id: 1 } } ] });
```
