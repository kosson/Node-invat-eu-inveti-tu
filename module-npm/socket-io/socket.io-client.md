# socket.io-client

Clientul este expus conexiunii socket.io prin apelarea scriptului servit chiar de server

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

## io.protocol

Returnează numărul protocolului folosit.

## io([url][, options])

Creează un nou `Manager` pentru URL-ul dat sau cel din oficiu (`window.location`).

Creates a new Manager for the given URL