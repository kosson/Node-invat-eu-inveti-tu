# Aggregate.prototype.project

Agaugă operatorul `$project`.

```javascript
// include a, include b, exclude _id
aggregate.project("a b -_id");

// or you may use object notation, useful when
// you have keys already prefixed with a "-"
aggregate.project({a: 1, b: 1, _id: 0});

// reshaping documents
aggregate.project({
    newField: '$b.nested'
  , plusTen: { $add: ['$val', 10]}
  , sub: {
       name: '$a'
    }
})

// etc
aggregate.project({ salary_k: { $divide: [ "$salary", 1000 ] } });
```
