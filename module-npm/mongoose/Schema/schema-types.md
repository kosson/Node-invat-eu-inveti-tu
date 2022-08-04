# SchemaTypes

Un câmp care conține date, adică o proprietate a viitoarei înregistrări, în Mongoose se numește [[cale]] (*path*). MongoDB este o bază de date care nu impune o schemă pentru datele care sunt introduse. Mongoose este un ODM (Object Data Modeling) care oferă posibilitatea de a modela datele unei aplicații Nodejs.

În Mongoose, un `SchemaType` este un obiect cu ajutorul căruia configurezi cum trebuie să arate datele și care sunt regulile pe care trebuie să le respecte când vor ajunge într-un  viitor document. Reține faptul că documentele se mapează direct pe datele din MongoDB.  Privește-l ca pe un configurator al datelor unei căi. Pe lângă definirea tipului de date, poți menționa dacă are getteri/setteri și care sunt valorile considerate valide pentru respectiva cale.

Cu ajutorul unei scheme nu vei putea gestiona datelele din MongoDB. În acest scop vei folosi un model.

```javascript
const mongoose = require('mongoose');
const {Schema} = mongoose;
const schema = new Schema({
  name: String
});
schema.path('name') instanceof mongoose.SchemaType; // true
schema.path('name') instanceof mongoose.Schema.Types.String; // true
schema.path('name').instance; // 'String'
```

`SchemaType` folosește un obiect `SchemaTypeOptions` pentru a configura un *path*. Fiecare cale este o instanță a unui obiect `SchemaType`:

```javascript
const schema = new Schema({ name: String });
schema.path('name') instanceof SchemaType; // true
```
Mongoose convertește automat căile în obiecte `SchemaTypes`. Atunci când folosește un obiect de configurare, este precizat tipul, cum se validează, care este valoarea din oficiu pentru acea cale, plus alte configurări specifice Mongoose.

Clasa `SchemaType` este o clasă care este extinsă mai departe de tipurile de bază din Mongoose:

* `mongoose.Schema.Types.String`
* `mongoose.Schema.Types.Number`
* `mongoose.Schema.Types.Date`
* `mongoose.Schema.Types.Buffer`
* `mongoose.Schema.Types.Boolean`
* `mongoose.Schema.Types.Mixed`
* `mongoose.Schema.Types.ObjectId` (sau `mongoose.ObjectId`)
* `mongoose.Schema.Types.Array`
* `mongoose.Schema.Types.Decimal128`
* `mongoose.Schema.Types.Map`
* `mongoose.Schema.Types.Schema`

```javascript
const schema = new Schema({ name: String, age: Number });

schema.path('name') instanceof mongoose.SchemaType; // true
schema.path('name') instanceof mongoose.Schema.Types.String; // true

schema.path('age') instanceof mongoose.SchemaType; // true
schema.path('age') instanceof mongoose.Schema.Types.Number; // true
```

## Diferența dintre un SchemaType și un type

Un obiect *SchemaType* este diferit de proprietarea *type* care este folosit pentru a indica tipul valorii într-un obiect de configurare, precum: `age: { type: Number, min: 18, max: 65 }`. *SchemaType* este o clasă.


```javascript
mongoose.ObjectId !== mongoose.Types.ObjectId
```

Atunci când este folosită proprietatea `type`, acesta indică în contextul obiectului de configurare care este tipul valorii acceptate în viitorul model care va primi datele.

```javascript
const mongoose = require('mongoose');
const {Schema} = mongoose;
const schema = new Schema({
  name: {
    type: String,
    required: true
  }
});
```

Observă faptul că la investigarea tipului folosind `schema.path('name').instance;` va fi returnat tipul câmpului care este `String`. În cazul special în care dorești ca datele unei căi să fie un obiect care să aibă o proprietate denumită `type` va trebui să o definești.

```javascript
const mongoose = require('mongoose');
const {Schema} = mongoose;
const schema = new Schema({
  name: {
    type: {
      type: String
    },
    required: true
  }
});
```

## Exemplu cu toate tipurile de date

```javascript
const schema = new Schema({
  name:    String,
  binary:  Buffer,
  living:  Boolean,
  updated: { type: Date, default: Date.now },
  age:     { type: Number, min: 18, max: 65 },
  mixed:   Schema.Types.Mixed,
  _someId: Schema.Types.ObjectId,
  decimal: Schema.Types.Decimal128,
  array: [],
  ofString: [String],
  ofNumber: [Number],
  ofDates: [Date],
  ofBuffer: [Buffer],
  ofBoolean: [Boolean],
  ofMixed: [Schema.Types.Mixed],
  ofObjectId: [Schema.Types.ObjectId],
  ofArrays: [[]],
  ofArrayOfNumbers: [[Number]],
  nested: {
    stuff: { type: String, lowercase: true, trim: true }
  },
  map: Map,
  mapOfString: {
    type: Map,
    of: String
  }
})

// exemplu de model completat
const Thing = mongoose.model('Thing', schema);

const m = new Thing;
m.name = 'Statue of Liberty';
m.age = 125;
m.updated = new Date;
m.binary = Buffer.alloc(0);
m.living = false;
m.mixed = { any: { thing: 'i want' } };
m.markModified('mixed');
m._someId = new mongoose.Types.ObjectId;
m.array.push(1);
m.ofString.push("strings!");
m.ofNumber.unshift(1,2,3,4);
m.ofDates.addToSet(new Date);
m.ofBuffer.pop();
m.ofMixed = [1, [], 'three', { four: 5 }];
m.nested.stuff = 'good';
m.map = new Map([['key', 'value']]);
m.save(callback);
```

## Proprietatea type

Această proprietate este specială pentru schemele Mongoose. Atunci când Mongoose găsește o proprietate în adâncimea unei structuri a schemei, care are drept cheie `type`, Mongoose presupune că se definește un `SchemaType` de un anumit tip.

```javascript
const schema = new Schema({
  name: { type: String },
  nested: {
    firstName: { type: String },
    lastName: { type: String }
  }
});
```
În cazul în care ai nevoie de o proprietate care să se numească chiar `type`, vei aplica următoarea strategie

```javascript
const holdingSchema = new Schema({
  // This is how you tell mongoose you mean `asset` is an object with
  // a string property `type`
  asset: {
    type: { type: String },
    ticker: String
  }
});
```

## Verificarea valorilor primite și opțiuni

Poți declara tipul unui path al schemei precizând direct tipul valorii, sau poți folosi un obiect de configurare, care precizează proprietatea `type`.

```javascript
const schema1 = new Schema({
  test: String // `test` este un path de tipul String
});

const schema2 = new Schema({
  // Obiectul `test` conține "opțiuni SchemaType"
  test: { type: String } // `test` este un path de tipul String
});
```

Folosirea unui obiect de configurare are avantajul adăugării mai multor opțiuni care țin de formatul valorii primite sau de validare a datelor.

```javascript
const schema2 = new Schema({
  test: {
    type: String,
    lowercase: true // Convertește `test` la lowercase
  }
});
```

### Posibilele proprietăți ale obiectul de configurare

Acestea sunt opțiunile pe care le poți preciza în obiectul de configurare a unui path. Să examinăm exemplul următor:

```javascript
const numberSchema = new Schema({
  integerOnly: {
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    alias: 'i'
  }
});

const Number = mongoose.model('Number', numberSchema);

const doc = new Number();
doc.integerOnly = 2.001;
doc.integerOnly; // 2
doc.i; // 2
doc.i = 3.001;
doc.integerOnly; // 3
doc.i; // 3
```

#### required

Valoarea acestei proprietăți poate fi un `Boolean` ori o funcție. Dacă evaluează la true valoarea, adaugă criteriul ca această proprietate să aibă valoare dată. Vezi și validări.

#### default

Precizează care este valoarea ca va fi introdusă din oficiu în document. Dacă nu este o valoare, poate fi o funcție, iar rezultatul evaluării acesteia va fi valoarea default. 

#### select

Este o valoare `Boolean` care specifică proiecțiile care să fie folosite din oficiu pentru interogări.

#### validate

Aceasta este o funcție care face validarea pentru proprietatea în cauză.

#### get

Este o funcție care definește un *getter* parametrizat pentru proprietatea în cauză. Folosește `Object.defineProperty()`.

#### set

Este o funcție care definește un *setter* parametrizat pentru proprietatea în cauză. Folosește `Object.defineProperty()`.

#### alias

Este o valoare string care definește numele un virtual care va fi folosit pentru a identifica rapid calea pe care se va face get/set.

#### immutable

Este o valoare `Boolean` care definește calea ca fiind imuabilă. Mongoose împiedică modificarea căilor imuabile, excepție făcând setarea `isNew: true` pe documentul părinte.

#### transform

Valoarea este o funcție pe care Mongoose o apelează această funcție atunci când apelezi funcția Document#toJSON(), fiind inclus și cazul în care aplici `JSON.stringify()` pe un document.

#### Crearea de indexuri

Folosind opțiunile de configurare a căilor, se pot defini și indexuri MongoDB. Tipuri de indexuri:

- `index`, o valoare `Boolean` care indică dacă se va constitui un [index](https://docs.mongodb.com/manual/indexes/) din proprietate;
- `unique`, o valoare `Boolean` care indică dacă se va crea un [index unic](https://docs.mongodb.com/manual/core/index-unique/);
- `sparse`, o valoare `Boolean` care indică dacă se va crea un [index sparse](https://docs.mongodb.com/manual/core/index-sparse/).

```javascript
const schema2 = new Schema({
  test: {
    type: String,
    index: true,
    unique: true // Index unic. În cazul în care specifici `unique: true`
    // menționarea lui `index: true` este opțională
  }
});
```

## Tipurile posibile pentru un path

### `String`

Pentru a declara un câmp ca fiind de tip `String`, poți menționa obiectul global `String` sau șirul de caractere `"String"`.

```javascript
const schema1 = new Schema({ nume: String }); // valoare primită pentru proprietatea nume va suporta un cast la string
const schema2 = new Schema({ nume: 'String' }); // Varianta echivalentă

const Persoană = mongoose.model('Persoană', schema2);
```

Reține faptul că în cazul în care modelul va primi o valoare pentru care schema prevede a fi de tip `String`, Mongoose va face o transformare a acelei valori la corespondentul `String`.

```javascript
new SchemaDeExemplu({nume: 33}).nume; // valoarea va fi transformată în `String` -> "33"
new SchemaDeExemplu({nume: {toString: () => 33}}); // tot `String` -> "33"
new SchemaDeExemplu({nume: {altceva: true}}); // va rezulta o eroare "undefined" la salvare 
```

Dacă documentului îi este pasată o valoare care are metoda `toString()`, Mongoose o va apela. Excepția o constituie un array ori dacă funcția `toString()` este strict egală cu `Object.prototype.toString()`.

#### Proprietățile pentru obiectul ce declară un String

Parametrizarea câmpului de tip `String` se poate face cu următoarele proprietăți adăugate obiectului.

- `lowercase` o valoare `Boolean` care indică apelarea `.toLowerCase()` pe valoare;
- `uppercase` o valoare `Boolean` care indică apelarea `.toUpperCase()` pe valoare;
- `trim` o valoare `Boolean` care indică apelarea `.trim()` pe valoare;
- `match` este un RegExp care creează un validator ce verifică dacă valoarea se potrivește cu șablonul;
- `enum` este un Array care creează un validator ce verifică dacă valoarea este în respectivul Array;
- `minLength` este un Number care creează un validator ce verifică ca valoarea să nu fie mai mică de cea din oficiu;
- `maxLength` este un Number care creează un validator ce verifică ca valoarea să nu fie mai mare decât cea din oficiu;
- `populate` este un Object care [parametrizează](https://mongoosejs.com/docs/populate.html#query-conditions) modul în care va fi făcut populate-ul.

```javascript
Story.
  find().
  populate({
    path: 'fans',
    match: { age: { $gte: 21 } },
    // Menționează dorința de a exclude câmpul `_id`. Vezi http://bit.ly/2aEfTdB
    select: 'name -_id'
  }).
  exec();
```

### `Number`

Pentru a declara un câmp ca fiind de tip `Number`, poți menționa obiectul global `String` sau șirul de caractere `"Number"`.

```javascript
const schema1 = new Schema({ age: Number }); // face cast la Number
const schema2 = new Schema({ age: 'Number' }); // echivalenta

const Car = mongoose.model('Car', schema2);
```

Următoarele valori vor fi transformate în valori `Number`.

```javascript
new Car({ age: '15' }).age; // 15 ca Number
new Car({ age: true }).age; // 1 ca Number
new Car({ age: false }).age; // 0 ca Number
new Car({ age: { valueOf: () => 83 } }).age; // 83 ca Number
```

Pentru `null` și `undefined` nu se face casting.

Parametrizarea câmpului de tip `Number` se poate face cu următoarele proprietăți adăugate obiectului de parametrizare.

- `min` este un Number care creează un validator ce verifică ca valoarea să nu fie mai mică de cea din oficiu;
- `max` este un Number care creează un validator ce verifică ca valoarea să nu fie mai mare decât cea din oficiu;
- `enum` este un Array care creează un validator ce verifică dacă valoarea este în respectivul Array;
- `populate` este un Object care [parametrizează](https://mongoosejs.com/docs/populate.html#query-conditions) modul în care va fi făcut populate-ul.

### `Date`

Parametrizarea câmpului de tip `Date` se poate face cu următoarele proprietăți adăugate obiectului de parametrizare.

- `min` valoarea datei calendaristice ca limită inferioară pe scala timpului (`Date`);
- `max` valoarea datei calendaristice ca limită inferioară pe scala timpului (`Date`).

Metodele `Date` nu sunt luate în considerare de mecanismul de tracking al Mongoose, ceea ce înseamnă că în cazul în care ai o valoare `Date` în documentul gata de a fi salvat și îl modifici cu o metodă `setMonth()`, aceasta nu se va reflecta în documentul salvat. Totuși, pentru a modifica o astfel de valoare și pentru a o salva, va trebui să-i comunici lui Mongoose modificarea prin `doc.markModified('pathToYourDate')`.

```javascript
const Assignment = mongoose.model('Assignment', { dueDate: Date });
Assignment.findOne(function (err, doc) {
  doc.dueDate.setMonth(3);
  doc.save(callback); // NU SE VA SALVA

  doc.markModified('dueDate');
  doc.save(callback); // acum funcționează
})
```

### `Buffer`

Pentru a declara o cale drept `Buffer`, poți folosi obiectul global `Buffer` sau șirul de caractere `"Buffer"`.

```javascript
const schema1 = new Schema({ binData: Buffer });   // binData va suferi un cast la Buffer
const schema2 = new Schema({ binData: 'Buffer' }); // formula echivalentă

const Data = mongoose.model('Data', schema2);
```

Mongoose va face un cast al valorilor.

```javascript
const file1 = new Data({ binData: 'test'}); // {"type":"Buffer","data":[116,101,115,116]}
const file2 = new Data({ binData: 72987 }); // {"type":"Buffer","data":[27]}
const file4 = new Data({ binData: { type: 'Buffer', data: [1, 2, 3]}}); // {"type":"Buffer","data":[1,2,3]}
```

### `Boolean`

Boolean-urile în Mongoose sunt valorile Boolean din JavaScript. Din oficiu, următoarele valori sunt transformate la Boolean de către Mongoose.

- true
- 'true'
- 1
- '1'
- 'yes'

și pentru false

- false
- 'false'
- 0
- '0'
- 'no'

Orice alte valori găsite vor genera o eroare `CastError`. Ai putea modifica valorile convertite de Mongoose la `true` sau `false`, folosind proprietățile `convertToTrue` sau `convertToFalse`. Aceste proprietăți sunt `Set`-uri JavaScript cu valorile ce se reduc la `true` sau la `false`. Acestor valori care deja există și le-am menționat mai sus, poți adăuga unele noi.

```javascript
const M = mongoose.model('Test', new Schema({ b: Boolean }));
console.log(new M({ b: 'nay' }).b); // undefined

// Set { false, 'false', 0, '0', 'no' }
console.log(mongoose.Schema.Types.Boolean.convertToFalse);

mongoose.Schema.Types.Boolean.convertToFalse.add('nay');
console.log(new M({ b: 'nay' }).b); // false
```

### `Mixed`

Acest tip de valoare permite introducerea în document a unei structuri de date care nu este reglementată strict și pentru care Mongoose nu va face casting al valorilor. Definirea unui `Schema.Types.Mixed` se poate face prin pasarea drept valoare a unui obiect literal gol.

```javascript
const Any = new Schema({ orice: {} });
const Any = new Schema({ orice: Object });
const Any = new Schema({ orice: Schema.Types.Mixed });
const Any = new Schema({ orice: mongoose.Mixed });
// Atenție, dacă din oficiu folosești `type`, dacă-i atribui un POJO, va transforma calea în mixed
const Any = new Schema({
  orice: {
    type: { foo: String }
  } // "orice" va fi un Mixed - tot ce cuprinde va fi ignorat.
});
// Totuși, odată cu versiunea Mongoose 5.8.0, acest comportament poate fi suprascris folosind typePojoToMixed.
// In that case, it will create a single nested subdocument type instead.
const Any = new Schema({
  orice: {
    type: { foo: String }
  } // "orice" va fi un singur subdocument nested.
}, {typePojoToMixed: false});
```

Datorită faptului că `Mixed` este un tip ce nu are o schemă, poți modifica valoarea în cea pe care o dorești. În acest caz, Mongoose, nu mai poate detecta modificările pe care le aduci. Pentru a-i spune lui Mongoose că valoarea unui `Mixed` s-a modificat, trebuie să apelezi `doc.markModified(path)`, unde `path` este numele căii care este `Mixed`.

```javascript
person.anything = { x: [3, 4, { y: "modificat" }] };
person.markModified('orice');
person.save(); // Mongoose va salva modificările din câmpul `orice`.
```

Aceste mici probleme pot fi considerate a fi niște efecte secundare care pot fi evitate dacă declari calea ca fiind un `Subdocument`.

### `ObjectId`

Un `ObjectId` este un type special folosit pentru identificatori unici drept valori ai unei căi.

```javascript
const mongoose = require('mongoose');
const oSchema = new mongoose.Schema({ calenouă: mongoose.ObjectId });
```

`ObjectId` este de fapt o clasă, iar `ObjectId`-urile rezultate sunt obiecte rezultate prin instanțiere (vezi și [ObjectId](https://docs.mongodb.com/manual/reference/method/ObjectId/) din documentația MongoDB). Reprezentarea acestora este prin șiruri de caractere. Dacă vei converti un `ObjectId` la string folosind `toString()` vei obține un șir de caractere hexazecimal cu o lungime de 24.

```javascript
const Car = mongoose.model('Car', carSchema);

const car = new Car();
car.driver = new mongoose.Types.ObjectId();

typeof car.driver; // 'object'
car.driver instanceof mongoose.Types.ObjectId; // true

car.driver.toString(); // Ceva asemănător cu "5e1a0651741b255ddda996c4"
```

Parametrizarea câmpului de tip `ObjectId` se poate face cu următoarele proprietăți adăugate obiectului de parametrizare.

- `populate` este un Object care [parametrizează](https://mongoosejs.com/docs/populate.html#query-conditions) modul în care va fi făcut populate-ul.

### `Array`

Mongoose oferă suport pentru array-uri de `SchemaTypes` și array-uri de `Subdocuments`. Array-urile de `SchemaTypes` sunt numite și *primitive arrays*, iar array-urile de subdocumente sunt numite și *document arrays*. Array-urile în Mongoose sunt o subclasă a obiectului `Array` care a fost extins prin mai multe funcționalități suplimentare.

```javascript
const ToySchema = new Schema({ name: String });
const ToyBoxSchema = new Schema({
  toys: [ToySchema],
  buffers: [Buffer],
  strings: [String],
  numbers: [Number]
  // ... etc
});
Array.isArray(ToyBoxSchema.strings); // true
ToyBoxSchema.strings.isMongooseArray; // true
```

După cum spuneam, Mongoose subclasează obiectul intern `Array`. De exemplu, atunci când faci un `push()` de elemente, metoda va fi interceptată și modelul va fi alimentat cu datele noi folosind `$push`. Reține faptul că obiectul modelului ține evidența datelor încărcate în el în sensul sesizării modificărilor și luarea acestora în considerare la momentul salvării în baza de date.

```javascript
const ToyBox = mongoose.model('ToyBox', ToyBoxSchema);

mongoose.set('debug', true);

ToyBox.strings.push('ceva');
// Pentru că ești în modul 'debug' vor fi afișate informații despre cum s-a făcut actualizarea
await ToyBox.save();
```

Array-urile ocupă o poziție specială pentru că au valoarea din oficiu un array gol `[]`. Folosind exemplul de mai sus:

```javascript
const ToyBox = mongoose.model('ToyBox', ToyBoxSchema);
console.log((new ToyBox()).toys); // []
```

Pentru a suprascrie acest comportament din oficiu, va trebui setată valoarea lui `default` la `undefined`.

```javascript
const ToyBoxSchema = new Schema({
  toys: {
    type: [ToySchema],
    default: undefined
  }
});
```

Specificarea directă în schemă a unui array gol are același efect al unui `Mixed`. Următoarele exemple creează array-uri de `Mixed`.

```javascript
const Empty1 = new Schema({ orice: [] });
const Empty2 = new Schema({ orice: Array });
const Empty3 = new Schema({ orice: [Schema.Types.Mixed] });
const Empty4 = new Schema({ orice: [{}] });
```

#### Array-uri de documente

Suplimentar, Mongoose oferă suport și pentru array-uri de subdocumente.

```javascript
const oSchemaCuGrup = new Schema({
  nume: String,
  membri: [{ nume: String, prenume: String }]
}, { versionKey: false }); // creează schema

const Grup = mongoose.model('Grup', oSchemaCuGrup); // constituie modelul

const grupNou = new Grup({
  nume: "Cântăreții din Bremen",
  membri: [{nume: "Măgarul", prenume: "Bariton"}]
});

Array.isArray(grupNou.membri);
grupNou.membri.isMongooseArray; // true
grupNou.membri.isMongooseDocumentArray; // true
```

Dacă dorești, poți actualiza valori înainte de a le salva.

```javascript
mongoose.set('debug', true);
grupNou.membri[0].nume = "Cocoșul";

await grupNou.save();
```

Atenție, pentru valori primare nu poți aplica aceeași adresare pe indecși. Va trebui folosită, fie metoda `markModified()`, fie apelarea metodei `set()` a obiectului `MongooseArray`.

```javascript
const BlogPost = new Schema({
  titlu: String,
  taguri: [String]
}, { versionKey: false }); // creează schema

const Blog = mongoose.model('Blog', BlogPost); // creează modelul

const Post = new Blog({
  titlu: "Un început interesant",
  taguri: ['mongoose']
});
Post.taguri.set('0', "mongodb");
await Post.save();
```

### `Decimal128`

### `Map`

Acest `SchemaType` a fost introdus odată cu versiunea 5.1, fiind o subclasă a `Map`-ului din JavaScript. În documentația Mongoose, map și `MongooseMap` sunt folosite interșanjabil, descriind același tip de valoare.

Într-un `MongooseMap`, cheile trebuie să fie string-uri pentru a stoca o valoare.

```javascript
const userSchema = new Schema({
  // `socialMediaHandles` este un map al cărui valori sunt string-uri
  // Cheile sunt întotdeauna stringuri. Specifici tipul valorilor folosind `of`.
  socialMediaHandles: {
    type: Map,
    of: String
  }
});

const User = mongoose.model('User', userSchema);

console.log(new User({
  socialMediaHandles: {
    github: 'kosson',
    twitter: '@kosson'
  }
}).socialMediaHandles);
// Map { 'github' => 'kosson', 'twitter' => '@kosson' }
```

După cum se observă din exemplu, schema nu declară explicit cheile `github` și `twitter` ale map-ului. Acestea sunt introduse în map pentru că această structură de date acceptă valori arbitrare.
Pentru că folosești un `Map` de fapt, va trebui să setezi și să obții valorile folosind metodele caracteristice: `set()` și `get()`.

```javascript
const user = new User({
  socialMediaHandles: {}
});

// Funcționează!!!
user.socialMediaHandles.set('github', 'kosson');
// Merge și așa
user.set('socialMediaHandles.twitter', '@kosson');
// Nu, nu merge, proprietatea `myspace` **nu** va fi salvată
user.socialMediaHandles.myspace = 'fail';

// 'kosson'
console.log(user.socialMediaHandles.get('github'));
// '@kosson'
console.log(user.get('socialMediaHandles.twitter'));
// undefined (nu obții valoarea așa)
user.socialMediaHandles.github;

// Va salva doar proprietățile 'github' și 'twitter'
user.save();
```

Trebuie menționat faptul că type-urile map sunt stocate ca obiecte BSON în MongoDB. Într-un BSON, cheile sunt ordonate, ceea ce înseamnă că ordinea de intrare a proprietăților în Map este păstrată.

Mongoose face uz de o sintaxă specială (`$*`) pentru a face *populate* pe toate elementele dintr-un Map. Să presupunem că avem drept valori ale unui map o schemă care precizează detaliile de autentificare într-un obiect. Schema are la rândul său un `ref`.

```javascript
const userSchema = new Schema({
  socialMediaHandles: {
    type: Map,
    of: new Schema({
      handle: String,
      oauth: {
        type: ObjectId,
        ref: 'OAuth'
      }
    })
  }
});
const User = mongoose.model('User', userSchema);
```

Pentru a popula toate proprietățile `oauth` ale lui `socialMediaHandles`, ar trebui să pasezi `socialMediaHandles.$*.oauth` metodei `populate()`.

```javascript
const user = await User.findOne().populate('socialMediaHandles.$*.oauth');
```

### Getters

Getter-ii sunt precum *virtuals* pentru căile definite în schemă. De exemplu, să presupunem că vrei să stochezi imaginile de profil ale unui utilizator. Vei dori să le stochezi sub formă de căi relative și apoi să adaugi *hostname*-ul în aplicație.

```javascript
const root = 'https://s3.amazonaws.com/mybucket';

const userSchema = new Schema({
  name: String,
  picture: {
    type: String,
    get: v => `${root}${v}`
  }
});

const User = mongoose.model('User', userSchema);

const doc = new User({ name: 'Val', picture: '/123.png' });
doc.picture; // 'https://s3.amazonaws.com/mybucket/123.png'
doc.toObject({ getters: false }).picture; // '/123.png'
```

În general, folosești getteri pe căi de primitive pentru a nu apela la array-uri sau subdocumente. Getterii suprascriu ceea ce o cale Mongoose returnează și din acest motiv, declararea unui getter pe un obiect ar putea conduce la eliminarea tracking-ului pentru acea cale.

```javascript
const schema = new Schema({
  arr: [{ url: String }]
});

const root = 'https://s3.amazonaws.com/mybucket';

// Este greșit! Nu proceda așa!
schema.path('arr').get(v => {
  return v.map(el => Object.assign(el, { url: root + el.url }));
});

// Ceva mai târziu...
doc.arr.push({ key: String });
doc.arr[0]; // 'undefined' pentru că fiecare `doc.arr` creează un array nou!
```

În loc să declari un getter pe array ca în exemplul de mai sus, mai bine declari un getter pe string.

```javascript
const schema = new Schema({
  arr: [{ url: String }]
});

const root = 'https://s3.amazonaws.com/mybucket';

// Acesta este pasul corect. Nu declararea unui getter pe `arr`
schema.path('arr.0.url').get(v => `${root}${v}`);
```

### `Schema`

Pentru a declara o cale drept o altă schemă, vei seta `type` cu referința către acea schemă.

```javascript
const subSchema = new mongoose.Schema({
  // some schema definition here
});

const schema = new mongoose.Schema({
  data: {
    type: subSchema
    default: {}
  }
});
```

Pentru a seta o valoare din oficiu în baza formei sub-schemei, pur și simplu setezi o valoare `default` care va prelua formatarea sub-schemei la momentul în care se creează documentul.

## Funcția schema.path()

Această metodă este disponibilă odată ce ai instanțiat obiectul schemă și returnează cum a fost parametrizată calea care este pasată drept argument.

```javascript
const sampleSchema = new Schema({ name: { type: String, required: true } });
console.log(sampleSchema.path('name'));
// Output looks like:
/**
 * SchemaString {
 *   enumValues: [],
  *   regExp: null,
  *   path: 'name',
  *   instance: 'String',
  *   validators: ...
  */
```

## Definirea proprietăților programatic

Următoarele două exemple sunt echivalente. În primul exemplu, configurezi direct căile.

```javascript
const schema = new Schema({
  age: {
    type: Number,
    default: 25,
    validate: v => v >= 21
  }
});
```

În cel de-al doilea faci o înlănțuire de metode specifice.

```javascript
const schema = new Schema({ age: Number });

schema.path('age').default(25);
schema.path('age').validate(v => v >= 21);
```

Această sintaxă este mai rar folosită.

## Resurse

- [Schema.Types](https://mongoosejs.com/docs/api/schema.html#schema_Schema.Types)
- [An Introduction to Mongoose SchemaTypes | masteringjs.io/tutorials/mongoose](https://masteringjs.io/tutorials/mongoose/schematype)
- [An Introduction to Mongoose Arrays | masteringjs.io/tutorials/mongoose](https://masteringjs.io/tutorials/mongoose/array#document-arrays)
- [Introduction to Mongoose Schemas](https://masteringjs.io/tutorials/mongoose/schema)
