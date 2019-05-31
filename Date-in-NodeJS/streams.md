# Streams

Streamurile sunt date care *curg* ca urmare a unui eveniment `EventEmitter` între diferitele părți funcționale ale unui program.

Datele de input ale unui program sau componentă software sunt datele de output ale alteia. În UNIX, două sau mai multe programe sunt conectate prin caracterul `|`, care în limba engleză se numește `pipe`, iar în română *țeavă*.

Chiar dacă nu suntem programatori de UNIX, vom explora un exemplu de funcționare a mai multor progrămele mici folosite în mod curent într-un terminal, de data aceasta de GNU/Linux.

```bash
ls -l | grep "nicolaie" | sort -n
```

Secvența de mai sus listează numele de fișiere (`ls`) în a căror denumire se găsește fragmentul de text `nicolaie`, după care sortează ceea ce a găsit. Cele trei programe: `ls`, `grep` și `sort` au stabilit un flux de prelucrare, de fapt. Ceea ce a găsit comanda `ls` va fi pasat prin `pipe` (`|`) către următoarea comandă `grep`, care are misiunea de a detecta în toate denumirile tuturor fișierelor din directorul în care se execută fluxul de comenzi, fragmentul de text `nicolaie` și în final, rezultatul va fi pasat prin pipe din nou către ultima comandă `sort`, care va returna spre afișare rezultatul la care s-a ajuns.

Ceea ce merită remarcat este faptul că, fiecare componentă din lanțul de prelucrare, poate fi perceput ca un adevărat filtru.


## Referințe

- [Pipeline (Unix), Wikipedia](https://en.wikipedia.org/wiki/Pipeline_(Unix))
