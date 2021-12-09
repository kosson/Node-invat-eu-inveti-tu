# Query.prototype.cursor()

Metoda returnează un wrapper peste cursorul pe care îl oferă driverul de MongoDB.

Funcția `cursor()` declanșează hook-urile pre pe `find`, dar nu și pe cele de pe post `find`.

```javascript
// Există două moduri de a folosi un cursor. Primul ca stream:
Thing.
  find({ name: /^hello/ }).
  cursor().
  on('data', function(doc) { console.log(doc); }).
  on('end', function() { console.log('Done!'); });

// Sau poți folosi `.next()` pentru a obține următorul document din stream.
// `.next()` returnează un promise, așa că poți folosi promisiuni sau callback-uri.
const cursor = Thing.find({ name: /^hello/ }).cursor();
cursor.next(function(error, doc) {
  console.log(doc);
});

// Deoarece `.next()` returnează un promise, poți folosi co
// pentru a itera cu ușurință prin toate documentele fără
// a le încărca în memorie.
const cursor = Thing.find({ name: /^hello/ }).cursor();
for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  console.log(doc);
}
```
