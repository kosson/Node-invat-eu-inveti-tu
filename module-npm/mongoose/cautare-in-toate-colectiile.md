# Căutarea în toate colecțiile

Context: https://stackoverflow.com/questions/20056903/search-on-multiple-collections-in-mongodb
S-ar putea face doar dacă folosești `$lookup` și `$facet` într-o agregare.

## Soluția 1

```javascript
db.collection.aggregate([
  { "$limit": 1 },
  { "$facet": {
    "c1": [
      {
        "$lookup": {
          "from": Users.collection.name,
          "pipeline": [
            { "$match": { "first_name": "your_search_data" } }
          ],
          "as": "collection1"
        }
      }
    ],
    "c2": [
      { "$lookup": {
        "from": State.collection.name,
        "pipeline": [
          { "$match": { "name": "your_search_data" } }
        ],
        "as": "collection2"
      }}
    ],
    "c3": [
      { "$lookup": {
        "from": State.collection.name,
        "pipeline": [
          { "$match": { "name": "your_search_data" } }
        ],
        "as": "collection3"
      }}
    ]
  }},
  { "$project": {
    "data": {
      "$concatArrays": [ "$c1", "$c2", "$c3" ]
    }
  }},
  { "$unwind": "$data" },
  { "$replaceRoot": { "newRoot": "$data" } }
])
```

## Soluția 2

Context:https://stackoverflow.com/questions/59541327/search-through-all-collections-of-a-database-in-mongodb-python
You can achieve this in two steps:

# Retrieve all collections in the database - db.getCollectionNames()
# For each collection run the query below

Query:

```javascript
db.collection.aggregate([
    {
        $match: {
            $expr: {
                $eq: [
                    {
                        $strLenCP: "$word"
                    },
                    6
                ]
            }
        }
    }
]);
```

For each collection use $strLenCP with this aggregation:

```javascript
db.collection.aggregate([
    {
        $match: {
            $expr: {$eq: [{$strLenCP: "$word"}, 6]}
        }
    }
])
```

## Soluția 3

De la https://gist.github.com/fkiller/005dc8a07eaa3321110b3e5753dda71b
Context: https://stackoverflow.com/questions/20056903/search-on-multiple-collections-in-mongodb

This is a set of functions to search entire DB by simple keyword. If you need to find something from any records from any collections that you don't remember names, just load this functions and `searchAll('any keyword')` in Mongo console.

```javascript
/************************************************************************
*   This is a set of functions to search entire DB by simple keyword.   *
*                                                                       *
*   Developered by Won Dong(fkiller@gmail.com)                          *
*                                                                       *
*   * Usage: searchAll('any keyword')                                   *
*                                                                       *
*************************************************************************/

function createOR(fieldNames, keyword) {
    var query = [];
    fieldNames.forEach(function (item) {
        var temp = {};
        temp[item] = { $regex: '.*' + keyword + '.*' };
        query.push(temp);
    });
    if (query.length == 0) return false;
    return { $or: query };
}

function keys(collectionName) {
    mr = db.runCommand({
        'mapreduce': collectionName,
        'map': function () {
            for (var key in this) { emit(key, null); }
        },
        'reduce': function (key, stuff) { return null; },
        'out': 'my_collection' + '_keys'
    });
    return db[mr.result].distinct('_id');
}

function findany(collection, keyword) {
    var query = createOR(keys(collection.getName()));
    if (query) {
        return collection.findOne(query, keyword);
    } else {
        return false;
    }
}

function searchAll(keyword) {
    var all = db.getCollectionNames();
    var results = [];
    all.forEach(function (collectionName) {
        print(collectionName);
        if (db[collectionName]) results.push(findany(db[collectionName], keyword));
    });
    return results;
}
```

## Soluția 4

You can achieve this using $mergeObjects by MongoDB Driver Example Create a collection orders with the following documents:

```javascript
db.orders.insert([
  { "_id" : 1, "item" : "abc", "price" : 12, "ordered" : 2 },
  { "_id" : 2, "item" : "jkl", "price" : 20, "ordered" : 1 }
])
```

Create another collection items with the following documents:

```javascript
db.items.insert([
  { "_id" : 1, "item" : "abc", description: "product 1", "instock" : 120 },
  { "_id" : 2, "item" : "def", description: "product 2", "instock" : 80 },
  { "_id" : 3, "item" : "jkl", description: "product 3", "instock" : 60 }
])
```

The following operation first uses the $lookup stage to join the two collections by the item fields and then uses $mergeObjects in the $replaceRoot to merge the joined documents from items and orders:

```javascript
db.orders.aggregate([
   {
      $lookup: {
         from: "items",
         localField: "item",    // field in the orders collection
         foreignField: "item",  // field in the items collection
         as: "fromItems"
      }
   },
   {
      $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$fromItems", 0 ] }, "$$ROOT" ] } }
   },
   { $project: { fromItems: 0 } }
])
```

The operation returns the following documents:

```javascript
{ "_id" : 1, "item" : "abc", "description" : "product 1", "instock" : 120, "price" : 12, "ordered" : 2 }
{ "_id" : 2, "item" : "jkl", "description" : "product 3", "instock" : 60, "price" : 20, "ordered" : 1 }
```

This Technique merge Object and return the result

## Resurse

- https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
- https://stackoverflow.com/questions/20056903/search-on-multiple-collections-in-mongodb
- https://stackoverflow.com/questions/59541327/search-through-all-collections-of-a-database-in-mongodb-python
- https://gist.github.com/fkiller/005dc8a07eaa3321110b3e5753dda71b
