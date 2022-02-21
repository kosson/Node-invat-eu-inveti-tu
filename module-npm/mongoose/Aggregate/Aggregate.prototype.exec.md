# Aggregate.prototype.exec

Metoda execută pipeline-ul agregării care este legată de modelul curent.

```javascript
aggregate.exec(callback);

// Deoarece este returnată o promisiune, `calbackul` este opțional
const promise = aggregate.exec();
promise.then(..);
```
