var MongoClient = require('mongodb');
const CONNECTION_STRING = process.env.DB;
var request = require('request');

function StockHandler() {
  
  this.getData = function(stock, callback) {
    var result;
    request('https://api.iextrading.com/1.0/stock/'+stock+'/book', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //console.log(body)
        var result = JSON.parse(body);
        callback('stockData', {stock: result.quote.symbol, price: result.quote.latestPrice});
      } else {
        console.log('error');
        callback('stockData', 'external error');
      }
    });
  };
  
  this.getLikes = function(stock, like, ip, callback) {
    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      var collection = db.collection('stock_likes');
      if(!like) {
        collection.find({stock:stock})
        .toArray(function(err, doc) {
          var likes = 0;
          if (doc.length > 0){
            likes = doc[0].likes.length;
          }
          callback('likeData', {stock: stock, likes: likes});
        });
      } else {
        collection.findAndModify(
          {stock: stock},
          [],
          {$addToSet: { likes: ip }},
          {new: true, upsert: true},
          function(err, doc) {
            callback('likeData',{stock: stock, likes: doc.value.likes.length});
          });
      }
   });
  };
  
}

module.exports = StockHandler;
