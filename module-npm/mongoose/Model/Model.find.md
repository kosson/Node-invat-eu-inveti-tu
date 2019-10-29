# Model.find()

Metoda este folosită pentru a căuta documente în MongoDB și returnează un obiect de tip `Query`.

Metoda primește câțiva posibili parametri, primul fiind filtrul după care se face căutare, iar restul sunt opționali.

## Parametri

### `filter`

Este un `Object` sau un `ObjectId`.

Aceste obiecte cu rol de filtru sunt formatate conform SchemaType-ului corespondent înainte de a fi trimisă comanda către bază.

### `[projection]`

Proiecția poate fi un șir de caractere (`String`) sau un `Object`. Această proiecție este folosită pentru a specifica câmpurile care să fie aduse din bază. Vezi și [`Query.prototype.select()`](https://mongoosejs.com/docs/api.html#query_Query-select).

### `[options]`

Este un `Object` opțional - vezi [`Query.prototype.setOptions()`](https://mongoosejs.com/docs/api.html#query_Query-setOptions)

### `[callback]`

Este o funcție cu rol de callback în cazul în care este aleasă această opțiune.

## Referințe

- [Model.find()](https://mongoosejs.com/docs/api/model.html#model_Model.find)
- [Query Casting](https://mongoosejs.com/docs/tutorials/query_casting.html)
- [How find() Works in Mongoose](http://thecodebarbarian.com/how-find-works-in-mongoose.html)
