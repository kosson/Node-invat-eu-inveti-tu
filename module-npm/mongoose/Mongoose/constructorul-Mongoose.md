# Mongoose - constructor

Obiectul generat prin `exports` este o instanță a acestei clase.

```javascript
const mongoose = require('mongoose');
mongoose instanceof mongoose.Mongoose; // true

// Create a new Mongoose instance with its own `connect()`, `set()`, `model()`, etc.
const m = new mongoose.Mongoose();
```
