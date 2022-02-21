# Aggregate.prototype.facet

Metoda combină mai multe pipeline-uri de agregare.

```javascript
const res = await Model.aggregate().facet({
  books: [{ groupBy: '$author' }],
  price: [{ $bucketAuto: { groupBy: '$price', buckets: 2 } }]
});

// Output: { books: [...], price: [{...}, {...}] }
```
