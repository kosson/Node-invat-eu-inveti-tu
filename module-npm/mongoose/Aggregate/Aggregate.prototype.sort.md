# Aggregate.prototype.sort

Adaugă un operator `$sort`.
Valorile permise sunt: `asc`, `desc`, `ascending`, `descending`, `1` și `-1`.

```javascript
// următoarele sunt echivalente
aggregate.sort({ field: 'asc', test: -1 });
aggregate.sort('field -test');
```
