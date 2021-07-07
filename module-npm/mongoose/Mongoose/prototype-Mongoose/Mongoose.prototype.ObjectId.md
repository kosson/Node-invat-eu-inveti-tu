# Mongoose.prototype.ObjectId

Este o proprietate care este folosită pentru a marca corespondentul [`ObjectId`](https://docs.mongodb.com/manual/reference/method/ObjectId/) din MongoDB. Nu folosi această proprietate pentru a instanția un nou `ObjectID`. Pentru a face aceasta, te vei folosi de `mongoose.Types.ObjectID`.

### `Mongoose.prototype.Schema()`

Acesta este constructorul folosit pentru a cerea schemele cu ajutorul cărora instanțiezi modelele.

```javascript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NouaSchema = new Schema({
    _id: mongoose.Types.ObjectID
})
```
