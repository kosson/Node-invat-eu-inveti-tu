# Modulul Net

Acest modul al lui Node oferă un API asincron pentru a crea servere TCP care folosesc stream-urile. Poți avea acces direct la acest modul.

```javascript
const net = require('net');
```

Pentru a crea un server web simplu, ai nevoie de `net.Server`, care nu este nimic altceva decât un obiect care emite următoarele evenimente posibile:

- `close` este emis atunci când serverul este oprit
- `connection`, emis de fiecare dată când se realizează o conexiune,
- `error`,
- `listening`, emis atunci când serverul este pus să asculte imediat ce a fost invocat `server.listen()`