# stream.pipeline

Această metodă a fost adăugată în modulul `streams` începând cu Node versiunea 10. În versiunea 13.10.0 a fost adăugat suportul pentru generatorii `async`. În versiunea 14.0.0 callback-ul (`pipeline(..., cb)`) va aștepta să fie emis evenimentul `close` înainte de a declanșa execuția callback-ului

Semnătura posibilă `stream.pipeline(source[, ...transforms], destination, callback)`. Metoda va returna un stream.

## Parametrii

Metoda acceptă următorii parametri.

### `source`

Acesta este stream-ul sursă care poate fi: \<Stream>, \<Iterable> , \<AsyncIterable>, \<Function>.

Acest stream va returna unul din următoarele \<Iterable> , \<AsyncIterable>.

### `[, ...transforms]`

Opțional, al doilea argument este un stream de transformare. Ca transformatoare sunt acceptate \<Stream> sau \<Function>.

Poate avea drept sursă doar un \<AsyncIterable>.

Transformatoarele vor returna doar \<AsyncIterable>.

### `destination`

Acesta este stream-ul destinație și poate fi  \<Stream> sau \<Function>.

Poate avea drept sursă doar un \<AsyncIterable>.

Poate să returneze, fie un \<AsyncIterable>, fie un \<Promise>.

### `callback`

Această funcție este invocată atunci când pntreg pipeline-ul și-a încheiat procesarea. La rândul său, acest callback primește două argumente: `err` și `val`.

#### `err`

Este un obiect `Error`.

#### `val`

Este valoarea rezolvată a unui Promise care este returnat de `destination`.

## Detalii metodă

Documentația spune despre această metodă că face `pipe` între streamuri și generatoare forwardând erorile, făcând o curățare a memoriei folosite de `stream`. La final, îi oferă funcției cu rol de callback posibilitatea de a rula cod atunci când întregul pipeline a fost rezolvat.
