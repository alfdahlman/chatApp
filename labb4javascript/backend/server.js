var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var app = express();
var database;
var bodyParser = require('body-parser');
var path = require('path');
//var ObjectId = require('mongodb').ObjectID;

app.use('/', express.static(path.join(path.resolve(), 'public')));
app.use(express.static('../'));
app.use(bodyParser.json());

MongoClient.connect('mongodb://localhost:27017',

    function(error, client) {
        if (error) {
            console.error('failed to connect to server!');
            console.log(error);
        } else {
            console.log('connected to server!');
            database = client.db('messages');
        }
    });

app.get('/string', function (request, response) {

    database.collection('string').find({ $and : [
        { $or : [ { from: request.query.from }, { from: request.query.to } ] },
        { $or : [ { to: request.query.from }, { to: request.query.to } ] }
    ]
    }).toArray(function (error, result) {
        if (error) {
            console.log(error);
        }else {
            response.send(result);
        }
    });
});

app.get('/user', function (request, response) {
    database.collection('user').find().toArray(function (error, result) {
        if (error) {
            console.log(error);
        }else {
            response.send(result);
        }
    });
});


app.post('/string', function (request, response) {
    database.collection('string').insert(request.body, function (error, result) {
        if (error) {
            console.log(error);
        }else {
            response.send(result);
        }
    });
});

app.post('/user', function (request, response) {
    database.collection('user').insert(request.body, function (error, result) {
        if (error) {
            console.log(error);
        }else {
            response.send(result);
        }
    });
});

app.get('/user', function (request, response) {
    database.collection('user').find({ 'name': { $exists: true }}).toArray(function (error, result) {
        if (error) {
            console.log(error);
        }else {
            response.send(result);
        }
    });
});

app.delete('/user', function (request, response) {
    database.collection('user').remove({}, function (error) {
        if (error) {
            console.log(error);
        }else {
            response.send({});
        }
    });
});

app.put('/user/:name', function (request, response) {
    database.collection('user').update(
        {name: request.params.name},
        {$push: {friends: request.body}},
        function (error, result) {
            if (error) {
                console.log(error);
            }else {
                response.send(result);
            }
        });
});
//lade till []
app.put('/confirm', function (request, response) {
    console.log([{name: request.query.name, 'friends.name' : request.query.name2}, {$set: {'friends.$.status': 'confirmed'}},{multi: true}]);
    database.collection('user').update(
        {name: request.query.name, 'friends.name' : request.query.name2},
        {$set: {'friends.$.status': 'confirmed'}},{multi: true},
        function (error, result) {
            if (error) {
                console.log(error);
            }else {
                response.send(result);
            }
        });
});

app.listen(3000, function () {
    console.log('The service is UPDATED and running!');
});
