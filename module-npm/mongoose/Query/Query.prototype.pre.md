# Query.prototype.pre()

Metoda adaugă un middleware instanței de `Query`. Nu afectează celelalte query-uri. Metoda returnează o promisiune.

```javascript
const q1 = Question.find({ answer: 42 });
q1.pre(function middleware() {
  console.log(this.getFilter());
});
await q1.exec(); // Afișează în consolă "{ answer: 42 }"

// Nu mai afișează nimic pentru că middleware-ul este doar pe q1.
await Question.find({ answer: 42 });
```
