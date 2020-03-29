# Rute de logare cu app.route();

## app.route() este de fapt o prescurtare pentru a chema Express Router.

În loc să chemi express.Router() putem chema app.route și să aplicăm rutele de acolo.
Folosirea lui `app.route()` permite definirea mai multor acțiuni pe o singură rută de logare.
Vom avea nevoie să arătăm un form de logare și o rută POST pentru a procesa formularul de logare.

Un exemplu simplu:

```js
app
  .route('/admin')
  .get(function(req, res){
    res.send('this is a login form');
  })
  .post(function(req, res){
    console.log('processing');
    res.send('processing the login form!');
  });
```

---

Un exemplu privind cum funcționează middleware-ul și prioritizarea operațiunilor.
Cererile care vin pe rădăcina lovesc prima și prima data acest middleware mesajul de consola este afișat in terminal.

```js
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

//Middleware utilizat pentru toate cererile
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.', req.method, req.url, req.path);
  next(); //indica faptul ca trebuie sa mearga si pe celelate rute. make sure we go to the next routes and don't stop here
});
```
