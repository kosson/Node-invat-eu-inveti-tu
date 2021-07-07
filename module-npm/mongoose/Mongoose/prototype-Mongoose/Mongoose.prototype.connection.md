# Mongoose.prototype.connection

Este un obiect de conexiune, care reprezintă conexiunea primară a lui mongoose la MongoDB. Acest obiect este folosit de toate modelele create.

```javascript
var mongoose = require('mongoose');
mongoose.connect(...);
mongoose.connection.on('error', cb);
```
