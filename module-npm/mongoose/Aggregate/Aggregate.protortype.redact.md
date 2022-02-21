# Aggregate.prototype.redact

Adaugă un operator `$redact`.

```javascript
await Model.aggregate(pipeline).redact({
  $cond: {
    if:   { $eq: [ '$level', 5 ] },
    then: '$$PRUNE',
    else: '$$DESCEND'
  }
});

// $redact often comes with $cond operator, you can also use the following syntax provided by mongoose
await Model.aggregate(pipeline).redact({ $eq: [ '$level', 5 ] }, '$$PRUNE', '$$DESCEND');
```
