# Query.prototype.where()

Această metodă specifică o cale pe care să se facă chaining cu o operațiune care se dorește.

```javascript
// instead of writing:
User.find({age: {$gte: 21, $lte: 65}}, callback);

// we can instead write:
User.where('age').gte(21).lte(65);

// passing query conditions is permitted
User.find().where({ name: 'vonderful' })

// chaining
User
.where('age').gte(21).lte(65)
.where('name', /^vonderful/i)
.where('friends').slice(10)
.exec(callback);
```
