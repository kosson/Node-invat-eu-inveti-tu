# Middleware-ul compression

Este folosit pentru a transfera datele comprimate gzip. Pachetul poate fi consultat la https://www.npmjs.com/package/compression.

```javascript
// mai întâi cere middleware-ul
var compression = require('compression');
// apoi inserarea middleware-ul
app.use(compression());
```

Pentru mai multe configurări ale pachetului este necesară consultarea documentației.
