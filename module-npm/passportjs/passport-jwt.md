# Strategia passport-jwt

Acest pachet lucrează în tandem cu pachetul `jsonwebtoken`.

Pași:

1. Userul se loghează cu user și parolă la site
2. Serverul primește cererea, creează un JWT și-l trimite clientului în răspuns.
3. Clientul stochează JWT-ul într-un cookie sau în local storage.
4. De fiecare dată când userul face o cerere către server, browserul clientului va atașa JWT-ul în câmpul `Authorization` din headerele http.
5. Serverul se va uita la headere, va extrage JWT-ul și verifică semnătura.
6. Dacă semnătura este validă, serverul va decoda JWT-ul și va extrage utlizatorul din baza de date folosind informația despre acesta din payload.
7. Utilizatorul primește acces pe ruta cerută.

## Resurse

- [passport-jwt | passport.org](http://www.passportjs.org/packages/passport-jwt/)
- [Passport JWT Strategy Flow (Node + Passport + Express) | Zach Gollwitzer | YouTube](https://www.youtube.com/watch?v=o6mSdG09yOU&list=PLYQSCk-qyTW2ewJ05f_GKHtTIzjynDgjK&index=9)
- [03 - 05 Passport JWT Authentication Strategy | DFSW Labs](https://www.youtube.com/watch?v=wRREunBwBUw)
- [How JWT Works - Client and Server | Steve Griffith - Prof3ssorSt3v3](https://www.youtube.com/watch?v=QCCmWNlEkdY)
- [JWT Authentication Tutorial - Node.js | Web Dev Simplified](https://www.youtube.com/watch?v=mbsmsi7l3r4)
