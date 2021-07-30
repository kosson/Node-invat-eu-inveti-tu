# Metada read pe un readable

Semnătura: `readable.read([size])`.


```javascript
const readable = getReadableStreamSomehow();

// 'readable' poate fi declanșat de mai multe ori pe măsură ce datele intră în buffering
readable.on('readable', () => {
  let chunk;
  console.log('Stream is readable (new data received in buffer)');
  // Use a loop to make sure we read all currently available data
  while (null !== (chunk = readable.read())) {
    console.log(`Read ${chunk.length} bytes of data...`);
  }
});

// 'end' will be triggered once when there is no more data available
readable.on('end', () => {
  console.log('Reached end of stream.');
});
```

## Resurse

- [readable.read([size]) | nodejs.org/api/stream.html](https://nodejs.org/api/stream.html#stream_readable_read_size)
