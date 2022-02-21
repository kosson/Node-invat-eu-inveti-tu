# Aggregate.prototype.option

Permite adăugarea de opțiuni arbitrare.

```javascript
const agg = Model.aggregate(..).option({ allowDiskUse: true });
// Setează opțiunea `allowDiskUse`
agg.options; // `{ allowDiskUse: true }`
```
