# Callbacks, programarea execuției asincron

În Node.js, dacă o funcție acceptă ca argument un callback, acesta trebuie să fie pasat ultimul.

## Amânarea funcțiilor callback

Se folosește API-ul `process.nextTick()`, care amână execuția unei funcții până la următorul ciclu al buclei. Funcționează astfel: se ia un callback ca argument și se introduce în capul „listei de execuție” (task queue) înaintea oricărui eveniment I/O care așteaptă iar funcția gazdă va returna imediat. Funcția callback va fi invocată de îndată ce bucla începe un nou ciclu (adică când stiva este goală și poate fi trimis spre execuție callback-ul).

Un alt API pentru amânarea execuției este `setImmediate()`. Diferența dintre cele două este că nextTick rulează înaintea tuturor evenimentelor I/O, pe când `setImmediate` rulează după ultimul eveniment I/O, care este deja în task queue.
