# Document.prototype.execPopulate()

Face popularea și returnează o promisiune.

```javascript
var promise = doc.
  populate('company').
  populate({
    path: 'notes',
    match: /airline/,
    select: 'text',
    model: 'modelName'
    options: opts
  }).
  execPopulate();

// summary
doc.execPopulate().then(resolve, reject);
```

## Parametrii

### `[callback]`

Metoda poate primi un callback, dar în acest caz, **nu va mai fi returnată o promisiune**.

## Exemplu

```javascript
const mongoose = require('mongoose');
// MONGOOSE - Conectare la MongoDB
mongoose.set('useCreateIndex', true); // Deprecation warning
mongoose.connect('mongodb://localhost:27017/lucru', {useNewUrlParser: true, useUnifiedTopology: true}).catch(error => {
    if (error) throw error;
});

var Schema = mongoose.Schema;

// 2 models: Book and Author
var bookSchema = new Schema({
    title: String,
    author: {
        type: mongoose.ObjectId,
        ref: 'Author'
    }
});
var Book = mongoose.model('Book', bookSchema);

var authorSchema = new Schema({
    name: String
});

var Author = mongoose.model('Author', authorSchema);

// Creează cărțile cu autorii lor
var arr = [
    { name: 'Michael Crichton' },
    { name: 'Ian Fleming' }
];

Author.create(arr, (err, a) => {
    if (err) throw err;
    const [author1, author2] = a;
    var arr2 = [
        { title: 'Jurassic Park', author: author1._id },
        { title: 'Casino Royale', author: author2._id }
    ];
    Book.create(arr2, (err, b) => {
        if (err) throw err;
    });
});

// Populate books and filter by author name.
var p = Book.find().populate({
    path: 'author',
    match: { name: 'Ian Fleming' }
}).exec().then(b => {
    console.log(b);
}).catch((e) => {
    if (e) throw e;
});
/*
[
  {
    _id: 5da567fac6593730802396ba,
    title: 'Jurassic Park',
    author: null,
    __v: 0
  },
  {
    _id: 5da567fac6593730802396bb,
    title: 'Casino Royale',
    author: { _id: 5da567fac6593730802396b9, name: 'Ian Fleming', __v: 0 },
    __v: 0
  }
]
*/
```
