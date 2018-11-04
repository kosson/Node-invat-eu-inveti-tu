# Modulul http

Oricare aplicație care construiește un server web va genera un obiect server prin invocarea metodei `http.createServer()`.

```javascript
const http = require('http');

const server = http.createServer((request, response) => {
  // gestionează detaliile serverului
});
```

Funcția pasată drept callback este invocată pentru fiecare cerere HTTP făcută pe acel server. Obiectul generat de `createServer` este un `EventEmitter`, fapt care ne permite să atașăm funcții receptor,

```javascript
const server = http.createServer();
server.on('request', (request, response) => {
  // ce se petrece când va fi emis evenimentul request
});
server.listen(8888);
```

Atunci când serverul nostru primește o cerere HTTP, va fi apelat callback-ul împreună cu câteva obiecte care vor fi folosite pentru a gestiona solicitarea. Pentru a fi gata de a gestiona cereri, va trebui invocată și metoda `listen(8888)` căreia îi vom pasa portul pe care serverul ascultă.


## Request Body

Acesta este un obiect care se generează la momentul în care se fac solicitări serverului pe verbele `POST` și `PUT`. Obiectul `request` este pasat callback-ului și implementează interfața `ReadableStream`. Acest stream poate să fie trimis mai departe (`piped`) sau poți să-l exploatezi. Poți extrage datele setând niște receptori pe evenimentele `data` și `end`.

```javascript
let body = [];
request.on('data', (fragment) => {
  body.push(fragment);
}).on('end', () => {
  body = Buffer.concat(body).toString();
  // acum variabila body va avea întreg corpul cererii stocat ca string
});
```

Un `fragment` emis în fiecare eveniment `data` este un `Buffer`. Un `Buffer` este un mecanism al Node pentru citirea și manipularea streamurilor de date binare. În acest moment standardul ECMAScript a introdus un mecanism echivalent: `TypedArray`. Clasa `Buffer` permite interacțiunea cu streamuri de octeți în contextul streamurilor TCP sau operațiunile în care lucrezi cu sistemul de fișiere al unei mașini. Reține faptul că atunci când lucrezi cu șiruri într-un `Buffer`, trebuie să precizezi care este codarea caracterelor.

Dacă știi că datele primite prin TCP sunt șiruri de caractere, atunci cea mai bună tactică este să le acumulezi într-un array și apoi în cazul unui nou eveniment `end` să le concatenezi cu `Buffer.concat` pentru a le accesa într-un format accesibil.
Acest algoritm este abstractizat în module npm dedicate, iar în cazul utilizării `Express` ai la dispoziție `body-parser` și `multer`.

Erorile sunt și ele evenimente ale stream-ului `request`. Este necesar să ai o funcție receptor și pentru erori pentru că altfel, vor fi *emise* excepții și programul se va încheia.

```javascript
request.on('error', (err) => {
  // Este afișat mesajul de eroare și stack trace-ul la `stderr`.
  console.error(err.stack);
});
```

### Metode, URL și headere

Atunci când serverul primește o cerere, sunt câteva informații foarte importante pentru a decide cum vom gestiona această cerere. Acestea sunt de regulă metoda prin care s-a făcut cererea, URL-ul pe care se face solicitarea și headerele, care posibil conțin informații prețioase care vizează autentificarea sau altele.

Pentru a gestiona foarte ușor această etapă, obiectul `request` pune la dispoziție câteva proprietăți la îndemână.

```javascript
const { method, url, headers } = request;
```

Obiectul `request` este o instanță a unui obiect `IncomingMesage`, care este creat de `http.Server` sau de `http.ClientRequest`. Adu-ți mereu aminte că acest obiect `IncomingMessage` este introdus ca prim argumente în funcțiile receptor ale evenimentelor `request` și `response`. Acest obiect oferă informații privind codul stării răspunsului, headerele, precum și datele din corp.

Câteva informații din obiectul `request`:

- `.headers` - obiect care conține informațiile din header,
- `.httpVersion` - șir de caractere care indică versiunea HTTP a serverului,
- `.method` - șir de caractere care indică metoda folosită de cerere,
- `.socket` - un obiect `net.Socket` asociat conexiunii. Pentru detalii privind autentificarea HTTPS, vei folosi `request.socket.getPeerCertificate()`,
- `.statusCode` - este codul asociat răspunsului,
- `.statusMessage` - este mesajul emis de server (de ex. Internal Server Error),
- `.url` - este url-ul pentru care a venit cererea.

În acest moment, un server la nivelul cel mai simplu ar fi o aplicație structurată pe funcționalitățile modulului `http`.

```javascript
const http = require('http');

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    // At this point, we have the headers, method, url and body, and can now
    // do whatever we need to in order to respond to this request.
  });
}).listen(8080);
```

## Obiectul response

Acest obiect este o instanță a lui clasei `ServerResponse`, care generează un obiect. Acest obiect este creat de serverul HTTP, nu de utilizator. Clasa `ServerResponse` implementează, dar nu moștenește din interfața `Writable Stream`. Obiectul acesta este un `EventEmitter`.

### Codul de răspuns trimis utilizatorului

Dacă nu este setat, codul de răspuns trimis automat către utilizator este întotdeauna 200. În funcție de diferitele scenarii, vei dori la un moment dat să trimiți un cod diferit. Pentru a face acest lucru, ai la dispoziție posibilitatea de a seta proprietatea `statusCode`.

```javascript
response.statusCode = 404;
```

### Setarea headerelor de răspuns

Pentru setarea headerelor, există metoda dedicată `setHeader`.

```javascript
response.setHeader('Content-Type', 'application/json');
response.setHeader('X-Powered-By', 'bacon');
```

Pentru a seta explicit headerele unui stream de răspuns, poți folosi metoda `writeHead`. Acestă metodă setează codul de răspuns și headerele ca proprietăți ale unui obiect.

```javascript
response.writeHead(200, {
  'Content-Type': 'application/json',
  'X-Powered-By': 'bacon'
});
```

Setarea unui cod de răspuns și a headerelor este semnalul că poți să te apuci de asamblarea corpului răspunsului. În acest sens ai la dispoziție metoda `write` și `end`.

```javascript
response.write('<html>');
response.write('<body>');
response.write('<h1>Hello, World!</h1>');
response.write('</body>');
response.write('</html>');
response.end();
// sau
response.end('<html><body><h1>Hello, World!</h1></body></html>');
```

Metoda `end` semnalează serverului faptul că headerele și corpul au fost trimise și că serverul ar trebui să considere mesajul ca fiind complet. Metoda `response.end()` trebuie să fie apelată neapărat pentru fiecare răspuns. Dacă sunt incluse și datele, atunci acest apel este echivalent cu `response.write(data, encoding)` urmată de `response.end(callback)`. Dacă este specificat un callback, acesta va fi apelat când stream-ul de răspuns este deplin constituit.

```javascript
const http = require('http');

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();

    response.on('error', (err) => {
      console.error(err);
    });
    // setează starea și headerele
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    // contras, cele două linii ar fi putut să fie astfel scrise:
    // response.writeHead(200, {'Content-Type': 'application/json'})

    // Constituirea corpului
    const responseBody = { headers, method, url, body };

    // scrie corpul răspunsului
    response.write(JSON.stringify(responseBody));
    response.end();
    // Contras, cele două linii se pot redacta într-una
    // response.end(JSON.stringify(responseBody))

  });
}).listen(8080);
```

## Concluzii

Adu-ți mereu aminte că obiectul `request` este un `ReadableStream`, iar obiectul `response` este un `WritableStream`. Deci, avem de a face cu două streamuri. Cunoscând acest fapt, putem face chiar piping între ele.

```javascript
const http = require('http');

http.createServer((request, response) => {
  request.on('error', (err) => {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });
  response.on('error', (err) => {
    console.error(err);
  });
  if (request.method === 'POST' && request.url === '/echo') {
    request.pipe(response);
  } else {
    response.statusCode = 404;
    response.end();
  }
}).listen(8080);
```

## Referințe

- [Anatomy of an HTTP Transaction](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/)
