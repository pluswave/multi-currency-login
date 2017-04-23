var express = require('express');
var router = express.Router();
var randomstring = require('randomstring');
var steem = require('steem');
var bitsharesjs = require('bitsharesjs');
var bitsharesjsws = require('bitsharesjs-ws');

bitsharesjsws.ChainConfig.setPrefix('STM');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/loginWithSteem', function (req, res, next) {
  res.render('loginWithSteem')
})

var keyCache = {};

router.post('/provideSteemAccount', function (req, res, next) {
  var account = req.body.account;

  steem.api.getAccounts([account], function (err, result) {
    if (err) {
      // var err = new Error(err);
      return next(err);
    }
    if (result.length == 0) {
      var err2 = new Error('The Account you submit(' + account + ') is not found!');
      err2.status = 400;
      return next(err2);
    }

    role_posting = result[0].posting;
    console.log(role_posting);
    if( role_posting.key_auths.length > 1){
      err2 = new Error('Sorry, your account is a multisig account, not supported!');
      err2.status = 400;
      return next(err2);
    }
    var now = new Date();
    var rand = randomstring.generate(8) + now.getTime();
    keyCache[rand] = {
      pubkey: role_posting.key_auths[0][0],
      account: account
    }
    res.render('loginWithSteemStep2', { challenge: rand, account: req.body.account })

  })

})


router.post('/verifySteemAccount', function(req, res, next) {

  var challenge = req.body.challenge;
  var account = req.body.account;
  var sign = bitsharesjs.Signature.fromHex(req.body.sign);
  var err;
  if(!keyCache[challenge] || keyCache[challenge].account != account){
    err = new Error('Sorry, wrong challenge or account, please check again');
    err.status = 400;
    return next(err);
  }

  var pubKey = bitsharesjs.PublicKey.fromStringOrThrow(keyCache[challenge].pubkey);
  if( sign.verifyBuffer(new Buffer(challenge, 'utf-8'), pubKey)  ){
    res.send('Yeah! you are proved to be ' + account + '@steem');
  }
  else{
    res.send('Sorry, you provide wrong signature, please check again');
  }
  delete keyCache[challenge];
})

module.exports = router;
