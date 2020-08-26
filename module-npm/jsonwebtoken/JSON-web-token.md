# Studiu

JSON Web Tokens sunt un standard guvernat de [RFC 7919](https://tools.ietf.org/html/rfc7519), reprezentând metoda pentru a schimba resurse într-un mod securizat între două părți în rețea. JSON Web Token (JWT) este un format folosit pentru a reprezenta date folosite în autorizare precum headerele `Authorization` și parametrii URI folosiți în mod curent la interogări.
Datele de autentificare sunt transmise ca un obiect JSON care este folosit ca payload pentru o Semnătură Web JSON. Această semnătură poate fi criptată.

Acest mecanism este utilizat pentru a autentifica cererile lansate unui serviciu RESTful. Avantajul pe care îl oferă este cel legat de faptul că nu este necesară ținerea minte a vreunei stări. Fiecare cerere care ajunge la API, va avea datele de autentificare, care vor fi decodate și comparate cu un contract elaborat anterior între client și server. Dacă verificarea este cu succes, atunci cererea va fi validă.

### Alcătuirea unui token jwt

Un token are în componență trei fragmente alfanumerice codate BASE64, care sunt delimitate prin puncte.

Un JWT este constituit din trei secvențe care nu intră în coliziune cu restul părților ce formează URL-ul. Aceste fragmente sunt separate prin puncte și sunt codate în Base64:

- header;
- payload;
- signature.

#### Primul segment - header

Este constituit dintr-un obiect JSON care menționează algoritmul care a fost folosit pentru semnarea token-ului și tipul token-ului, care este `JWT`. Acesta se numește **header**.

```javascript
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Acest segment este codat BASE64. Ceea ce putem observa este mențiunea unui algoritm care va fi folosit pentru a face hashing și tipul token-ului care este `JWT`.

#### Al doilea segment - payload

Cel de-al doilea segment, numit **payload**, reprezintă o parte constantă a tuturor cererilor care vor fi adresate serverului. Sunt conținute date despre utilizator. Și acest segment este codat BASE64.

```javascript
{
  "name": "Ion Dică",
  "admin": true
}
```

În payload-ul JWT, putem introduce un set de claim-uri (afirmații structurate în cheie: valoare). Unul din claim-uri trebuie să fie o data la care JWT-ul să expire. Restul, vor fi informații de identificare. Mai multe claim-uri vor forma un set.

```javascript
{
  "iss":"OrgEmitentă",
  "exp":1300819380,
  "name":"Nico",
  "iss":"ceva.ro",
  "administrator":true,
  "masterOfSpace":true
}
```

În claim-uri pot fi folosiți câțiva descriptori care sunt deja standardizați [Initial Registry Contents](https://tools.ietf.org/html/rfc7519#section-10.1.2). Claim-urile care urmează sunt *rezervate* prin standardizare.

Numele claim-urilor sunt standardizare de IANA la https://www.iana.org/assignments/jwt/jwt.xhtml#claims. Pentru a nu reinventa roata, consultarea documentului [JSON Web Token Claims](https://www.iana.org/assignments/jwt/jwt.xhtml#claims) oferă nume standardizate, care oferă și posibilitatea de a transfera date, fiind astfel evitate și coliziunile cu alte seturi de nume.

##### "iss" (Issuer) Claim

Identifică pe cel ce a emis JWT-ul. Acest claim este specific unei anumite aplicații, de regulă. Folosirea sa este opțională și poate fi chiar și un URI drept valoare.

##### "sub" (Subject) Claim

Identifică subiectul în cauză al resursei. Este opțională și poate fi și un URI.

##### "aud" (Audience) Claim

Identifică cui i se adresează. Este opțională și poate fi și un URI.

##### "exp" (Expiration Time) Claim

Identifică timpul după care JWT-ul va expira. Acest lucru va indica serverului limita de la care nu va mai permite accesul la resurse pe baza JWT-ului. Este opțional.

##### "nbf" (Not Before) Claim

Indică timpul de la care serverul trebuie să permită accesul la resurse. Este opțional.

##### "iat" (Issued At) Claim

Indică momentul când a fost emis JWT-ul. Poate fi folosit pentru a determina vârsta token-ului. Este opțional.

##### "jti" (JWT ID) Claim

Este un identificator unic pentru JWT care poate fi emis pentru a identifica unic prezentul token. Este opțional.

#### Al treilea segment - signature

Cel de-al treilea segment este constituit din semnătura digitală (Message Authentication Code) care s-a generat folosindu-se algoritmul precizat în primul segment. Semnătura este tot un fragment codat Base64, dar care a fost constituit prin criptarea headerului și a payload-ului cu o cheie cunoscută doar de cel care emite token-ul. Semnătura este folosită pentru a ne asigura că mesajul nostru nu a fost alterat înainte de a ajunge la server. De regulă, acest lucru se face folosind chei private.

Cele trei segmente arată similar următorului `jwt: `eyJhbGciOiJIUzI1NiIsInR5cCIAdkpXVCJ9.eyJlbWFpbCI6Imtvc3NvbkBnbWFpbC5jb20iLCJ1c2VySWQiOiI1YWVL0TU4M2ZmNTNhOTU2MTQ1Y2EwNDgiLCJpYXQiOjE1NDAzOTEyOTYsImV4cCI6MTU0MDQxMjg5Nn0.2aeYz6p8T09jJLW2ydwJxJacb62v5ViF334WZLUXwBE`

Pentru a verifica un token JWT, se va genera din nou o semnătură folosind headerul și payload-ul care au venit către serviciul de autentificare, folosindu-se aceeași cheie secretă cunoscută doar de către emitent. Clientul care ar încerca să falsifice token-ul nu are acces la fragmentul de text care este cheia de criptare.

## Procesul de autentificare

Mai întâi, pentru a putea utiliza API-ul ai nevoie de a trimite credențialele la un endpoint dedicat loginului. API-ul verifică credențialele și emite un token, care este returnat utilizatorului. Utilizatorul va atașa tokenul primit tuturor cererilor făcute fără să mai trimită credențialele. Pentru fiecare cerere, serverul verifică autenticitatea tokenului primit, iar dacă aceasta este confirmată, oferă celui care a făcut cererea resursele dorite.

## Referințe

- [A Brief Introduction to Securing Applications with JWT](https://livecodestream.dev/post/2020-07-31-a-brief-introduction-to-securing-applications-with-jwt/)
- [A Practical Guide to JWT Authentication with NodeJS](https://livecodestream.dev/post/2020-08-11-a-practical-guide-to-jwt-authentication-with-nodejs/)
