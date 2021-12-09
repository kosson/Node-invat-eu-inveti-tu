# Query.prototype.allowDiskUse()

Metoda setează proprietatea `allowDiskUse` pentru serverul MongoDB în cazul în care se folosește mai mult de 100MB pentru `sort()`. Opțiunea permite evitarea erorii `QueryExceededMemoryLimitNoDiskUseAllowed`.

Apelarea lui `query.allowDiskUse(v)` este echivalentă cu `query.setOptions({ allowDiskUse: v })`.

```javascript
await query.find().sort({ name: 1 }).allowDiskUse(true);
// Equivalent:
await query.find().sort({ name: 1 }).allowDiskUse();
```
