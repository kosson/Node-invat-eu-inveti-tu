# Query.prototype.box()

Specifică condițiile pentru operatorul `$box`.

```javascript
const lowerLeft = [40.73083, -73.99756]
const upperRight= [40.741404,  -73.988135]

query.where('loc').within().box(lowerLeft, upperRight)
query.box({ ll : lowerLeft, ur : upperRight })
```
