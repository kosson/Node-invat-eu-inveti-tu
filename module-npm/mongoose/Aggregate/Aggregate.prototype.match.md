# Aggregate.prototype.match()

Această metodă primește ca prim argument un `Object`. Returnează un obiect de tip `Aggregate`.

```javascript
NumeModel.find().match({
  unitatiBibliografice: {
    $in: ["carti", "articole"]
  }
});
```

În subsidiar, această metodă folosește biblioteca de cod [Sift](https://www.npmjs.com/package/sift), care face posibilă utilizarea operatorilor comuni a lui MongoDB.

Autorul Valeri Karpov indică faptul că un caz ideal de utilizare a acestei metode este acela când dorim să ascumdem anumite rezultate de unii utilizatori, pentru a le vedea doar anumiți. Este oferit exemplul unui articol de blog a cărui comentarii șterse să fie vizibile autorului articolului, dar nu și celorlați utilizatori.

```javascript
const BlogPost = mongoose.model('BlogPost', blogPostSchema);
const Comment = mongoose.model('Comment', commentSchema);

let post = await BlogPost.create({ title: 'Mongoose 5.5.0', authorId: 1 });
await Comment.create([
  { _id: 1, blogPostId: post._id, authorId: 2 },
  { _id: 2, blogPostId: post._id, authorId: 1 },
  { _id: 3, blogPostId: post._id, authorId: 1, deleted: true }
]);

post = await BlogPost.findOne().populate({
  path: 'comments',
  // parametrul pasat este chiar documentul adus prin aplicarea lui `populate()`
  match: doc => ({ authorId: doc.authorId, deleted: { $ne: true } })
});
console.log(post.comments.length);

// caută articolul și adu și comentariile marcate ca fiind șterse.
const authorId = 1;
post = await BlogPost.find().populate({
  path: 'comments',
  match: doc => (doc.authorId === authorId ? {} : { deleted: { $ne: true } })
});
```

În cazul în care definim noi funcția lui `match`, atunci parametrul pasat este chiar documentul adus prin aplicarea lui `populate()` - în cazul de mai sus `doc`.

## Resurse:

- [Populate Match Function | thecodebarbarian.com](http://thecodebarbarian.com/mongoose-5-5-static-hooks-and-populate-match-functions#populate-match-function)
