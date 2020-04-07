# Clasa Query

Clasa `Query` reprezintă operațiuni CRUD brute în relația cu MongoDB. Oferă o interfață care permite înlănțuirea. Această clasă nu se instanțiază direct, ci vei folosi un model, pe care aplicând metoda `find()`, de exemplu, va returna un obiect de tip `Query`.

```javascript
const query = Customer.find();
query instanceof mongoose.Query; // true
```

Metodele `find()` aplicate pe model, pot fi înlănțuite. Fiecare metodă aplicată, va face o modificare a obiectului `Query` pe care se aplică și după ce s-au executat modificările, obiectul este returnat următoarei metode, dacă mai este vreuna. Dacă nu mai este niciuna, obiectul `Query` este gata să-i fie aplicată metoda `exec()`, care va face operațiunile în relație cu Mongoose.

```javascript
// https://docs.mongodb.com/manual/reference/operator/query/
Customer.find({ email: /foo\.bar/, age: { $gte: 30 } });
// Echivalent cu:
Customer.find({ email: /foo\.bar/ }).find({ age: { $gte: 30 } });
```

Obiectele `Query` au mai multe helpere, care permit construirea unor operațiuni CRUD complexe (`sort()`, `limit()`, `skip()`).

```javascript
// Find the customer whose name comes first in alphabetical order, in
// this case 'A'. Use `{ name: -1 }` to sort by name in reverse order.
const res = await Customer.find({}).sort({ name: 1 }).limit(1);

// Find the customer whose name comes _second_ in alphabetical order, in
// this case 'B'
const res2 = await Customer.find({}).sort({ name: 1 }).skip(1).limit(1);
```

Unul din lucrurile importante pe care le face Mongoose este casting-ul valorilor la cele specificate în schema modelului. Acest lucru se face automat.

## Referințe

- [How find() Works in Mongoose](http://thecodebarbarian.com/how-find-works-in-mongoose.html)
