# Query.prototype.$where

Poți trimite sistemului de interogare o expresie sau o funcție JavaScript.

```javascript
query.$where('this.comments.length === 10 || this.name.length === 5')

// or

query.$where(function () {
  return this.comments.length === 10 || this.name.length === 5;
})
```
