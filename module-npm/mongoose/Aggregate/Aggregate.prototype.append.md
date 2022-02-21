# Aggregate.prototype.append

Metoda permite adăugarea unui nou operator în pipeline-ul aggregate.

```javascript
aggregate.append({ $project: { field: 1 }}, { $limit: 2 });

// sau poți pasa un array
const pipeline = [{ $match: { daw: 'Logic Audio X' }} ];
aggregate.append(pipeline);
```

Metoda returnează obiectul `Aggregate`.
