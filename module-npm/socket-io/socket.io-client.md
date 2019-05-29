# socket.io-client

## Serverul io

[Clientul](https://socket.io/docs/client-api/) este expus conexiunii socket.io prin apelarea scriptului servit chiar de server, de regulă pe calea `/socket.io/socket.io.js`.

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

În cazul în care dorești, poți specifica adresa web la care să se conecteze serverul clientului: `const socket = io('http://localhost')`. Același efect se poate obține prin import a bibliotecii `socket.io-client`.

```javascript
const io = require('socket.io-client');
// sau folosind sintaxa ES6
import io from 'socket.io-client';
```

### io.protocol

Returnează numărul protocolului folosit.

### io([url][, options])

Aceasta este metoda de a conecta clientul de server.

Creează un nou `Manager` pentru URL-ul dat sau cel din oficiu (`window.location`). Este returnat obiectul `Socket`, care realizează conectarea cu serverul.

## Obiectul socket

### socket.on

```javascript
var socket = io();
socket.on('connect', function (socket) {
    console.log(`Eu sunt ${socket.id}`);
    socket.on('salut', function (date) {
        // prelucreaza datele primite
    });
});
```

### socket.emit(eventName[, …args][, ack])

Această metodă emite către server date menționând numele evenimentului pentru care serverul ascultă. Al doilea parametru reprezintă datele pe care le trimiți către server. Aceste date pot fi de oricare tip, chiar și `Buffer`.
