# HTTP authentication

Protocolul HTTP oferă o schemă de autentificare de bază: *Basic*. Reține faptul că HTTP este un protocol care nu are stare (*stateless*).

> HTTP oferă un cadru de autentificare simplu challenge-response care poate fi utilizate de un server pentru a testa cererea unui client și pentru un client să ofere informații de autentificare. Folosește un token case-insensitive ca mijloc de a identifica schema de autentificare urmat de informații suplimentare necesare autentificării folosind acea schemă. Aceasta poate fi o listă de parametri delimitați prin virgule sau simple secvențe de caractere care permit codarea de informație base64.

Parametrii de autentificare sunt perechi nume=valoare [...].

Să presupunem că un utilizator dorește să acceseze o resursă la care nu poate avea acces pentru că încă nu a fost autentificat. În acest caz, serverul de origine va răspunde cu un mesaj 401 (Unauthorized) pentru a solicita utilizatorului autentificarea. Va mai fi inclus un câmp `WWW-Authenticate` în header care va conține parte a solicitărilor necesare autentificării pentru acea resursă.
În cazul folosirii unui proxy, acesta va emite un răspuns 407 (Proxy Authentication Required) cu un header având un câmp `Proxy-Authenticate`.

În acest moment, ceea ce trebuie să facă agentul utilizatorului este să răspundă cu o nouă solicitare care va avea un câmp `Authorization` în header. Acest câmp va conține credențialele clientului pentru resursa solicitată.

Atunci când un server primește credențialele corecte dar care nu sunt cele necesare accesării unei anumite resurse, acesta trebuie să răspundă cu 403 (Forbidden).

## WWW-Authenticate

Acest câmp al headerului indică schema de autentificare sau mai multe și parametrii ai căror valori sunt necesare resursei pentru care s-a făcut cererea.

## Scheme de autentificare HTTP

Vom explora câteva din cele mai folosite scheme.

### Basic

Această schemă trimite credențiale ca perechi `user-i/parolă` codate în Base64. Această schemă transmite în clar aceste date și pentru a-i conferi o protecție, trebuie să fie combinată cu folosirea unui Transport Layer Security (TLS).

> Schema de autentificare Basic se bazează pe modelul în care clientul trebuie să se autentifice cu un user-id și o parolă pentru fiecare spațiu protejat (*realm*). Valoarea realm este un șir de caractere care poate fi comparat cu alte realm-uri existente pe același server. Serverul va onora cererea doar dacă poate valida user-id-ul și parola pentru spațiul protejat aferent resursei solicitate.

```text
HTTP/1.1 401 Unauthorized
Date: Mon, 04 Feb 2014 16:50:53 GMT
WWW-Authenticate: Basic realm="WallyWorld", charset="UTF-8"
```

Este obligatoriu să fie menționat realm și opțional schema de codare a caracterelor.

Un posibil răspuns de la client către server este utilizatorul separat de parolă prin două puncte și întregul șir de caractere să fie codat Base64. Nu uita că acest fragment codat Base64 pleacă către server în clar. Poți vedea valoarea utilizatorului și a parolei, accesând un decoder precum cel de la https://www.base64decode.org/.

```text
Basic QXp1cmVEaWFtb25kOmh1bnRlcjI=
```

## Aplicație Node.js

Pentru a experimenta cu aceste headere, propun următorul server construit cu Node.js și Express.js

```javascript
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/administrator', (req, res) => {
  if (req.headers.authorization !== 'Basic dGVzdG5vdToxMjM0Iw==') {
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Credențialele sunt: testnou, password: 1234#');
    return;
  }
  res.send('Ai reușit o autentificare Basic');
});
app.listen(port, () => console.log(`Ascult pe ${port}!`));
```

Interogând linkul protejat folosind `curl --user testnou:1234# localhost:3000/administrator`, vom obține mesajul pentru cazul în care este corect.

## Resurse

[Hypertext Transfer Protocol (HTTP/1.1): Authentication](https://tools.ietf.org/html/rfc7235)
[Hypertext Transfer Protocol (HTTP) Authentication Scheme Registry](http://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml)
[The 'Basic' HTTP Authentication Scheme](https://tools.ietf.org/html/rfc7617)
