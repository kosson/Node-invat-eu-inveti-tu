# Aggregate.prototype.pipeline

Citește pipeline-ul curent.

```javascript
MyModel.aggregate().match({ test: 1 }).pipeline(); // [{ $match: { test: 1 } }]
```
