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

Este un obiect care conține variabilele locale ce țin de obiectul cerere (`req`). Acestea sunt disponibile șabloanelor de formatare a unui răspuns (views) în ciclul cerere/răspuns. Dacă nu ne aflăm într-un astfel de ciclu, această proprietate este identică cu `app.locals`.

Obiectul este util atunci când este nevoie de informație când se investighează o cerere și datele care sunt disponibile la momentul când aceasta a fost făcută.

```javascript
app.use(function(req, res, next){
  res.locals.user = req.user;
  res.locals.authenticated = ! req.user.anonymous;
  next();
});
```

## Metode

### res.append(field [, value])


Cu această metodă poți introduce o nouă valoare în câmpul aferent `header`-ului din răspunsul HTTP. Dacă header-ul nu a fost deja setat, această metodă îl va seta cu valoarea specificată. Valoarea celui de-al doilea parametru poate fi string sau un array.

Dacă va fi apelat `res.set()` după `res.append()` va reseta valoarea setată anterior a header-ului.

```javascript
res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
res.append('Set-Cookie', 'user=cineva; Path=/; HttpOnly');
res.append('Warning', 'O atenționare');
```

### res.attachment([filename])



## Resurse

[HTTP headers (MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
[HTTP Header Field Registrations](https://tools.ietf.org/html/rfc4229)
