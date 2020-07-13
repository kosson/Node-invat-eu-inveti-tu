# Gestionarea erorilor

Gestionarea erorilor care apar în lucrul cu stream-urile este un subiect care trebuie tratat atent. Erorile de stream conduc adesea la *scurgeri de memorie* (*memory leaks*).

## Nu fă stream-uri pe servere http

Exemplul de mai jos va crea o *scurgere de memorie*. În cazul în care conexiunea este închisă (pipe(res)), stream-ul de citire nu este distrus și va sta activ perpetuu pentru că nu există cineva care să-l consume. Semnalul că ai putea acea o scurgere de memorie este apariția în cod a lui `.pipe()`. În acest caz, trebuie folosit operatorul `pipeline`.

```javascript
const {createReadStream} = require('fs');
const {createServer} = require('http');
const server = createServer((req, res) => {
  createReadStream(__filename).pipe(res);
});
server.listen(3000);
```

Exemplu rescris folosind operatorul `pipeline`.

```javascript
const {createReadStream} = require('fs');
const {createServer} = require('http');
const server = createServer((req, res) => {
  // distruge stream-ul dacă apare vreo eroare
  pipeline(createReadStream(__filename), pipe(res), (err) => {
    if (err) console.error(err);
  });
});
server.listen(3000);
```

## Nu amesteca stream-urile cu promisiunile

## Resurse

- [Stream Into the Future (NodeJS Streams)](https://www.youtube.com/watch?v=aTEDCotcn20)
