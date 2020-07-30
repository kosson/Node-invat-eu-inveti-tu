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

## metode statice și ale modelului hidratat

În Mongoose ai două tipuri de metode care diferă. Unele se pot aplica pe model direct înainte ca acesta să fi fost hidratat cu date precum în cazul unui `find()`, de exemplu. Celelalte sunt metode care se pot aplica după hidratarea cu date.

Pentru a defini metode [statice](https://mongoosejs.com/docs/guide.html#statics) se pot aborda două căi. Fie adaugi o proprietate (funcție) la `schema.statics`, fie adaugi o proprietate direct pe obiectul `Schema` definit. Proprietățile statice nu trebuie definite folosite funcțiile săgeată.

```javascript
// Introdu o funcție drept proprietate obiectului "statics" pentru animalSchema
animalSchema.statics.findByName = function(name) {
  return this.find({ name: new RegExp(name, 'i') });
};
// sau poți apela direct pe obiectul Schema metoda: `animalSchema.static()`.
animalSchema.static('findByBreed', function(breed) {
  return this.find({ breed });
});

const Animal = mongoose.model('Animal', animalSchema);
let animals = await Animal.findByName('fido');
animals = animals.concat(await Animal.findByBreed('Poodle'));
```
