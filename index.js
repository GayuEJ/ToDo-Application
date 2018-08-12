var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');

//var bcrypt = require('bcrypt');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Parses urlencoded bodies
app.use(bodyParser.json());
app.use(cors());

//register
//signin
//GetTodos For a user
// add todos for a user
// Updated todoStatus for a user

var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:secret@<MongoDB-service-name>/sampledb', { useNewUrlParser: true });

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

//userDetails.password=bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
userDetails.password=req.body.password;

    userDetails.save(function(err, todos) {
        console.log(err);
        if (!err) {
            return res.json({

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
  console.log(todoRes);
  if(todoRes == null){
    return res.json({
        error: 'Credentials does not match'
    });
  }
  console.log(todoRes.password);

  //var isValid = bcrypt.compareSync(userDetails.password, todoRes.password);

  var isValid = false;

  if(todoRes.password === userDetails.password){
    isValid= true;
  }
    if(!isValid){
      res.statusCode = 400;

      return res.json({
          error: 'password does not match'
      });
  };

  return res.json({
      status: 'OK',
      user: todoRes.user
  });

});


});

app.get('/todos/:userName', function(req, res) {

      console.log(req.params.userName);
    Todos.find({user:req.params.userName},{todoList:1}, function(err, todosRes) {

        if (!todosRes) {
            res.statusCode = 404;

            return res.json({
                error: 'Not found'
            });
        };

        if (!err) {
            return res.status(200).json(todosRes[0].todoList);
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

app.post('/todo/', function(req, res) {

    var todos = {
        userName: req.body.user,
        todoName: req.body.todoName,
        todoStatus: false
    };

console.log(todos);

Todos.findOne({user: todos.userName},function(err, todoRes) {

    if(todoRes!=null){

      var len = todoRes.todoList.length;
      todoRes.todoList[len] =todos
      var response = todoRes;
      Todos.findOneAndUpdate({user: todos.userName}, {$set: {todoList: todoRes.todoList}},function(err, res1) {

        console.log(res1)
        if (err) {
            res.statusCode = 500;
            res.json({
                error: 'Server error'
            });
        }
      });

        if (!err) {
                  return res.status(200).json(response);
            } else {
                res.statusCode = 500;
                res.json({
                    error: 'Server error'
                });
            }
}else{
    return res.status(400).json("user Not found");
}
  });

});

app.put('/todo/', function(req, res) {

console.log(todos);

var todos = {
    userName: req.body.user,
    todoName: req.body.todoName,
    todoStatus: req.body.todoStatus
};


console.log(todos);

Todos.findOne({user: todos.userName},function(err, todoRes) {

  var currentTodoList = todoRes.todoList;

  var index =0;
  currentTodoList.forEach(function(todo){

      if(todo.todoName == todos.todoName){

          currentTodoList[index]={
            todoName: todos.todoName,
            todoStatus: todos.todoStatus
          }
      }
        index++;
  });
  console.log(currentTodoList);

  Todos.findOneAndUpdate({user: todos.userName}, {$set: {todoList: currentTodoList}},function(err, todoRes) {
    if(err){
      res.statusCode = 500;
      res.json({
          error: 'Server error'
      });
    }
  });

  if (!err) {
            return res.status(200).json(currentTodoList);
      } else {
          res.statusCode = 500;
          res.json({
              error: 'Server error'
          });
      }

});

});


app.delete('/todo/:id/:user', function(req, res) {


console.log(req.params.id);

Todos.findOne({user: req.params.user},function(err, todoRes) {

  var currentTodoList = todoRes.todoList;

  var index =0;
  currentTodoList.forEach(function(todo){

      if(todo._id == req.params.id){
        currentTodoList.splice(index, 1);
        return;
      }
        index++;
  });
  console.log(currentTodoList);

  Todos.findOneAndUpdate({user: req.params.user}, {$set: {todoList: currentTodoList}},function(err, todoRes) {
    if(err){
      res.statusCode = 500;
      res.json({
          error: 'Server error'
      });
    }
  });

  if (!err) {
            return res.status(200).json(currentTodoList);
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
