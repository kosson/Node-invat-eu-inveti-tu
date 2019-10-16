# Model

Această clasă este folosită pentru a realiza comunicarea cu MongoDB. Instanțierea unui `Model` este numită `Document`.

```javascript
// `UserModel` este un "Model", adică o subclasă a lui `mongoose.Model`.
const UserModel = mongoose.model('User', new Schema({ name: String }));

// You can use a Model to create new documents using `new`:
const userDoc = new UserModel({ name: 'Foo' });
await userDoc.save();

// You also use a model to create queries:
const userFromDb = await UserModel.findOne({ name: 'Foo' });
```

## Queries

Modelele Mongoose oferă câteva funcții statice pentru a realiza operațiuni CRUD. Toate acestea returnează un obiect `Query`.

###[`Model.find()`](https://mongoosejs.com/docs/api.html#model_Model.find)

În cazul în care este necesar, rezultatele venite de la MongoDB pot fi prelucrate ca stream Node.js. În acest scop, trebuie să apelezi metoda `cursor` disponibilă din obiectul prototipal a constructorului `Query`.

```javascript
var cursor = Person.find({ occupation: /host/ }).cursor();
cursor.on('data', function(doc) {
  // Called once for every document
});
cursor.on('close', function() {
  // Called when done
});
```
