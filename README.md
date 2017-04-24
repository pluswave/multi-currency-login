Background
==============

User Authentication is a big issue for UE. Users are 

+ get tired of registering an account on every site.
+ feel better with OAuth, but still he doesn't controll his account.

This project provide another solution. With cryptocurrency, every account is controlled by the holder and can't be banned.
So if a site can authenticate user with the existing account of public blockchain, it provide a better UE.

How
=================

Take Alice@steem for Example. The authentication contains two steps. At step 1, the browser on behalf of user, send a claim to server: I am Alice@steem. server checks the blockchain, and find that there is an Account that is Alice, then replies an Challange to browser. At step 2, user calculate an signature with his posting wif and send the signature to server, then the server can verify the signature with the public key which comes from the Steem blockchain.

Please check [heroku deploy](https://multi-currency-login.herokuapp.com/) of this repo to get the live demo.

Contact
==================

feel free to send me a mail (pluswave@xiaofuxing.name) about your suggestions.

LICENSE
==============

MIT
