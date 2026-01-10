const express = require('express');
const app = express();
const port = 3000;
app.use(express.static("myGame/static"));

//body parser
const bodyParser = require('body-parser')

app.use(express.urlencoded
  ({
    extended:false
  }))

//create application/json parser
const jsonParser = bodyParser.json()

//POST /api/user gets JSON bodies
app.post('/api/user', jsonParser, function (req, res) 
{
  // create user in req.body
})


var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cmp5360"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("SELECT * FROM user", function (err, result, fields) 
  {
    if (err) throw err;
    console.log(result);
  });
});

app.get('/', (req, res) => 
  {
   res.send('Hello World!')
  })

app.get('/some', (req, res) => 
  {

    const string = '{"name":"John", "age":30, "city":"New York"}';
    const obj = JSON.parse(string);
    console.log(obj.name);

    res.send(obj.name)
  
  })

  app.get('/test', (req, res) => 
  {
    res.send('This is test page')
  })

  app.get( "/luis",  (req, res) => 
  {
    res.send('This is my game page')
  })

app.get('/index', (req, res) => 
  {
    res.sendFile(__dirname + "/index.html");
  })

app.get('/*', (req, res) => 
  {
    console.log(__dirname);
    res.status(404).sendFile(__dirname + "/404.html");
  })

app.listen(port, () => 
{
    console.log(`Example app listening at http://localhost:${port}`)
})
      
  app.post('/registerform', (req, res) => 
    {
      const { username, email, password, confirmpassword } = req.body;
    
      if (!username || !email || !password || !confirmpassword) 
      {
        console.log("All fields required");
        console.log("Register Failed");
        res.redirect("/Registerfailed.html");
      }
    
      if (password !== confirmpassword) 
      {
        console.log("ERROR: Passwords do not match!");
        console.log("Register Failed");
        res.redirect("/Registerfailed.html");
      }
    
      // insert into database
      const sql = "INSERT INTO user (username, email, password) VALUES (?, ?, ?)";
      con.query(sql, [username, email, password], (err, result) =>
      {
        if (err) 
        {
          console.log(err);
          console.log("ERROR: Username already exists or DB error");
          console.log("Register Failed");
          res.redirect("/Registerfailed.html");
        }
    
        console.log("User registered:", username);
        res.redirect("/Login.html");
      });
    });

    app.post('/loginform', (req, res) => 
      {
        const { username, password } = req.body;
      
        const sql = "SELECT * FROM user WHERE username = ? AND password = ?";
        con.query(sql, [username, password], (err, result) =>
        {
          if (err) 
          {
            console.log(err);
            return res.sendFile(__dirname + "/404.html");
          }
      
          if (result.length > 0) 
          {
            console.log("Login Validated");
            console.log("Logged in Username " + req.body.username);
            console.log("Logged in Password " + req.body.password);
  
            res.redirect("/Game.html");
          } 
          else 
          {
            res.redirect("/Loginfailed.html");
          }
        });
      });
