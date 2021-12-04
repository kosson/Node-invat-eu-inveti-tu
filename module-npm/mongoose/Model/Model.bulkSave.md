# Model.bulkSave

Această metodă acțiunează `bulkWrite` în subsidiar și este utilă atunci când lucrezi cu mai mult de 10K de documente.

Metoda primește un array de documente, modificările necesare și apoi face insert/update la documente în baza de date, fie că documentul este nou sau există deja, fie că s-a modificat sau nu.

Ca parametri primește documentele ca `Array`.