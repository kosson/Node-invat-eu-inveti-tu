# Query.prototype.all()

Specifică condițiile pentru operatorul `all`. Când este apelat cu un singur argument, este folosit cu `where`-ul anterior.

```javascript
MyModel.find().where('pets').all(['dog', 'cat', 'ferret']);
// Equivalent:
MyModel.find().all('pets', ['dog', 'cat', 'ferret']);
``` 
