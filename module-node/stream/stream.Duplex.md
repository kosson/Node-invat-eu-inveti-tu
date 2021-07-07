### Clasa `stream.Duplex`

Sunt acele stream-uri bidirecționale în care se poate scrie și citi deopotrivă. Are nevoie să fie *writable* pentru a se putea face **pipe** datelor de input pe care le putem introduce. Trebuie să fie *readable* pentru a se putea face **pipe** datelor transformate către următorul bloc de transformare din lanț, dacă acesta există.

O aplicație conectată la un stream duplex poate citi și scrie în stream-ul duplex. Un exemplu ar fi `net.Socket`.

Într-un stream duplex, partea care citește este separată de cea care scrie și fiecare are propriul `Buffer`.

```text
          <-- citește --|----Buffer read|<--
aplicație               |---------------|     Socket
          -- scrie   -->|Buffer write---|-->
```
