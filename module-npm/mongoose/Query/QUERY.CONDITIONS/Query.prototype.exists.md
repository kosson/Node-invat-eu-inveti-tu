# Query.prototype.exists()

Metoda specifică condițiile pentru `$exists`.

```javascript
// { name: { $exists: true }}
Thing.where('name').exists()
Thing.where('name').exists(true)
Thing.find().exists('name')

// { name: { $exists: false }}
Thing.where('name').exists(false);
Thing.find().exists('name', false);
```
