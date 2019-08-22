# Clasa `fs.FSWatcher`

Apelarea metodei `fs.watch()` va returna un obiect `fs.FSWatcher`. De fiecare dată când un fișier suferă o modificare în timp ce este *supravegheat*, va emite un eveniment  `change`.

## Evenimentul `change`

Acest eveniment apare atunci când apare o modificare în directorul sau fișierul care este sub observație cu `watch()`.

Funcția cu rol de callback primește două argumente:
- `eventType` este de tip string și reprezintă tipul evenimentului care a apărut;
- `filename` poate fi string sau `Buffer`, fiind numele fișierului care a fost modificat

Dacă este precizat modul de codare a fișierului la valoarea `buffer`, fișierul va fi evaluat ca un `Buffer`. În caz contrar, fișierul va fi evaluat ca șir UTF-8.

```javascript
fs.watch('./tmp', { encoding: 'buffer' }, (eventType, filename) => {
  if (filename) {
    console.log(filename);
    // Afișează: <Buffer ...>
  }
});
```

## Eveniment `close`

Evenimentul este emis atunci când un fișier încetează să mai fie *supravegheat*.

## Eveniment `error`

Acest eveniment este emis atunci când apare o eroare cât timp fișierul este *supravegheat*.

## Metoda `watcher.close()`

Această metodă încheie *supravegherea* fișierului când este invocată pe un obiect instanțiat cu `fs.FSWatcher`. Din momentul în care această metodă este invocată, obiectul instanțiat cu `fs.FSWatcher` nu mai este utilizabil.
  }