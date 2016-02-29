var User = require('./users.js')

exports.isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/login')
  }
}

exports.userExist = function (req, res, next) {
  User.findUser(req.body.email, function (err, user) {
    if (err || (!user)) {
      next()
    } else {
      res.redirect('/signup')
    }
  })
}
