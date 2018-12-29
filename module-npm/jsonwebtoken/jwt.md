# Modulul jwt

Pentru a folosi JSON Web Tokens, mai întâi trebuie cerut modulul specializat `jsonwebtoken` (https://www.npmjs.com/package/jsonwebtoken).

JSON Web Tokens sunt un standard guvernat de RFC 7919 (https://tools.ietf.org/html/rfc7519), reprezentând metoda pentru a schimba resurse într-un mod securizat între două părți în rețea.

Acest mecanism este utilizat pentru a autentifica cererile lansate unui serviciu RESTful. Avantajul pe care îl oferă este cel legat de faptul că nu este necesară ținerea minte a vreunei stări. Fiecare cerere care ajunge la API, va avea datele de autentificare, care vor fi decodate și comparate cu un contract elaborat anterior între client și server. Dacă verificarea este cu succes, atunci cererea va fi validă.

### Construirea jotul-ului

Se pun în headerul cererii trei fragmente alfanumerice codate BASE64 delimitate prin puncte.

#### Primul segment

Este constituit dintr-un obiect JSON care menționează algoritmul care a fost folosit pentru semnarea jotului și tipul tokenului, care este JWT.

```javascript
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Acest segment este codat BASE64.

#### Al doilea segment

Cel de-al doilea segment reprezintă o parte constantă a tuturor cererilor care vor fi adresate serverului. Sunt conținute date despre utilizator.

```javascript
{
"name": "Ion Dică",
"isAdmin": true
}
```

Și acest segment este codat BASE64.

#### Al treilea segment

Cel de-al treilea segment este constituit din semnătura digitală care s-a generat folosindu-se algoritmul precizat în primul segment.

Cele trei segmente arată similar următorului jot: `eyJhbGciOiJIUzI1NiIsInR5cCIAdkpXVCJ9.eyJlbWFpbCI6Imtvc3NvbkBnbWFpbC5jb20iLCJ1c2VySWQiOiI1YWVL0TU4M2ZmNTNhOTU2MTQ1Y2EwNDgiLCJpYXQiOjE1NDAzOTEyOTYsImV4cCI6MTU0MDQxMjg5Nn0.2aeYz6p8T09jJLW2ydwJxJacb62v5ViF334WZLUXwBE`

## Procesul de autentificare

Mai întâi, pentru a putea utiliza API-ul ai nevoie de a trimite credențialele la un endpoint dedicat loginului. API-ul verifică credențialele și emite un token, care este returnat utilizatorului. Utilizatorul va atașa tokenul primit tuturor cererilor făcute fără să mai trimită credențialele. Pentru fiecare cerere, serverul verifică autenticitatea tokenului primit, iar dacă aceasta este confirmată, oferă celui care a făcut cererea resursele dorite.

## Resurse

[JSON Web Token (JWT) - RFC7519](https://tools.ietf.org/html/rfc7519)
