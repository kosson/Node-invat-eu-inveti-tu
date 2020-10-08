# Setările serverului Express

Pentru cele mai multe cazuri nu este nevoie să cunoști în mare adâncime setările serverului pentru că nici nu vei simți nevoia să mergi atât de adânc. Este bine să le trecem în revistă pentru că oferă avantajele unor scenarii în care vei fi nevoit să găsești soluții.

## env

Această variabilă indică în ce regim funcționează procesului NodeJS. Poți seta această valoare folosind `process.env.NODE_ENV`, iar valorile sunt următoarele:

- `development`,
- `preview`,
- `production`,
- `test`,
- `stage`.

Express folosește `production` și `development`. Restul le poți folosi și tu în diferite scenarii personale de setări.

Cum setezi această variabilă? Așa cum am învățat deja, utilizând `app.set('env', 'development')` sau prin `process.env.NODE_ENV=development`.

Setarea modului cum va rula Node este importantă pentru cazurile în care ai nevoie să analizezi erori sau pentru a vedea incompatibilități atunci când lucrezi cu diferite configurații de sisteme de operare. Bine, ai mai putea seta Node chiar din consolă dacă ai nevoie de la acest nivel să operezi modificarea - `$ NODE_ENV=development node server.js`.

## jsonp callback name

Atunci când construiești un serviciu API și vei servi resurse JSON, există o problemă legată de CORS - cross-origin resource sharing. Browserul nu permite schimbul de astfel de resurse decât din același domeniu cu același port. Alternativa la CORS este JSONP.

```javascript
app.set('jsonp callback name', 'cbk');
```

Pentru a cere o resursă, cererea trebuie să fie un parametru care va menționa setarea care implică jsonp.

```javascript
http://www.ceva.ro/jsonp?cbk=aduDate
```

## case sensitive routing

TODO: de completat

## etag

TODO: de completat

## json replacer and json spaces

TODO: de completat

## query parser

TODO: de completat

## strict routing

TODO: de completat

## subdomain offset

TODO: de completat

## trust proxy

Este folosit atunci când te afli într-o zonă protejată printr-un proxy (de exemplu, Nginx). Această setare este dezactivată din oficiu pentru că Express presupune că „vezi” direct Internetul. În caz contrar, poți să o activezi folosind una din variantele:

```javascript
app.set('trust proxy', true);
app.enable('trust proxy');
```

## view cache

Această setare este implicit pusă la valoarea `false` de către Express. Ceea ce face este să permită motorului de gestiune a șabloanelor să rețină o formă deja procesată pentru a oferi direct fără a mai citi din nou șablonul. Șabloanele sunt compilate de fiecare dată când sunt citite, iar acest lucru poate avea un impact negativ asupra performanțelor.

Dacă setarea `env` este pe `production`, atunci `view cache` va fi activat din oficiu.

## view engine

Folosind această setare îi comunici serverului ce motor de realizare a șabloanelor vei folosi prin comunicarea extensiei fișierelor care sunt șabloanele. Pentru setare, vom folosi metoda set:

```javascript
app.set('view engine', 'ejs');
```

## views

Această setare indică rădăcina căii în care pot fi găsite șabloanele. Valoarea implicită, dacă nu menționezi calea este directorul `views` din rădăcina proiectului.

Pentru a schimba calea, ai nevoie de utilitarul `path` cu care vei face un `join()` pe variabila de sistem care indică calea absolută din care rulează proiectul `__dirname`. Să presupunem că șabloanele noastre se află într-un director diferit de `views`. Să spunem că se află într-un subdirector numit fragmente. Ca să faci redirectarea folosești din nou `app.set()`, iar la callback faci apelezi `join`.

```javascript
app.set('views', path.join(__dirname, 'fragmente'));
```

## x-powered-by

TODO: de completat
