# Definirea și crearea de modele

Modelele de date sunt construite folosind interfața `Schema`. Ceea ce permite această interfață este să definești câmpurile ce vor fi adăugte fiecărui document, valorile implicite, precum și regulile de validare a datelor ce vor fi introduse.

Schemele vor fi compilate în modele. Fiecarui **model** îi corespunde o colecție din baza de date.

## Realizarea schemelor

Construirea unei Scheme constă în instanțierea unui nou obiect `Schema`, care este, de fapt, o metodă a obiectului **mongoose**.

```javascript
// instanțiază biblioteca de cod (obiectul) mongoose
var mongoose = require('mongoose');
// instanțiază un obiect Schema căruia
// îi pasezi obiectul de configurare
var obiectSchema = new mongoose.Schema({
  nume: String
});
```

Următorul pas este crearea unui model. Primul argument este numele colecției care va fi creată în baza de date pentru modelul nostru. Cel de-al doilea parametru va fi chiar schema datelor care vor fi conținute de fiecare întregistrare.

```javascript
var ModelNume = mongoose.model('ModelNume', obiectSchema);
```
