const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Nas = require('nebulas');
const fs = require('fs')
const randomBytesAsync = promisify(crypto.randomBytes);

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('keystore', 'Email is not valid').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();


  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }



  passport.authenticate('local', (err, user, info) => {
    if (err) { 
      //return next(err);
      req.flash('errors', { msg: err.message });
      return res.redirect('/login');
    }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      //return res.redirect('/login');
      if (err) { return next(err); }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) console.log('Error : Failed to destroy the session during logout.', err);
    req.user = null;
    res.redirect('/');
  });
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }
  var account = Nas.Account.NewAccount();
  var address = account.getAddressString();
  var keyStr = account.toKeyString(req.body.password);
  res.render('account/signup', { 
    address: address,
    key: keyStr
   });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

exports.postUpdateProfile = (req, res, next) => { 
    var updateProfileContract = "n1wkefRnGXPJHU9RCiHTMDct6Uo51DuQjVo";
    var neb = new Nas.Neb();
    neb.setRequest(new Nas.HttpRequest(process.env.NAS_NETWORK_ENDPOINT));

    var name = req.body.name || '';
    var location = req.body.location || '';
    var website = req.body.website || '';
    var picture = req.body.picture || '';
    


    var fromAddress = req.user.addressId;
    var toAddress = updateProfileContract;
    var balance = req.user.balance;
    var chainId = parseInt(process.env.NAS_NETWORK_CHAINID);
    var amount = "0"
    var gaslimit = "200000";
    var gasprice = "1000000";
    var nonce = req.user.nonce;

    var callArgs = "[\"" + name + "\", \"" + location + "\", \"" + website + "\", \"" + picture + "\"]";

    var contract = {function: "save", args: callArgs}

     var acc = Nas.Account.fromAddress(fromAddress);
     
     acc = acc.fromKey(req.user.key, "ahmad");

     var gTx = new Nas.Transaction(chainId, acc, toAddress, 
      Nas.Unit.nasToBasic(Nas.Utils.toBigNumber(amount)), parseInt(nonce), gasprice, gaslimit, contract);

     gTx.signTransaction();
     gTx && neb.api.sendRawTransaction(gTx.toProtoString())
     .then(function (resp) {
         req.flash('success', { msg: 'Profile information has been updated. TX: ' + resp.txhash });
         res.redirect('/account');
     }).catch(function (o) {
      req.flash('errors', { msg: 'Profile information could not be updated.' });
      res.redirect('/account');
     });
  };
