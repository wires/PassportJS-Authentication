// these are the functions you need to implement

function isValidUserPassword (username, password, callback) {
  console.log('>>> IS VALID USER PASSWORD >>>', username, password)
  if (username === password) {
    callback(null, true)
  } else {
    callback(null, false)
  }
}

function findUser (id, callback) {
  console.log('>>> FIND USER >>>', id)
  callback(null, {user: {id: id}})
}

function findOrCreateOAuthUser (profile, callback) {
  console.log('>>> FIND OR CREATE USER >>>', profile)
  callback(null, {user: {profile: profile, id: (profile.id || 123)}})
}

function signup (email, password, done) {
  console.log('>>> SIGN UP >>>', email, password)
  done(null, {user: {id: 123}})
}

module.exports = {
  isValidUserPassword: isValidUserPassword,
  findUser: findUser,
  findOrCreateOAuthUser: findOrCreateOAuthUser,
  signup: signup
}
