const nodemailer = require("nodemailer");

var tper = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix'
});

var greetings = [ "Hey", "Konnichiwa", "Guten tag", "Hallo", "What's up", "Howdy", "Hi" ];

module.exports = {};

module.exports.verifyMail = function(email, verifyCode){
  if( JSON.parse(fs.readFileSync("email.blacklist")).includes(email) ) return;
  tper.sendMail({
    from: "Sasara <sasara@antigravities.net>",
    to: email,
    subject: "[Sasara] Please verify your email address",
    html: "<div style='font-family: \"Helvetica\";'>" + greetings[Math.floor(Math.random()*greetings.length)] + "! I just wanted to make sure you were the real owner of this email address. To finish registering, enter the following code:<br><h1 style='text-align: center;'>" + verifyCode + "</h1><br>If you didn't ask for this, simply ignore us or click the <b>never email me again</b> link below. Someone may have entered in the wrong email.<hr><b>Sasara</b> notifies you about new offers on <a href='https://barter.vg/'>Barter.vg</a>. <a href='https://sasarajs.antigravities.net/unsubscribe.php'>Never email me again!</a></div>",
    text: greetings[Math.floor(Math.random()*greetings.length)] + "! I just wanted to make sure you were the real owner of this email address. To finish registering, enter the following code:\n\n" + verifyCode + "\n\nIf you didn't ask for this, simply ignore us or click the \"never email me again\" link below. Someone may have entered in the wrong email.\n\n--\nSASARA notifies you about new offers on https://barter.vg/. Never email me again: https://sasarajs.antigravities.net/unsubscribe.php",
  }, (e,i) => {
    if( e ) console.log(e);
  });
}

module.exports.verify = {};

module.exports.offerMail = function(email, userFrom, userTo, offerText){
  if( JSON.parse(fs.readFileSync("email.blacklist")).includes(email) ) return;
  tper.sendMail({
    from: 'Sasara <sasara@antigravities.net>',
    to: email,
    subject: "[Sasara] New trade offer from " + userFrom,
    html: "<div style='font-family: \"Helvetica\";'>" + greetings[Math.floor(Math.random()*greetings.length)] + " " + userTo + ",<br><br><blockquote><i>" + offerText + "</i></blockquote><br><hr><b>Sasara</b> notifies you about new offers on <a href='https://barter.vg/'>Barter.vg</a>. <a href='https://sasarajs.antigravities.net/unsubscribe.php'>Never email me again!</a></div>",
    text: greetings[Math.floor(Math.random()*greetings.length)] + userTo + ",\n\n" + offerText + "\n\nSASARA notifies you about new offers on https://barter.vg/. Never email me again: https://sasarajs.antigravities.net/unsubscribe.php"
  }, (e,i) => {
    if( e ) console.log(e);
  });
}

var verify = {};

var lets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function pick(){
  return lets[Math.floor(Math.random()*lets.length)];
}

C.email = new commands.Command("Set an address for Sasara to send emails to.", function(f,a,m){
  if( a.length < 2 ) return "Please specify an email address.";

  if( verify.hasOwnProperty(f.toString()) ) return "Oops! You've requested verification too recently. Please wait 5 minutes before trying again.";

  if( ! /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(a[1]) ){
    return "That's not a valid email address.";
  }

  var code = pick() + pick() + pick() + pick() + pick();

  verify[f.toString()] = { code: code, mail: a[1] };
  module.exports.verifyMail(a[1], code);

  setTimeout(function(){
    delete verify[f.toString()];
  }, 300000);

  return "Thanks for registering! All you have to do now is enter the code I just sent to your email address after the word 'verify', like this: verify code . It expires in 5 minutes.";
});

C.verify = new commands.Command("Verify your email address.", function(f,a,m){
  if( a.length < 2 ) return "Please specify your verification code.";

  if( verify.hasOwnProperty(f.toString()) && verify[f.toString()].code == a[1] ){
    database[f.toString()].email = verify[f.toString()].mail;
    func.commit();
    return "Your email has been verified. Thank you!"
  } else {
    return "Sorry, that wasn't a valid code.";
  }
});

C.stopemail = new commands.Command("Stop Sasara from sending you emails.", function(f,a,m){
  database[f.toString()].emailnotify = false;
  func.commit();
  return "I won't send you any emails until you type 'startemail'.";
});

C.startemail = new commands.Command("Tell Sasara to send you emails again.", function(f,a,m){
  database[f.toString()].emailnotify = true;
  func.commit();
  return "I'll send you emails until you type 'stopemail'.";
});
