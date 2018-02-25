# app.set()

Această metodă a lui Express este folosită pentru a seta chei care au rolul de a îmbogăți comportamentul. Lucrurile sunt simple. Este o metodă care ia doi parametri. Ceea ce face este să introducă în obiectul generat de `express()` o proprietate căreia îi atribuie valoarea din cel de-al doilea parametru.

Câteva exemple ar fi setarea care să specifice ceea ce ar trebui să aștepte Express pentru a construi fragmentele HTML.

```javascript
const express = require('express'),
      app = express();
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
```

Poți interoga valoarea proprietăților setate dacă dorești să testezi ce face set.

```javascript
console.log('serverul Express ascultă pe portul ' + app.get('port'));
```

Folosirea lui `app.set()` se leagă intim de conceptul de middleware. Middleware-ul este o funcție ceva mai specială ce permite o mai bună organizare și reutilizare a codului.

Cel mai uzual exemplu este al lui `bodyParser`, care este un middleware ce procesează conținutul corpului unui răspuns al unui apel HTTP. Dar, pentru a lega acest middleware de Express, va trebui să dotăm obiectul Express cu acest utilitar.

```javascript
app.use(bodyParser.json());
```

Tot cu ajutorul lui set poți introduce proprietăți care sunt utile șabloanelor pentru generarea fragmentelor HTML.

```javascript
app.set('numeApp', 'AplicatiaVietii');
```

Într-un șablon Jade poți prelua proprietatea.

```jade
doctype 5
  html
    head
      title= appName
    body
      block content
```
