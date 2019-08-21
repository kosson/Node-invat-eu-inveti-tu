# Modulul `url`

Acest modul oferă toate instrumentele pentru a rezolva un URL și pentru a-l desface în părțile sale constituente.

```javascript
const url = require('url');
```

## String-uri URL și obiecte URL

În momentul în care un string ce reprezintă un URL este analizat, se va genera un obiect ale cărui proprietăți vor conține informații pentru fiecare dintre acestea.

Modulul `url` oferă două API-uri de lucru: unul specific Node.js, folosind `url.parse()` și altul, mai nou care este compatibil cu [Standardul URL](https://url.spec.whatwg.org/) folosit de browserele web, folosind constructorul `URL`.

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              href                                              │
├──────────┬──┬─────────────────────┬────────────────────────┬───────────────────────────┬───────┤
│ protocol │  │        auth         │ host (serverul gazdă)  │        path (calea)       │ hash  │
│          │  │                     ├─────────────────┬──────┼──────────┬────────────────┤       │
│          │  │                     │    hostname     │ port │ pathname │     search     │       │
│          │  │                     │                 │      │          ├─┬──────────────┤       │
│          │  │                     │                 │      │          │ │    query     │       │
"  https:   //    user   :   pass   @ sub.example.com : 8080   /p/a/t/h  ?  query=string   #hash "
│          │  │          │          │    hostname     │ port │          │                │       │
│          │  │          │          ├─────────────────┴──────┤          │                │       │
│ protocol │  │ username │ password │          host          │          │                │       │
├──────────┴──┼──────────┴──────────┼────────────────────────┤          │                │       │
│   origin    │                     │         origin         │ pathname │     search     │ hash  │
├─────────────┴─────────────────────┴────────────────────────┴──────────┴────────────────┴───────┤
│                                              href                                              │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
(toate spațiile url-ului dintre "" trebuie ignorate pentru că sunt puse din rațiuni de prezentare)
```

## Constructorul `new URL(input[, base])`

Acest constuctor primește două argumente:

- *input*, care este un url relativ sau absolut reprezentat printr-un string, care va fi parsat. În cazul în care lucrăm cu o cale relativă, este absolut necesară menționarea celui de-al doilea argument, care este rădăcina. În cazul în care acest prim argument este o cale absolută, cel de-al doile argument va fi ignorat.
- *rădăcina*

```javascript
const myURL = new URL('/foo', 'https://example.org/');
```

Toate caracterele Unicode care apar în numele serverului de hosting, vor fi convertite la ASCII, folosind algoritmul Punycode.

## `url.hash`

Setează și obține hash-uri din url.

```javascript
const myURL = new URL('https://example.org/foo#bar');
console.log(myURL.hash);
// Prints #bar

myURL.hash = 'baz';
console.log(myURL.href);
// Prints https://example.org/foo#baz
```

## `url.hostname`

Obții și/sau setezi hostname-ul din url.

## `url.href`

Obții o versiune serializată a url-ului

```javascript
const myURL = new URL('https://example.org/foo');
console.log(myURL.href);
// Prints https://example.org/foo

myURL.href = 'https://example.com/bar';
console.log(myURL.href);
// Prints https://example.com/bar
```

## `url.origin`

Obții o versiune serializată a originii URL-ului.

## `url.password`

Obții și/sau setezi parola.

## `url.pathname`

Obții și/sau setezi calea.

```javascript
const myURL = new URL('https://example.org/abc/xyz?123');
console.log(myURL.pathname);
// Prints /abc/xyz

myURL.pathname = '/abcdef';
console.log(myURL.href);
// Prints https://example.org/abcdef?123
```

## `url.port`

Obții și/sau setezi portul.

## `url.protocol`

Obții și/sau setezi protocolul folosit.

## `url.search`

Obții și/sau setezi string query-ul.

```javascript
const myURL = new URL('https://example.org/abc?123');
console.log(myURL.search);
// Prints ?123

myURL.search = 'abc=xyz';
console.log(myURL.href);
// Prints https://example.org/abc?abc=xyz
```

## `url.searchParams`

Obții un obiect `URLSearchParams`, care reprezintă parametrii de interogare pentru URL. Această proprietate este read-only. Pentru a înlocui parametrii de căutare, vei folosi setter-ul `url.search`.

## `url.username`

Obții și/sau setezi numele utilizatorului.

## `url.toString()`

Obții forma serializată a url-ului.

## `url.toJSON()`

Obții forma serializată a url-ului.
