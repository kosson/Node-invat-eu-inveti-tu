Gestionează următoarea secvență NodeJS cu PM2: `pm2 start index.js -i 0`. Opțiunea `-i 0` îi spune lui PM2 să ia singur decizia privind câți workeri ar trebui să pornească. PM2 va porni atâtea instanțe câte nuclee logice sunt disponibile. Nuclee logice sunt cele fizice înmulțite cu câte fire de execuție pot gestiona (de regulă 2).

```javascript
const express = require('express');
const app = express();
const crypto = require('crypto');

// simulează lucrul la ceva
function facCeva (perioada) {
    let start = Date.now();
    while (Date.now() - start < perioada ) {
        // stai in buclă până se întrunește condiția
    }
};

app.get('/', (req, res) => {
    // facCeva(5000); // se va înregistra o întârziere de 5 secunde.
    crypto.pbkdf2('a','b', 100000, 512, 'sha512', () => {
        res.send('Salutare, fac ceva care blocheaza event loop-ul');
    });
    // res.send('Salve');
});

app.get('/rutarapida', (req, res) => {
    res.send('S-a încărcat folosind un copil');
});

app.listen(3000);
```

Pentru a închide o sesiune PM2, introduci `pm2 delete index`.

Pentru mai multe detalii privind rularea unei aplicații `pm2 show index`. Pentru a organiza informația într-un tablou de bord, se va folosi `pm2 monit`.

## Referințe

[Web Workers](https://www.w3.org/TR/workers/)
[WebWorker Threads](https://www.npmjs.com/package/webworker-threads)