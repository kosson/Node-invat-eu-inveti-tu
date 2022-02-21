# Aggregate.prototype.unwind

Adaugă un operator `$unwind` în agregare.

```javascript
aggregate.unwind("tags");
aggregate.unwind("a", "b", "c");
aggregate.unwind({ path: '$tags', preserveNullAndEmptyArrays: true });
```

Pentru a putea fi folosit, calea trebuie să fie precedată cu `$`.
