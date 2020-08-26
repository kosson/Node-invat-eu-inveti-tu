# Modulul `jsonwebtoken`

Pentru a folosi JSON Web Tokens, mai întâi trebuie cerut modulul specializat [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken).

Procesul de autentificare care implică JWT-uri urmează următorii pași:

- utilizatorul se autentifică,
- backend-ul emite un JWT utilizatorului și îl trimite în client-side (token)
- clientul stochează tokenul în brower
- clientul trimite tokenul la fiecare cerere către server.

Fiecare JWT are o semnătură specifică care validează tokenul ca fiind unul valid pentru sistemul care l-a emis.
