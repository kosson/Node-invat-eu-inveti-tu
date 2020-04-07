# Query.prototype.getOptions()

Metoda returnează un obiect al opțiunilor care s-au făcut pentru a obține un obiect `Query`.

```javascript
var query = new Query();
query.limit(10);
query.setOptions({ maxTimeMS: 1000 })
query.getOptions(); // { limit: 10, maxTimeMS: 1000 }
```
