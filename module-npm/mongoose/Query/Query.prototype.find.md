# Query.prototype.find()

Metoda aduce toate resursele care corespund proprietăților obiectului cu rol de selector. Dacă un astfel de obiect nu este menționat, vor fi aduse toate înregistrările din bază.

Metoda returnează un obiect `Query`.

Înregistrările sunt aduse într-un array.

În cazul în care sunt multe documente și există pericolul să nu poată fi ținute în memorie, se va folosi `Query.prototype.cursor()` pentru a rezolva.

```javascript
// Folosind async/await
const arr = await Movie.find({ year: { $gte: 1980, $lte: 1989 } });

// Folosind callback-uri
Movie.find({ year: { $gte: 1980, $lte: 1989 } }, function(err, arr) {});
```

## Parametri

### `[filter]`

Poate fi un `Object` sau un `ObjectId`. Acestea joacă rolul de obiecte care parametrizează selecția înregistrărilor din baza de date.

Dacă nu este menționat niciun obiect care să filtreze doar câteva înregistrări, vor fi aduse toate înregistrările din colecție.

### `[callback]`

Este o funcție cu rol de callback, care oferă posibilitatea de a lucra cu array-ul înregistrărilor.
