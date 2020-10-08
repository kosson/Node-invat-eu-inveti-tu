# Promisificarea calback-ului

Express.js folosește callback-uri pentru rezolvarea rutelor.

```javascript
function asyncWrapper(fn) {
  return (req, res, next) => {
    return Promise.resolve(fn(req))
      .then((result) => res.send(result))
      .catch((err) => next(err))
  }
};

router.get('/', asyncWrapper(controller_index.get_index));
```

## Resurse

- [Prevent multiple callback error when client send multiple requests | Stack Overflow](https://stackoverflow.com/questions/63781229/prevent-multiple-callback-error-when-client-send-multiple-requests/63879432#63879432)
