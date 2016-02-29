var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

var User = require('./users.js')

module.exports = function (passport, config) {
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
}
