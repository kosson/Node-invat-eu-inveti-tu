# Aggregate.prototype.addFields()

Metoda adaugă un operator `$addFields` în pipeline-ul unui aggregate.

```javascript
// adaugă câmpuri noi pe baza celor existente
aggregate.addFields({
    newField: '$b.nested',
    plusTen:  { $add: ['$val', 10]},
    sub:      { name: '$a' }
})

// etc
aggregate.addFields({ salary_k: { $divide: [ "$salary", 1000 ] } });
```
