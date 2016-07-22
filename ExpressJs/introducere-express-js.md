# Express.js

## Folosirea middleware-ului

În Express, middleware-ul este „consumat” cu `use()`.

```js
app.use(
  function(request, response, next){
    // cod
    next();
  },
  function(request, response, next){
    // cod
    next();
  },
  function(request, response, next){
    // cod
    next();
  }
);
```
