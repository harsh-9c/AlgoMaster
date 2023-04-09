require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');
const auth = require('./middleware/auth');

require('./db/conn');

const Register = require('./models/registers');

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, '../public');
const template_path = path.join(__dirname, '../templates/views');
const partials_path = path.join(__dirname, '../templates/partials');

app.use(express.json());
app.use(cookieParser());
// To prevent undefined results
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
// telling express application that our view engine is hbs by default
// view engine used for rendering web pages
app.set('view engine', 'hbs');
app.set('views', template_path);
hbs.registerPartials(partials_path);

var transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'menotify32@gmail.com',
    pass: 'llflpbpswsjyjqqb',
  },
});

// PAGES

app.get('/', (req, res) => {
  res.render('index');
});
app.get('/question', auth, (req, res) => {
  res.render('question');
});
app.get('/sheet', auth, (req, res) => {
  res.render('sheet');
});
app.get('/editorial', auth, (req, res) => {
  res.render('editorial');
});

app.get('/vector', (req, res) => {
  res.render('vector');
});

app.get('/binary_search', (req, res) => {
  res.render('binary_search');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/try', (req, res) => {
  res.render('try');
});

app.get('/compiler', (req, res) => {
  res.render('compiler');
});

// Logout

app.get('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(curEle => {
      return curEle.token != req.token;
    });
    res.clearCookie('jwt');
    console.log('Logout Successfully');
    await req.user.save();
    res.render('index');
  } catch (error) {
    res.status(500).send(error);
  }
});

//Registration

app.post('/register', async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    const firstname = req.body.firstname;
    const email = req.body.email;
    if (password === cpassword) {
      const registerEmployee = new Register({
        firstname: req.body.firstname,
        email: req.body.email,
        password: password,
        confirmpassword: cpassword,
      });

      const token = await registerEmployee.generateAuthToken();

      res.cookie('jwt', token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
      });

      var mailOptions = {
        from: 'menotify32@gmail.com',
        to: email,
        subject: 'Welcome to AlgoMaster!',
        text: `AlgoMaster is a competitve programming content site. It contains well written and quality code which will help you to upskill your learning. Best Regards AlgoMaster Team.`,
      };

      transport.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent' + info.response);
        }
      });

      const registered = await registerEmployee.save();
      res.status(201).render('login');
    } else {
      res.send('passwords are not matching!');
    }
  } catch (error) {
    res.status(400).send('Please input correct details!');
  }
});

// Login Check

app.post('/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const useremail = await Register.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, useremail.password);

    const token = await useremail.generateAuthToken();
    // console.log(token);

    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      // secure: true,
    });

    if (isMatch) {
      res.status(201).render('try');
    } else {
      res.send('Invalid login details!');
    }
  } catch (error) {
    res.status(400).send('Invalid login details!');
  }
});

app.listen(port, () => {
  console.log(`Server is running at port no ${port}`);
});
