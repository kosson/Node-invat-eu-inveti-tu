# Mongoose.prototype.connections

Este un array în care sunt toate obiectele conexiune asociate instanței de mongoose. Din start vei avea cel puțin o conexiune.

```javascript
const mongoose = require('mongoose');
mongoose.connections.length; // 1, just the default connection
mongoose.connections[0] === mongoose.connection; // true

mongoose.createConnection('mongodb://localhost:27017/test');
mongoose.connections.length; // 2
```
