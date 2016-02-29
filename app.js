var express = require('express')

var http = require('http')
var path = require('path')
var flash = require('connect-flash')

var config = require('./config.js')
var User = require('./users.js')
var Auth = require('./authorization.js')

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findUser(id, function (err, user) {
    done(err, user)
  })
})

var localConf = {usernameField: 'email', passwordField: 'password'}
passport.use(new LocalStrategy(localConf, function (email, password, done) {
  User.isValidUserPassword(email, password, done)
}))

passport.use(new FacebookStrategy(config.facebook,
  function (accessToken, refreshToken, profile, done) {
    profile.authOrigin = 'facebook'
    User.findOrCreateOAuthUser(profile, function (err, user) {
      return done(err, user)
    })
  })
)

passport.use(new GoogleStrategy(config.google,
  function (accessToken, refreshToken, profile, done) {
    profile.authOrigin = 'google'
    User.findOrCreateOAuthUser(profile, function (err, user) {
      return done(err, user)
    })
  })
)

var app = express()

var favicon = require('serve-favicon')
app.use(favicon('./favicon.ico'))

app.set('port', process.env.PORT || config.port || 3232)
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'jade')

// logger — https://github.com/expressjs/morgan
var morgan = require('morgan')
app.use(morgan('combined'))

var cookieParser = require('cookie-parser')
app.use(cookieParser())

var bodyParser = require('body-parser')
app.use(bodyParser.json())

var session = require('express-session')
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))

app.use(passport.initialize())
app.use(passport.session())

// app.use(express.methodOverride())
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')))

// run in development mode only
var errorHandler = require('errorhandler')
app.use(errorHandler())

app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('500', { error: err })
})

app.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    res.render('home', {user: req.user})
  } else {
    res.render('home', {user: null})
  }
})

app.get('/login', function (req, res) {
  res.render('login')
})

app.post('/login'
  , passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
)

app.get('/signup', function (req, res) {
  res.render('signup')
})

app.post('/signup', Auth.userExist, function (req, res, next) {
  User.signup(req.body.email, req.body.password, function (err, user) {
    if (err) throw err
    req.login(user, function (err) {
      if (err) return next(err)
      return res.redirect('profile')
    })
  })
})

app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}))
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {failureRedirect: '/login'}),
  function (req, res) {
    res.render('profile', {user: req.user})
  }
)

app.get('/auth/google',
  passport.authenticate(
    'google',
    {
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    })
)

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/')
  })

app.get('/profile', Auth.isAuthenticated, function (req, res) {
  res.render('profile', {user: req.user})
})

app.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/login')
})

app.use(function (req, res, next) {
  res.status(404)
  if (req.accepts('html')) {
    res.render('404', { url: req.url })
    return
  }
  if (req.accepts('json')) {
    res.send({ error: 'Not found' })
    return
  }
  res.type('txt').send('Not found')
})

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})
