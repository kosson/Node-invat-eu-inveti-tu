# Clasa `fs.FSWatcher`

Un apel al metodei `fs.watch()` va returna un nou obiect `fs.FSWatcher`.

Aceste obiecte implementează `EventEmitter` și vor emite evenimente `change` ori de câte ori un fișier care este sub *observație* va fi modificat.

## Evenimentul `change`

```javascript
fs.watch('./tmp', { encoding: 'buffer' }, (eventType, filename) => {
  if (filename) {
    console.log(filename);
    // Va afișa: <Buffer ...>
  }
});
```

## Evenimentul `close`

Este emis atunci când un fișier încetează a mai fi observat. Obiectul `fs.FSWatcher` nu va mai fi disponibil în event handler.

## Evenimentul `error`

Este emis în timp ce fișierul este *observat*. Obiectul `fs.FSWatcher` nu va mai fi disponibil în event handler.

## `watcher.close()`

Încheie observarea unui fișier. Obiectul `fs.FSWatcher` nu va mai fi disponibil în event handler.
