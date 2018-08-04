# Introducere

Proiectul Node reflectă legăturile care se stabilesc între codul JavaScript scris de noi, motorul V8, care asigură interpretarea codului și biblioteca de cod `libuv`, care asigură puntea de acces către sistemul de operare și resursele sale.

Responsabil de conectarea JS-ului cu funcțiile C++ este `process.binding()` parte a motorului V8. Pentru fiecare metodă a API-ului Nodejs există un corespondent în C++. Legătura cu C++-ul poate fi investigată prin resursele din directorul `/lib` al proiectului Nodejs. Motorul V8 face o traducere a valorilor din JavaScript în C++, care mai apoi sunt procesate de libuv pentru a manipula resursele sistemului.

Nodejs rulează un singur fir de execuție pentru codul JavaScript și controlează execuția folosind un event loop.