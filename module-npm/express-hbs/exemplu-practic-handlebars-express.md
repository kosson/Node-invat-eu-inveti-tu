# Exemplu de configurare inițială

Un minim de configurare ar fi următoarea structură de directoare în rădăcină:

```text
views
|_partials [director]
|_index.hbs[fișier]
```

În fișierul `index.hbs` pui o structură simplă HTML5.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Nume pagină</title>
</head>
<body>
    <p>Acesta este un test</p>
</body>
</html>
```

În `app.js` din rădăcină ai putea avea următoarele setări standard:

```javascript
const fs             = require('fs');
const path           = require('path');
const bodyParser     = require('body-parser');
const express        = require('express');
const app            = express();
const hbs            = require('express-hbs');
const http           = require('http').createServer(app);
const cors           = require('cors');
const favicon        = require('serve-favicon');

app.use(cors());
app.use(favicon(path.join(__dirname,  'public', 'favicon.ico')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

app.use('/', function blogShow (req, res) {
    res.render('index');
});

http.listen(8080, '127.0.0.1', function cbConnection () {
    console.log('Server pornit pe 8080 -> binded pe 127.0.0.1');
});
```

În acest moment fișierul `index.hbs` este compilat de motorul Handlebars și este trimis clientului.
