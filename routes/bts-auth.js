var express = require('express');
var router = express.Router();
var randomstring = require('randomstring');
var bitsharesjs = require('bitsharesjs');
var bitsharesjsws = require('bitsharesjs-ws');

var conStatus = 'closed' ;
bitsharesjsws.Apis.setRpcConnectionStatusCallback(function(status){
  console.log('status:', status);
  conStatus = status;
})

function rawConnectChain(){

  return bitsharesjsws.Apis.instance("wss://bit.btsabc.org/ws", true).init_promise;
}

function connectChain(){
  if( conStatus == 'open'){
      return Promise.resolve(true);
  }
  return rawConnectChain();
}

router.get('/login', function (req, res, next) {
  res.render('loginWithBitshares')
})

var keyCache = {};

router.post('/provideAccount', function (req, res, next) {
  var account = req.body.account;

  connectChain().then( function(){
    bitsharesjsws.Apis.instance().db_api().exec("get_account_by_name", [account]).then( function (result) {

      if( !result){
        err = new Error('Sorry, your account is not exist');
        err.status = 400;
        return next(err);      
      }

      role_active = result.active;
      console.log(role_active);
      if( role_active.key_auths.length > 1){
        err2 = new Error('Sorry, your account is a multisig account, not supported!');
        err2.status = 400;
        return next(err2);
      }
      var now = new Date();
      var rand = randomstring.generate(8) + now.getTime();
      keyCache[rand] = {
        pubkey: role_active.key_auths[0][0],
        account: account
      }
      res.render('loginWithBitsharesStep2', { challenge: rand, account: req.body.account })

    })
  })
  .catch(function(err){
    err.status = 400;
    next(err);
  })
})


router.post('/verifyAccount', function(req, res, next) {

  var challenge = req.body.challenge;
  var account = req.body.account;
  var sign = bitsharesjs.Signature.fromHex(req.body.sign);
  var err;
  if(!keyCache[challenge] || keyCache[challenge].account != account){
    err = new Error('Sorry, wrong challenge or account, please check again');
    err.status = 400;
    return next(err);
  }

  bitsharesjsws.ChainConfig.setPrefix('BTS');
  var pubKey = bitsharesjs.PublicKey.fromStringOrThrow(keyCache[challenge].pubkey);
  if( sign.verifyBuffer(new Buffer(challenge, 'utf-8'), pubKey)  ){
    res.send('Yeah! you are proved to be ' + account + '@bitshares');
  }
  else{
    res.send('Sorry, you provide wrong signature, please check again');
  }
  delete keyCache[challenge];
})

module.exports = router;
