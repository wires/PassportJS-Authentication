var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

function isValidUserPassword (username, password, callback) {
  if (username === password) {
    callback(null, true)
  } else {
    callback(null, false)
  }
}

function findUser (id, callback) {
  callback(null, {user: {id: id}})
}

function findOrCreateOAuthUser (profile, callback) {
  callback(null, {user: {profile: profile, id: (profile.id || 123)}})
}

module.exports = function (passport, config) {
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function (id, done) {
    findUser(id, function (err, user) {
      done(err, user)
    })
  })

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
    function (email, password, done) {
      isValidUserPassword(email, password, done)
    }))

  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL
  },
    function (accessToken, refreshToken, profile, done) {
      profile.authOrigin = 'facebook'
      findOrCreateOAuthUser(profile, function (err, user) {
        return done(err, user)
      })
    }))

  passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
    function (accessToken, refreshToken, profile, done) {
      profile.authOrigin = 'google'
      findOrCreateOAuthUser(profile, function (err, user) {
        return done(err, user)
      })
    }
  ))
}
