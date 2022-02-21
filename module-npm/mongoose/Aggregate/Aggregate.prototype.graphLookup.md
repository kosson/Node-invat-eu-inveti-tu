# Aggregate.prototype.graphLookup

Adaugă un operator `$graphLookup` în pipeline. Rolul operatorului este să facă o căutare recursivă în colecție. Acest operator poate consuma cel mult 100MB de memorie și nu permite folosirea disk-ului chiar dacă este setată opțiunea `{ allowDiskUse: true }`.

```javascript
// Suppose we have a collection of courses,
// where a document might look like
// `{ _id: 0, name: 'Calculus', prerequisite: 'Trigonometry'}`
// and
// `{ _id: 0, name: 'Trigonometry', prerequisite: 'Algebra' }`
 aggregate.graphLookup({
   from:             'courses',
   startWith:        '$prerequisite',
   connectFromField: 'prerequisite',
   connectToField:   'name',
   as:               'prerequisites',
   maxDepth:         3
 }); 
 // this will recursively search the 'courses' collection up to 3 prerequisites
 ```
