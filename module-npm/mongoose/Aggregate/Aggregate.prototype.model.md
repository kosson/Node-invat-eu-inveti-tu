# Aggregate.prototype.model

Setează și obține modelul pe care se va executa agregarea.

```javascript
const aggregate = MyModel.aggregate([{ $match: { answer: 42 } }]);
aggregate.model() === MyModel; // true

// Change the model. There's rarely any reason to do this.
aggregate.model(SomeOtherModel);
aggregate.model() === SomeOtherModel; // true
```
