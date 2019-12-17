## Client

Clasa `Client` reprezintă o conexiune a lui `engine.io`. Un `Client` poate fi asociat cu mai multe `Socket`-uri multiplexate care aparțin diferitelor `Namespace`-uri.

### Obiectul conexiunii `io`

#### `io(\[url][, options])`

Primul pas în stabilirea unei conexiuni cu serverul este să instanțiezi un obiect socket apelând metoda `io` cu câțiva parametri.

- **url** este un `String` care menționează namespace-ul la care se face conexiunea. Dacă nu este menționat, conectarea se va face la `window.location`, adică url-ul pe care este pagina deschisă.
- **options** este un `Object` care poate fi populat cu opțiunile de conectare a clientului la server.

Metoda va returna un obiect `Socket`.

Ceea ce se va petrece în spatele cortinei, este o instațiere a unui `Manager` pentru url-ul pasat. Dacă există și alte apeluri din pagina clientului, `Manager`-ul va fi reutilizat cu excepția cazului în care opțiunea `multiplex` are setată valoarea la `false`. Setarea multiplexării la `false` atrage după sine generarea unei noi conexiuni de fiecare dată când clientul se conectează la server. Acest lucru este echivalentul opțiunii `'force new connection': true` pasate în obiectul de configurare a conexiunii sau mai nou `forceNew: true`.

Conectarea la un namespace specificat, de exemplu `io('/users')` declanșează câteva etape de conectare:

- prima dată clientul se va conecta pe rădăcină la `http://localhost` sau la rădăcina indicată de valoarea `window.location`;
- Imediat după, conexiunea Socket.IO se va face la namespace-ul specificat: `/users`.

### Trimiterea parametrilor

Dacă ai nevoie să trimiți din client către server parametri, care să fie atașați apelului fără a mai folosi un eveniment dedicat, poți face acest lucru folosindu-te de posibilitatea de a trimite opțiuni la momentul conectării, fie atașând la namespace: `http://localhost/users?token=b10ef34`, fie trimițând în obiectul de opțiuni ca al doilea argument, o proprietate `query`, care să conțină datele necesare.

```javascript
const socket = io({
  query: {
    token: 'b10ef34'
  }
});
```

Trimiterea parametrilor este în tandem cu momentul primirii acestora pe server. Obiectul `socket` are o proprietate [`handshake`](https://socket.io/docs/server-api/#socket-request), care este referința către un obiect, care între celelalte, are și `query`, care este chiar obiectul trimis de client.

```javascript
{
  query: {}
}
```

Handshake-ul se întâmplă o singură dată, la momentul conectării clientului cu serverul.

## Proprietăți ale clientului

### `client.conn`

Aceasta este o referință la conexiunea `Socket` a lui `engine.io`.

### `client.request`

Acesta este un proxy tip getter care returnează referința către o cerere (*request*) cu originea în `engine.io`. Această referință este utilă pentru a accesa headere ale cererilor precum `Cookie` sau `User-Agent`.
