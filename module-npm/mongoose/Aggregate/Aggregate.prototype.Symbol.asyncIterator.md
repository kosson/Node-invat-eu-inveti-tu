# Aggregate.prototype.Symbol.asyncIterator

```javascript
const agg = Model.aggregate([{ $match: { age: { $gte: 25 } } }]);
for await (const doc of agg) {
  console.log(doc.name);
}
```
