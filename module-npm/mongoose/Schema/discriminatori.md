# Discriminatori

Discriminatorii permit stocarea documentelor având fiecare câte o schemă care prezintă câte o variație în aceeași colecție. Discriminatorii permit stocarea unor documente similare în aceeași colecție, acestea având cerințe diferite pentru câmpurile care diferă între ele. Sunt foarte utile atunci când vrei să gestionezi anumite evenimente sau pentru implementarea unui sistem de gestiune a permisiunilor pentru diferite tipuri de utilizatori.

Implementarea poate fi făcută folosind tipul `Mixed`, care este un tip ce permite orice dezvoltare a datelor pentru că mongoose nu face casting și nici validări pe acest tip.

```javascript
var eventSchema = new mongoose.Schema({
  	// Tipul evenimentului
    type: String,
    required: true,
    enum: ['ClickedLink', 'Purchased']
  },
  // Momentul în care s-a produs evenimentul
  time: {
    type: Date,
    default: Date.now
  },
  /* Date arbitrare asociate evenimentului
   * `{}` corespude tipului `Mixed` în mongoose,
   * deci nu se face nicio validatre pe acest câmp */
  data: {}
});

var Event = mongoose.model('Event', eventSchema);
```

Din nefericire, folosirea tipului Mixed este superfuă în acest caz, preferabil fiind utilizarea directă a driverului MongoDB. Ceea ce se pierde este posibilitatea de a face validări.

## Crearea discriminatorilor

Pornim de la următorul model.

```javascript
var options = { discriminatorKey: 'kind' };

var eventSchema = new mongoose.Schema(
  {
    // Momentul când s-a petrecut evenimentul
    time: {
      type: Date,
      default: Date.now
    }
  },
  options);
var Event = mongoose.model('Event', eventSchema);
```

Opțiunea `discriminatoryKey` îi spune lui mongoose să adauge o cale nouă numită `kind` care să fie folosită pentru a urmări ce tip de document este.

Discriminatorii pot fi mai mulți și pot avea propria schemă.

```javascript
// ClickedLinkEvent
var clickedEventSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  options);
var ClickedLinkEvent = Event.discriminator('ClickedLink', clickedEventSchema); // seamnă cu un model

// PurchasedEvent
var purchasedSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId }
  },
  options);
var PurchasedEvent = Event.discriminator('Purchased',
  purchasedSchema); //seamnă cu un model
```

Cei doi discriminatori `ClickedLinkEvent` și `PurchasedEvent` lucrează aproape ca modelele normale din mongoose.

Schema pentru `ClickedLinkEvent` este uniunea dintre schema `eventSchema` și `clickedEventSchema`. Acest lucru înseamnă că schema `ClickedLinkEvent` are următoarele câmpuri:

- câmpul discriminatorului numit `kind`;
- câmpul `time` din schema `eventSchema` și câmpurile
- `from` și `to` din schema `clickedEventSchema`.

Important de reținut este că datele încărcate în modelele fiecărui eveniment vor fi salvate în aceeași colecție. Un lucru important este acela că de vei utiliza modelul discriminatorului pentru a interoga baza de date, vei găsi doar datele corespondente acelui eveniment, adică cele care au proprietatea `"kind" : "ClickedLink"`.

```javascript
ClickedLinkEvent.find({}, function(error, events) {
	// ...
});
```

Agregările vor lua în considerare discriminatorii.


## Discriminatorii în detaliu

Discriminatorii pot fi considerați mecanismul care permite moștenirea la nivel de scheme. Ceea ce permit discriminatorii este să ai mai multe modele care au scheme proprii, dar care folosesc o schemă cu un set de căi care sunt comune. Datele sunt salvate în aceeași colecție.

```javascript
const eventSchema = new Schema({ message: String },
  { discriminatorKey: 'kind' });

const Event = mongoose.model('Event', eventSchema);

const ClickedEvent = Event.discriminator('Clicked', new Schema({
  element: {
    type: String,
    required: true
  }
}));

const PurchasedEvent = Event.discriminator('Purchased', new Schema({
  product: {
    type: String,
    required: true
  }
}));
```

Fiecare discriminator se comportă ca un model, ceea ce conduce la salvarea unei înregistrări distincte în colecție.

```javascript
const event1 = new Event({ time: Date.now() });
const event2 = new ClickedLinkEvent({ time: Date.now(), url: 'google.com' });
const event3 = new SignedUpEvent({ time: Date.now(), user: 'testuser' });


await Promise.all([event1.save(), event2.save(), event3.save()]);
const count = await Event.countDocuments();
```

## Cheile discriminatorilor

Mongoose face diferența între diferitele modele de discriminatori prin folosirea cheilor care desemnează discriminatorul. Dacă nu este dată o denumire explicită, din oficiu este `__t`. Mongoose adaugă o cale cu numele `__t` care va avea valoarea numelui modelului discriminatorului.

```javascript
const event1 = new Event({ time: Date.now() });
const event2 = new ClickedLinkEvent({ time: Date.now(), url: 'google.com' });
const event3 = new SignedUpEvent({ time: Date.now(), user: 'testuser' });

assert.ok(!event1.__t);
assert.equal(event2.__t, 'ClickedLink');
assert.equal(event3.__t, 'SignedUp');
```


## Metoda discriminator()

Această metodă primește trei argumente: numele modelului, schema discriminatorului și mențiunea cheii discriminatorului (opțional). Metoda va returna un model care este uniunea schemei de bază cu cea a discriminatorului.

```javascript
const options = { discriminatorKey: 'kind' };

const eventSchema = new mongoose.Schema({ time: Date }, options);
const Event = mongoose.model('Event', eventSchema);

// ClickedLinkEvent este un tip special de Event care are un URL.
const ClickedLinkEvent = Event.discriminator('ClickedLink',
  new mongoose.Schema({ url: String }, options));
  
// proprietatea `kind` va fi setată cu valoarea `ClickedLink`

// Când creezi un eveniment generic, acesta nu poate avea un câmp cu URL
const genericEvent = new Event({ time: Date.now(), url: 'google.com' });

// Dar un ClickedLinkEvent poate
const clickedEvent = new ClickedLinkEvent({ time: Date.now(), url: 'google.com' });
```

Apelarea la căutarea documentelor a lui `ClickedLinkEvent.find()` este echivalentă cu `Event.find(kind: 'ClickedLink')`.

## Discriminatori pentru array-uri de documente

Se pot crea seturi de evenimente per înregistrare pentru care mongoose va dirija valorile proprietăților `kind` căre tipurile corespunzătoare. 

```javascript
const eventSchema = new Schema({ message: String },
  { discriminatorKey: 'kind', _id: false });

const batchSchema = new Schema({ events: [eventSchema] });

// `batchSchema.path('events')` conduce la un `DocumentArray`
batchSchema.path('events').discriminator('Clicked', new Schema({
  element: {
    type: String,
    required: true
  }
}, { _id: false }));

batchSchema.path('events').discriminator('Purchased', new Schema({
  product: {
    type: String,
    required: true
  }
}, { _id: false }));

const Batch = mongoose.model('Batch', batchSchema);
```

Rezultatul este o înregistrare care poate avea mai multe evenimente specifice.

```javascript
const batch = {
  events: [
    { kind: 'Clicked', element: 'Test' },
    { kind: 'Purchased', product: 22 }
  ]
};

Batch.create(batch).then(console.log);

// Output
/*
{ __v: 0,
  _id: 589389b84724655fca070f84,
  events:
   [ { element: 'Test', kind: 'Clicked' },
     { product: '22', kind: 'Purchased' } ] }
*/
```

Un alt exemplu.

```javascript
const productSchema = new Schema({
  imageURL: String,
  name: String
}, { discriminatorKey: '__t' });

const bookSchema = new Schema({
  author: String
});

const computerSchema = new Schema({
  ramGB: Number
});

const orderSchema = new Schema({
  createdAt: Date,
  product: [productSchema]
});

// Add discriminators to the `products` SchemaType.
orderSchema.path('products').discriminator('Book', bookSchema);
orderSchema.path('products').discriminator('Computer', computerSchema);

const Order = mongoose.model('Order', orderSchema);
```


## Metode pe discriminator

Mongoose permite definirea de metode pentru fiecare discriminator. De exemplu, poți crea o metodă `displayName()` pentru diferitele instanțe `ClickedEvent` și `PurchasedEvent`.

```javascript
const eventSchema = new Schema({ message: String },
  { discriminatorKey: 'kind', _id: false });

const batchSchema = new Schema({ events: [eventSchema] });

// Discriminatorul `Clicked`
const clickedSchema = new Schema({
  element: {
    type: String,
    required: true
  }
}, { _id: false })

clickedSchema.methods.displayName = function() {
  return `${this.kind}:${this.element}`;
};

batchSchema.path('events').discriminator('Clicked', clickedSchema);


// Discriminatorul `Purchased`
const purchasedSchema = new Schema({
  product: {
    type: String,
    required: true
  }
}, { _id: false });

purchasedSchema.methods.displayName = function() {
  return `${this.kind}:${this.product}`;
};

batchSchema.path('events').discriminator('Purchased', purchasedSchema);


// Modelul schemei de bază
const Batch = mongoose.model('Batch', batchSchema);

// Modul de utilizarea a schemei
const batch = {
  events: [
    { kind: 'Clicked', element: 'Test' },
    { kind: 'Purchased', product: 22 }
  ]
};

Batch.create(batch).
  then(batch => console.log(batch.events.map(e => e.displayName())));

// Output
/* [ 'Clicked:Test', 'Purchased:22' ] */
```

## Resurse

- [An 80/20 Guide to Mongoose Discriminators | thecodebarbarian.com | Valeri Karpov | July 24, 2015](http://thecodebarbarian.com/2015/07/24/guide-to-mongoose-discriminators)
- [Embedded Discriminators in Mongoose 4.8 | thecodebarbarian.com | Valeri Karpov | February 02, 2017](http://thecodebarbarian.com/mongoose-4.8-embedded-discriminators)
- [Discriminators | mongoosejs.com](https://mongoosejs.com/docs/discriminators.html)
- [What's New in Mongoose 4.12: Single Embedded Discriminators | thecodebarbarian.com | Valeri Karpov | October 12, 2017](https://thecodebarbarian.com/mongoose-4.12-single-embedded-discriminators.html)
- [An Introduction to Mongoose SchemaTypes | masteringjs.io | May 20, 2020](https://masteringjs.io/tutorials/mongoose/schematype)