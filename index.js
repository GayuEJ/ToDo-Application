var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Parses urlencoded bodies
app.use(bodyParser.json());

//register
//signin
//GetTodos For a user
// add todos for a user
// Updated todoStatus for a user

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/todoDB');

var Schema = mongoose.Schema;

// todos
var todosSchema = new Schema({
    todoList: [{
        todoName:{
          type: String
        },
        todoStatus: {
          type: Boolean
        }
    }],
    user :{
      type: String
    },
    password :{
      type: String
    }
});

var Todos = mongoose.model('todos', todosSchema);


// Register
app.post('/register', function(req, res) {

console.log(req.body)

    var userDetails = new Todos({
        user: req.body.user
    });

console.log(userDetails);

userDetails.password=bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);

    userDetails.save(function(err, todos) {
        console.log(err);
        if (!err) {
            return res.json({
                status: 'OK',
                todos: todos
            });
        } else {
            res.statusCode = 500;
            res.json({
                error: 'Server error'
            });
        }
    });
});

// Sign in Validation
app.post('/signin', function(req, res) {

    var userDetails = new Todos({
        user: req.body.user,
        password: req.body.password
    });

console.log(userDetails);

Todos.findOne({ user: userDetails.user }, function(err, todoRes) {
  console.log(todoRes.user);
  console.log(todoRes.password);

  var isValid = bcrypt.compareSync(userDetails.password, todoRes.password);

    if(!isValid){
      res.statusCode = 400;

      return res.json({
          error: 'password does not match'
      });
  };

  return res.json({
      status: 'OK',
      todoRes: todoRes
  });

});


});

app.get('/todos/:userName', function(req, res) {

      console.log(req.params.userName);
    Todos.find({user:req.params.userName},{_id:1,user:1,todoList:1}, function(err, todos) {

        if (!todos) {
            res.statusCode = 404;

            return res.json({
                error: 'Not found'
            });
        };

        if (!err) {
            return res.json({
                status: 'OK',
                todos: todos
            });
        } else {
            res.statusCode = 500;
            //  log.error('Internal error(%d): %s',res.statusCode,err.message);

            return res.json({
                error: 'Server error'
            });
        };
    });
});

// app.get('/todo/:id', function(req, res) {
//
//   // console.log(req.params.id);
//     Todos.findOne({
//         "_id": req.params.id
//     }, function(err, todos) {
//
// console.log(todos);
//
//         if (!todos) {
//             res.statusCode = 404;
//             return res.json({
//                 error: 'Not found'
//             });
//         };
//
//         if (!err) {
//             return res.json({
//                 status: 'OK',
//                 todos: todos
//             });
//         } else {
//             res.statusCode = 500;
//             //  log.error('Internal error(%d): %s',res.statusCode,err.message);
//
//             return res.json({
//                 error: 'Server error'
//             });
//         };
//     });
// });

app.post('/todo', function(req, res) {

    var todos = new Todos({
        user: req.body.user,
        todoList: req.body.todoList
    });


console.log(todos);

  Todos.findOneAndUpdate({user: todos.user}, {$set: {todoList: todos.todoList}},function(err, todoRes) {
      console.log(err);
      if (!err) {
          return res.json({
              status: 'OK',
              todo: todoRes
          });
      } else {
          res.statusCode = 500;
          res.json({
              error: 'Server error'
          });
      }

});

});

app.put('/todo/', function(req, res) {

  var todos = new Todos({
      user: req.body.user,
      todoList: req.body.todoList
  });


console.log(todos);

Todos.findOneAndUpdate({user: todos.user}, {$set: {todoList: todos.todoList}},function(err, todoRes) {
    console.log(err);
    if (!err) {
        return res.json({
            status: 'OK',
            todo: todoRes
        });
    } else {
        res.statusCode = 500;
        res.json({
            error: 'Server error'
        });
    }

});

});

// app.delete('/todo/:id', function(req, res) {
//
//     Todos.findOneAndRemove({
//         id: req.param.id
//     },function(err, todos) {
//         console.log(err);
//         if (!err) {
//             return res.json({
//                 status: 'OK',
//                 todos: todos
//             });
//         } else {
//             res.statusCode = 500;
//             res.json({
//                 error: 'Server error'
//             });
//         }
//     });
// });

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Start the server
app.set('port', 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});
