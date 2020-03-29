# Obiectul response

Este obiectul care va forma răspunsul care va fi trimis clientului. Este cel de-al doilea obiect care este pasat callback-ului corespondent unei metode verb.

```javascript
app.get('/cale', (req, res) => {
  // cum este gestionată cererea și care este răspunsul
});
```

Obiectul response este notat prin convenție cu identificatorul `res` și beneficiază de toate metodele pe care le pune la dispoziție NodeJS-ul prin (http.ServerResponse)[https://nodejs.org/api/http.html#http_class_http_serverresponse].

## Proprietăți

### res.app

Este o referință către instanța Express.

### res.headersSent

Este o proprietate de tip Boolean care indică dacă au fost trimise header-ele către client sau nu.

```javascript
app.get('/', function (req, res) {
  console.log(res.headersSent); // false
  res.send('Ceva');
  console.log(res.headersSent); // true
});
```

### res.locals

Această proprietate este atașată fiecărui obiect `response` și are o durată de viață egală cu cea a acestui obiect. Obiectul `locals` poate fi pasat oricărui alt middleware din lanț (rute), dacă un astfel de lanț există. În acest obiect putem adăuga orice proprietăți **locale** dorim. Odată definite proprietățile din `locals`, acestea vor fi accesibile din callback-urile care tratează rutele.

Este un obiect care conține variabilele locale ce țin de obiectul cerere (`req`). Orice middleware care are acces la obiectul `request`, va avea acces și la `request.locals`.

Acestea sunt informații din obiectul `locals` care sunt disponibile șabloanelor de formatare a unui răspuns (views) în ciclul cerere/răspuns.

Obiectul este util când se investighează o cerere.

```javascript
// va fi executată înaintea tratări oricărei rute
app.use(function(req, res, next){
  res.locals.user = req.user;
  res.locals.authenticated = ! req.user.anonymous;
  next();
});
```

Ceea ce este important de reținut este faptul că vom avea acces la `locals` din obiectul `req` în toate rutele.
Trebuie menționat faptul că putem atașa un middleware, pe care să-l facem specific unei anumite rute.

```javascript
function validare (req, res, next) {
  res.locals.valid = 'true';
  next();
}
app.use('/administrator', validare);

app.get('/', (req, res, next) => {
  res.send('Ești la prima pagină');
  console.log(res.locals.valid);
})
```

Folosirea metodei `use()` este echivalentă cu cele dedicate verbelor. Singura diferență este că în loc de a scrie callback-ul, l-am externalizat într-o funcție.

Merită menționat un aspect important și anume faptul că datele pe care le trimitem unui template pentru a popula HTML-ul la compilare, sunt adăugate și lui `res.locals`. Mai joi începem cu secvența din gestionarea rutelor, unde trimitem obiectul `resurse`.

```javascript
app.get('/profile/resurse', makeSureLoggedIn.ensureLoggedIn(), function(req, res){
    var count = require('./controllers/resurseafisate.ctrl')(req.user);
    count.then(rezultat => {
        res.render('resurse-afisate', {
            user:    req.user,
            title:   "Profil",
            logoimg: "/img/logo.png",
            resurse: rezultat
        });
    }).catch(err => {
        if (err) throw err;
    });
}
```

Să presupunem că în afară de datele care vin din bază, mai dorești să trimiți suplimentar altele. Acest lucru este posibil datorită lui `res.locals` la care adaugi proprietăți noi cu datele pe care dorești să le afișezi în client. În fragmentul de rută de mai sus putem adăuga pentru demonstrație, niște date suplimentar celor aduse din bază.

```javascript
count.then(rezultat => {
    req.locals.zece = 10;
    res.render('resurse-afisate', {
        user:    req.user,
        title:   "Profil",
        logoimg: "/img/logo.png",
        resurse: rezultat
    });
}).catch(err => {
    if (err) throw err;
});
```

Urmat de fragmentul de template în care putem accesa datele din `locals` și din obiectul care a fost trimis expres: `resurse`.

```Handlebars
<div id="resurseincred" class="resurse">
    </p>Aceste date vin din locals.zece: {{locals.zece}}</p>
    {{#each resurse}}
    <div class="card" style="width: 18rem;">
        <img class="coperta" src="{{this.coperta}}" class="card-img-top" alt="{{this.title}}">
        <div class="card-body">
            <h5 class="card-title">{{this.title}}</h5>
            <p class="card-text">{{this.description}}</p>
            <a href="#" class="btn btn-primary">Afișează</a>
        </div>
    </div>
    {{/each}}
</div>
```

În cazul în care folosești un motor de templating Handlebars, ai putea accesa datele trimise.

## Metode

### `res.append(field [, value])`

Cu această metodă poți introduce o nouă valoare în câmpul aferent `header`-ului din răspunsul HTTP. Dacă header-ul nu a fost deja setat, această metodă îl va seta cu valoarea specificată. Valoarea celui de-al doilea parametru poate fi string sau un array.

Dacă va fi apelat `res.set()` după `res.append()` va reseta valoarea setată anterior a header-ului.

```javascript
res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
res.append('Set-Cookie', 'user=cineva; Path=/; HttpOnly');
res.append('Warning', 'O atenționare');
```

### `res.attachment([filename])`

### `res.redirect([status,] path)`

Metoda face o redirecționare pe o cale având posibilitatea de a seta și un număr ce indică starea (HTTP status code).

```javascript
res.redirect('/foo/bar');
res.redirect('http://example.com');
res.redirect(301, 'http://example.com');
res.redirect('../login');
```

Redirectarea se poate face pe o cale relativă la punctul în care se face redirectarea sau chiar către un alt site.

```javascript
res.redirect('http://www.kosson.ro');
```

De exemplu, pentru a merge de la `http://www.kosson.ro/ceva/adanc`, la `http://www.kosson.ro/ceva`, pur și simplu faci redirect la `..`.

```javascript
res.redirect('..');
```

O trimitere `back`, va redirecta către cel care a făcut apelul, iar dacă acesta nu există, va redirecta către rădăcină.

```javascript
res.redirect('back');
```

În cazul în care este nevoie, redirectarea se poate face pe o cale și apoi să trimiți și date prin query strings.

```javascript
res.redirect('/inapoi?ceva=10&altceva=unu');
```

### `res.download()`

### `res.end()`

### `res.json()`

### `res.jsonp()`

### `res.render()`

### `res.sendFile()`

### `res.sendStatus()`

## Resurse

[HTTP headers (MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
[HTTP Header Field Registrations](https://tools.ietf.org/html/rfc4229)
