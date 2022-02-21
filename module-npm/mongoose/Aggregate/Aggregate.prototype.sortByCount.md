# Aggregate.prototype.sortByCount

Adaugă operatorul `$sortByCount` în agregare.

```javascript
aggregate.sortByCount('users');
aggregate.sortByCount({ $mergeObjects: [ "$employee", "$business" ] });
```
