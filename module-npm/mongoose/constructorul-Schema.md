# Schema - constructor

Drept parametri primește un obiect, care descrie părțile constitutive ale schemei și un al doilea obiect, care sunt opțiunile pe care le poți pasa.

```javascript
var child = new Schema({ name: String });
var schema = new Schema({ name: String, age: Number, children: [child] });
var Tree = mongoose.model('Tree', schema);

// setting schema options
new Schema({ name: String }, { _id: false, autoIndex: false })
```
