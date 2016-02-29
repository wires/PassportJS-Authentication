var express = require('express')
// var fs = require('fs')
var http = require('http')
var path = require('path')
var passport = require('passport')
var flash = require('connect-flash')

var env = process.env.NODE_ENV || 'development'
var config = require('./config/config')[env]

// var models_dir = __dirname + '/app/models'
// fs.readdirSync(models_dir).forEach(function (file) {
//   if (file[0] === '.') return
//   require(models_dir + '/' + file)
// })

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
app.use(bodyParser())

var session = require('express-session')
app.use(session({ secret: 'keyboard cat' }))

app.use(passport.initialize())
app.use(passport.session())

// app.use(express.methodOverride())
app.use(flash())
// app.use(app.router)
app.use(express.static(path.join(__dirname, 'public')))

// app.use(express.errorHandler())

app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('500', { error: err })
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

require('./config/routes')(app, passport)

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})
