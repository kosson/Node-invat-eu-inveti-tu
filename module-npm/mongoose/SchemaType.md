# SchemaType

Este mecanismul prin care Mongoose gestionează **căile**.

Dacă pentru un model Mongoose, un obiect `Schema` este cel care îl configurează, un `SchemaType` este un obiect care configurează fiecare proprietate la nivel individual din obiectul tip `Schema`.

Un `SchemaType` este un obiect de configurare pentru proprietățile unei scheme.

Un `SchemaType` menționează ce tip de date poate avea o cale. Dacă aceasta este de tip getter sau setter și care tipuri de date sunt valide pentru acea cale.

```javascript
const schema = new Schema({ nume: String });
schema.path('nume') instanceof mongoose.SchemaType;          // true
schema.path('nume') instanceof mongoose.Schema.Types.String; // true
schema.path('nume').instance; // 'String'
```

Typurile de date pe care un `SchemaType` le poate configura sunt:

- `String`,
- `Number`,
- `Date`,
- `Buffer`,
- `Boolean`,
- `Mixed`,
- `ObjectId`,
- `Array`,
- `Decimal128`,
- `Map`.
