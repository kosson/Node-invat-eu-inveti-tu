# Constantele sistemului de fișiere

Contantele sunt exportate ca `fs.constants`. Aceste constante diferă în funcție de sistemul de fișiere.

## File Access Constants

| Constantă | Descriere                                                    |
| --------- | ------------------------------------------------------------ |
| `F_OK`    | Indică faptul că fișierul este disponibil procesului care are nevoie de el. Acesta indică că fișierul există, dar nu spune absolut nimic despre permisiuni `rwx`. Este modul din oficiu. |
| `R_OK`    | Indică faptul că fișierul poate fi citit de procesul care îl apelează. |
| `W_OK`    | Indică faptul că fișierul poate fi scris de procesul care îl apelează. |
| `X_OK`    | Indică faptul că fișierul poate fi executat de procesul care îl apelează. Nu are efect pe Windows (același comportament precum cel al lui `F_OK`). |
