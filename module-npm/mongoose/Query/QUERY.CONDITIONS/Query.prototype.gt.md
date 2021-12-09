# Query.prototype.gt

Metoda specifică care este condiția pentru greater than.

Atunci când este apelată cu un singur argument, cea mai recentă cale pasată lui `where` va fi celei căreia i se va aplica.

```javascript
Thing.find().where('age').gt(21);

// sau
Thing.find().gt('age', 21);
```
