# Validări

Validările sunt definite atunci când elaborezi **Schema**.
Validarea unui path se precizează la momentul configurării path-ului prin *SchemaType*.
Mecanismul de validare este în sine un middleware, care este aplicat la momentul în care se face o salvare. Intern, Mongoose, de fapt, folosește cârligul `pre('save')`.
Poți dezactiva validarea automată înaintea salvării prin setarea opțiunii `validateBeforeSave`.
Poți rula validări manuale folosind `doc.validate(callback)` sau `doc.validateSync()`.
În cazul în care scenariul de lucru implică invalidarea voită a unui câmp, poți folosi `doc.invalidate(...)`.
Validatorii nu vor rula pe valorile `undefined` cu excepția câmpurilor pentru care avem fanionul `required` menționat.
Validările se vor face recursiv asincron și pentru subdocumente la momentul salvării.

## Validatori din oficiu

Mongoose pune la dispoziție din oficiu câțiva validatori. De exemplu, toate `SchemaTypes` au validatorul `required`, care se bazează pe funcția [checkRequired()](https://mongoosejs.com/docs/api.html#schematype_SchemaType-checkRequired) pentru a determina dacă valoarea satisface validatorul `required`.
Un alt validator din oficiu care se poate dovedi util este cel care se poate aplica numerelor pentru a verifica dacă valoarea se află între niște limite (`min` și `max`).
Șirurile de caractere se bucură și ele de validatori din oficiu precum `enum`, `match`, `minLength` și `maxLength`.

## Resurse

- [Validation | mongoosejs.com/docs](https://mongoosejs.com/docs/validation.html#built-in-validators)
