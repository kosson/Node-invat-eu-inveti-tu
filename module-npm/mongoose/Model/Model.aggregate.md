# Model.aggregate

Folosind această metodă poți face agregări pe colecția corespondentă modelului. Metoda returnează o instanță `Aggregate`. În cazul în care este pasată o funcție cu rol de callback, va fi executată operațiunea de constituire a agregării și va fi returnat un `Promise`.
Metoda declanșează middleware-ul `aggregate`.

```javascript
// Find the max balance of all accounts
const res = await Users.aggregate([
  { $group: { _id: null, maxBalance: { $max: '$balance' }}},
  { $project: { _id: 0, maxBalance: 1 }}
]);

console.log(res); // [ { maxBalance: 98000 } ]

// Or use the aggregation pipeline builder.
const res = await Users.aggregate().
  group({ _id: null, maxBalance: { $max: '$balance' } }).
  project('-id maxBalance').
  exec();
console.log(res); // [ { maxBalance: 98 } ]
```


## Resurse

- [Model.aggregate() | mongoosejs.com/docs/api](https://mongoosejs.com/docs/api/model.html#model_Model.aggregate)
- [Aggregation | docs.mongodb.com/manual](https://docs.mongodb.com/manual/aggregation/)
- [Aggregate | mongoosejs.com/docs/api](https://mongoosejs.com/docs/api/aggregate.html)
- [An Introduction to Mongoose Aggregate | /masteringjs.io/tutorials/mongoose | May 18, 2020](https://masteringjs.io/tutorials/mongoose/aggregate)