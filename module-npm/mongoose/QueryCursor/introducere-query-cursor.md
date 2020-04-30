# QueryCursor

Aceasta este o primitivă necesar realizării unui context de concurency pentru a procesa documentele în succesiune unul după altul.

Un QueryCursor va executa toate hook-urile `pre` aplicate pe `find`, dar NU și hook-urile `post`.

Această clasă nu va fi instanțiată niciodată în mod direct. Pentru a o folosi, se va folosi [Query.prototype.cursor()](https://mongoosejs.com/docs/api.html#query_Query-cursor).
