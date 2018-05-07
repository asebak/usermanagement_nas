const passport = require('passport');
const request = require('request');
const User = require('../models/User');
const Nas = require('nebulas');
const { Strategy: LocalStrategy } = require('passport-local');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((req, user, done) => {
  var isValid = Nas.Account.isValidAddress(user.addressId);
  if(isValid){
    done(null, user);
  }else{
    //todo put error here
  }
 /* User.findById(id, (err, user) => {
    done(err, user);
  });
  */
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'jsoncontents', passwordField: 'password' }, (json, password, done) => {
    var account = Nas.Account;
    var key = JSON.parse(json);
    try {
      var acc = account.fromAddress(key.address);
      acc = acc.fromKey(key, password);
     var id = acc.getAddressString();
     
     var Neb = Nas.Neb;
     var neb = new Neb();
     //todo put network in configuration
     neb.setRequest(new Nas.HttpRequest("https://testnet.nebulas.io"));
     neb.api.getAccountState(id)
     .then(function (resp) {
         if (resp.error) {
          return done(resp.error); 
         } else {
           var user = new User();
           user.addressId = id;
           user.balance = Nas.Unit.fromBasic(Nas.Utils.toBigNumber(resp.balance), "nas").toNumber();
           user.key = key;
           user.profile.picture = '/images/logo2.png'
           return done(null, user);
         }
     })
     .catch(function (e) {
      return done(e.message); 
     });


      //return done(null, acc);
    } catch (err) {
      return done(err); 
    }
}));


/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find(token => token.kind === provider);
  if (token) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
