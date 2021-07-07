# Mongoose.prototype.model()

## Parametrii

Această metodă acceptă următorii parametri:

### `name`

Poate fi un `String` sau chiar o `Function`, care vor da numele modelului sau a clasei care îl extinde pe `Model`.

### `schema`

Este schema folosită pentru a crea un model. Acesta este un obiect de tip `Schema`.

### `collection`

Acesta este numele colecției pe care se va opera, fiind un `String`, dacă este menționat. Ceea ce este interesant și demn de reținut este faptul că numele colecției cu care se va opera este dedus din numele dat modelului. Adică, așa cum numești modelul, aceea va fi colecția pe care se va opera dacă acest parametru nu este introdus.

```javascript
var schema = new Schema({ name: String }, { collection: 'actor' });

// sau
schema.set('collection', 'actor');

// sau
var collectionName = 'actor'
var M = mongoose.model('Actor', schema, collectionName)
```

### `skipInit`

Este `Boolean` și dacă este setat la `true`, inițializarea nu va mai fi făcută.

Metoda returnează o instanță a unui obiect de tip `Model`. Modelele definite pe o instanță de `mongoose`, vor fi disponibile tuturor conexiunilor stabilite de acea instanță.
