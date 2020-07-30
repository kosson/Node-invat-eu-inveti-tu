# Query.prototype.select()

Metoda se aplică pe un obiect `Query`.

Metoda specifică câmpurile care trebuie incluse sau excluse din fiecare înregistrare a setului adus din bază. Cu ajutorul metodei realizezi ceea ce se numește o „proiecție”. O *proiecție* trebuie să fie incluzivă sau excluzivă. Acest lucru înseamnă că poți lista câmpurile pe care le dorești incluse. Această mențiune le va exclude pe toate celelalte. Se poate și invers. Poți menționa doar câmpurile pe care dorești să fie excluse.

Această metodă returnează un obiect de tip `Query` la care se realizează și legătura `this`.

Atunci când este folosită sintaxa bazată pe string-uri, prefixarea unui câmp cu semnul minus (**-**), va semnaliza că acea cale este exclusă. Atunci când o cale este menționată, dar nu are semnul minus în față, aceasta va fi inclusă.
În cazul în care în fața unui câmp este pus semnul plus, acea cale va fi forțat inclusă în rezultat. Acest lucru este util atunci când câmpurile sunt scoase la nivel de Schemă - [SchemaType.prototype.select()](https://mongoosejs.com/docs/api.html#schematype_SchemaType-select).

Câmpul `_id` este inclus automat fără excepție pentru că MongoDB îl include.

## Parametri

### arg

Acesta poate fi un `Object` sau un simplu `String`.

## Exemple

```javascript
// include a și b, dar exclude celelalte câmpuri
query.select('a b');

// exclude c și d, dar include restul câmpurilor
query.select('-c -d');

// Folosește `+` pentru a anula efectul mențiunii `select: false` de la nivelul schemei
// proiecția nu va deveni incluzivă dacă face acest lucru
const schema = new Schema({
  foo: { type: String, select: false },
  bar: String
});
// ...
query.select('+foo'); // Anulează `select: false` al câmpului `foo` fără a exclude câmpul `bar`

// poți folosi și sintaxa ce folosește obiecte
// este utilă atunci când ai chei care sunt deja prefixate cu un "-"
query.select({ a: 1, b: 1 });
query.select({ c: 0, d: 0 });
```

## Resurse

- [Query.prototype.select()|Mongoose, version 5.9.26](https://mongoosejs.com/docs/api/query.html#query_Query-select)
