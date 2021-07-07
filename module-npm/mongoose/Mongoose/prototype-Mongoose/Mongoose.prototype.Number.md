# Mongoose.prototype.Number

Este o proprietate folosită pentru a defini tipuri de date în Schemă. Este folosit pentru căile pentru care ar trebui făcut casting la number.

```javascript
const schema = new Schema({ num: mongoose.Number });
// echivalent cu:
const schema = new Schema({ num: 'number' });
```
