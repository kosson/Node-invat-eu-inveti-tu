# Introducere Model

Este principala clasă prin care se realizează interacțiunea cu MongoDB. Instanțierea unui `Model` se numește `Document`. Constructorul `Model()` nu trebuie folosit în mod direct. Există un lucru important care trebuie înțeles în acest context. Ceea ce numim `Model` în Mongoose, de fapt sunt subclasele clasei `mongoose.Model`.

Funcțiile `mongoose.model()` și `connection.model()` creează subclase ale lui `mongoose.Model`.

```javascript
// `UserModel` este un "Model", adică o subclasă a lui `mongoose.Model`.
const UserModel = mongoose.model('User', new Schema({ name: String }));

// Pentru a crea documente noi, instanțiezi un model cu `new`:
const userDoc = new UserModel({ name: 'Foo' });
await userDoc.save();

// Poți folosi un model pentru a crea interogări în baza de date:
const userFromDb = await UserModel.findOne({ name: 'Foo' });
```
