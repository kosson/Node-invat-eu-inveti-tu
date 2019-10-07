# Metoda `app.locals`

Este un obiect a cărui proprietăți persistă pe întreaga durată cât aplicația există. Această proprietate nu trebuie confundată cu `res.locals`, care persistă câtă vreme este tratată o cerere de la un client și este format apoi un răspund (`res.locals`).

Variabilele locale pot fi accesate în template-urile generate de aplicație. Acest lucru își dovedește utilitatea atunci când sunt create funcții helper necesare template-ului.

Adu-ți mereu aminte că aceste date sunt disponibile întregii aplicații.

Variabilele locale sunt disponibile și obiectului `req` prin `req.app.locals`.

```javascript
app.locals.title = 'My App';
app.locals.strftime = require('strftime');
```
