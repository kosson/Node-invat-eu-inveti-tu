### Clasa `stream.Duplex`

Sunt acele stream-uri bidirecționale în care se poate scrie și citi deopotrivă. Are nevoie să fie *writable* pentru a se putea face **pipe** datelor de input pe care le putem introduce. Trebuie să fie *readable* pentru a se putea face **pipe** datelor transformate către următorul bloc de transformare din lanț, dacă acesta există.
