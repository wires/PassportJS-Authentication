var express = require('express')

var http = require('http')
var path = require('path')
var passport = require('passport')
var flash = require('connect-flash')

var config = require('./config.js')

require('./config/passport')(passport, config)

var app = express()

var favicon = require('serve-favicon')
app.use(favicon('./favicon.ico'))

app.set('port', process.env.PORT || 3232)
app.set('views', __dirname + '/app/views')
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

require('./config/routes')(app, passport)

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
