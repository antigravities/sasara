/*
://///+++//////::::///:/:/-......-:///::::::::::::::///-......................-:
:++++/::::///:/+//+s//:///+- .-::/:::::::::::::::::::::://:-.`                 :
:///////++/:+++///++:::o:/:o/:::::::::::::::::::::::::::::://///:.             :
://///++//++//::::::::++:/:/:::::////+++/+///:::::::::::::::::::::/:.          :
:/+o++o+oo////++///o/os///--//+++///::/++/:::::::::::::::::::::/:::::/:`       :
:o-.-++s+////o+///o+os+++/++//:::::://::::::::::::::::::::::::://::::::/:.     :
::/:o+yo////s+//+oo+sos+/::::::::://::::::::::::::::::::::::::::/+::::::::/.   :
/---oyysooooy+++++ooo+::::-:::::/:::::::::::::::::::::::::::::::://::::::::/:  :
/`.:/++///++////+s+o///::::::://:::::::::::::::::::::::::::::::::+//:::/:::::/-:
///+++//++//++///o++/////:::/+--:::::::::://::::::://::::::::::::/+/::://:::/:/:
::-:+/+++//++////os+++////://:///::--:////::::://+/::::::/:::/:::/o//:::/:-:/:-:
:`-/:::::/+/////+o++++++++++//://////:--:////++/::::::::/:::/::::/oo//:-/:--/+//
:-/:/:/:/+/:///+oo+///++++oooo++++++++++++/::-:::::::::/::--/:---/oso//--/--/+/:
:///://++/:////+oo+/////+/::://///////::::::::://::::/+/::-/::-::/o:y+/::+::///:
//:///++/::////o+oo////++/::::::::::+:::::::::/+/:::/o/::::/:::/:/+:/y+/:/::///:
::/:/++/:::////s/+o////+/+:::/::::://::::::::/:/:::/+/:::::::::/:++-.so+//::+//:
//:/++::::////os/+o+//+/+/:::/:::::+/::::-://:/:-:/:/:::--:---//:++..-h++/::+//:
::/++:::::///+yo/+o+/+//+/::::::::+/::/::://-//-//-/:-:-::---:///+/``.y++/::+//:
:/++:::::////sos/+o+++:/+/::/::::/+/:/+/++//++++::/:-:::-:---///oo:...+o+/:/+/+:
:++/--:::///o+/s//o++/:++/::/::::+/+/////-:+//-.:/::::-.::--:+/+/:````-so///+/o:
:o/::-::///oo.:s//+oo::o++::/::::+/////:.:+/:-:+/::--``::--://:/:`````.oo/+/o++:
://::::///oo/-:s+//o+:/o/+::/::://////::++++::...`````-:--://:/:--:-.`.os/+/o+/:
:/:::://++so`/-oo//o/:+o/+/:/:::/+/+oyhmmmddmhy+.````--:::::-//osddhy++oo++os//:
::::://+/soo`:.+s/+o/:+o/++://:-/+odysyyyys+/--/:````.-......+dhy+o:s+yy/+os+/::
::::///+++:+.`:-oo++/:+o/++///:-//:+o/hhyyyh+  `````````````:dyyy+`:-ys+/oso:-/:
://///+//-.+. -:/so+//++++/+//:-:/+.-./ooooo.```````````````/dsos+..+ss/s+o//-/:
:/+///+//--+. `:::y+////o/+++//--//:.```--```````````````````::/-``.hsoo/o++`oo:
:/+///+//:/+`  `-::+////+++/++/:--//:``````````````````````````````+yo++oo+-++.:
:/+///+//+o/    .-://+///+++/++/:-://:``````````````````.``````````d++ooo//o/  :
:///:/+::+s+:.``.:://+//-//////+/:::/++:.`````````````````````````+s+///:/:-/` :
:+/+::o:::o/-:/..o:/://:-:///////://.::.`````````````````````````/s////:-+/--- :
::+++:+:::::/--+o--/:/-:-::////:::+yy/:.`````````.:-.``-```````.so/////--+:-:: :
:+/::/+s/:::-/-.+:.+::`/-::::/::::///so/:````````````````````.sy/::+//:.:/:.:: :
:` `.-/:o+::::/./+.:/:.---/::-/::://..:/syy+-``````````````:ss/::/+:::-:-/::+` :
:  `.+:/.-+///+-/s.-/:----/:/:-/:://..:-..-/shs/-``````./sy//:://+:/:/-.+///`  :
:: .o:/`-/::-o:-so`:-/+-.::/:/--/:///:-.......-/+ss+/++/:o//::::+/++:`:s+/.    :
:+``s/+/+/:+o+++./ `::-o/-+/::/--o/oo.............+:-`.+s++::/+oo+o+/+:.       :
:+.:yssoso+/:-```    -:-:-//+/://-/+s+............o/+oo+:.o://:.../-           :
: :-:/`````             ./.+--//:+oossso/---......+```  -.s:+   --+:           :
:-:::/--.................:::/:--/o::/+++++/-------+:....::///...::-/.-........-:

Sasara (ささら) notifies you about offers on Barter.vg.
Copyright (C) 2017 Alexandra Frock.
Licensed under the GPLv3 (or later). See the LICENSE file for information.
*/

var fs = require("fs");
var S = require("steam-user");
var request = require("request");
var cheerio = require("cheerio");
var feed = require("feed-read-parser");
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

var args = require("yargs")
  .usage("Usage: $0 [-a, --accountname] accountname [-p, --password] password (options...)")
  .describe("a", "The bot's account name")
  .alias("accountname", "a")
  .describe("p", "The bot's password")
  .alias("password", "p")
  .describe("d", "The database to read from/write to")
  .alias("database", "d")
  .default({ "d": "sasara.db" })
  .demandOption(["a", "p"])
  .argv;

var pollIntervalValue = 3;
var pollInterval = null;

var queue = [];
var spPollDone = true;
var queueInterval = null;

var shouldBePolling = false;

console.log("Loading database...");

database = {};
if( fs.existsSync("sasara.db") ){
  database=JSON.parse(fs.readFileSync("sasara.db"));
  if( database.constructor === Array ){
    console.log("Old >0.3.0 database found! Converting...");
    var newDB = {};
    database.forEach(function(v,k){
      newDB[v.steamID64] = v;
    });
    database = newDB;
    fs.writeFileSync("sasara.db", JSON.stringify(database));
    console.log("...done!");
  }
}

commit = function(){
  fs.writeFileSync("sasara.db", JSON.stringify(database));
}

var client = new S();

// todo: optimize code better, reuse
function offerToText(offer, current, oid){

  var retn = entities.decode(offer.from_username) + " https://barter.vg/u/" + offer.from_user_id + " proposed an offer to you: ";

  if( offer.from_and_or === null || offer.from_and_or == 0 ) retn+="all";
  else retn+=offer.from_and_or;

  retn+=" of their ";

  if( offer.items.hasOwnProperty("from") ){
    var itmtxts = [];
    Object.keys(offer.items.from).forEach(function(v){
      var topush = entities.decode(offer.items.from[v].title);

      if( ! current.hasOwnProperty("metadata") || current.metadata == true ) topush += " (" + offer.items.from[v].user_reviews_positive + "% " + offer.items.from[v].tradeable + "⇄ " + offer.items.from[v].wishlist + "★ " + offer.items.from[v].cards + "🃏)";

      itmtxts.push(topush);
    });
    retn+=itmtxts.join("; ") + " for ";
  } else {
    retn+="(no items) for ";
  }

  if( offer.to_and_or === null || offer.to_and_or == 0 ) retn+="all";
  else retn+=offer.to_and_or;

  retn+=" of your ";

  if( offer.items.hasOwnProperty("to") ){
    itmtxts = [];
    Object.keys(offer.items.to).forEach(function(v){
      var topush=entities.decode(offer.items.to[v].title);

      if( ! current.hasOwnProperty("metadata") || current.metadata == true ) topush += " (" + offer.items.to[v].user_reviews_positive + "% " + offer.items.to[v].tradeable + "⇄ " + offer.items.to[v].wishlist + "★ " + offer.items.to[v].cards + "🃏)";

      itmtxts.push(topush);
    });
    retn+=itmtxts.join("; ");
  } else {
    retn+="(no items)";
  }

  retn+=". Respond to this offer at https://barter.vg/u/" + current.barterID + "/o/" + oid + "/";

  return retn;
}

function doPoll(){

  console.log("Polling!");

  shouldBePolling = true;

  queue = Array.prototype.slice.call(Object.keys(database));

  queueInterval = setInterval(function(){
    if( queue.length == 0 ) clearInterval(queueInterval);
    if( ! spPollDone ) return;

    var current = database[queue.pop()];

    if( current == undefined ) return spPollDone = true;

    console.log("Polling https://barter.vg/u/" + current.barterID + " (" + client.users[current.steamID64].player_name + ", " + current.steamID64 + ")");

    feed("https://barter.vg/u/" + current.barterID + "/o/rss/", function(err, articles){

      // come back later
      if( err ){
        return spPollDone = true;
      }

      for( let i=articles.length-1; i>=0; i-- ){
        if( parseInt(articles[i].link.split("/")[6]) > current.lastOffer ){
          if( (! current.firstTime) && current.notify ){
            var oid = parseInt(articles[i].link.split("/")[6]);

            // The user we request for doesn't matter. We still get a valid and correct JSON response anyway
            // So we'll just use the admin's profile.

            console.log("`- Requesting more info about offer " + oid + " for user " + current.barterID);
            request("https://barter.vg/u/a0/o/" + oid + "/json", function(e,r,b){
              // Fall back to the "default"
              if( e ) return client.chatMessage(current.steamID64, articles[i].title + " (" + articles[i].content + ") " + articles[i].link);

              var b = JSON.parse(b);

              // The user probably already knows about offers they sent themselves and offers they've already opened
              if( b.from_user_id == current.barterID || b.to_opened == 1 ) return;

              // Now formulate a response
              client.chatMessage(current.steamID64, offerToText(b, current, oid));
            });
          }
          current.lastOffer = parseInt(articles[i].link.split("/")[6]);
        }
      }

      current.firstTime = false;

      fs.writeFileSync("sasara.db", JSON.stringify(database));

      spPollDone = true;
    });
  }, 500)
}

function doProfileLink(steamid, callback){
  request("https://barter.vg/u/", function(e,r,b){
    if( e ) return callback("ERROR");

    var $ = cheerio.load(b);
    var obj = $("tr:contains('" + steamid.toString() + "')");

    if( obj.length == 0 ) return callback(null);

    var id = obj[0].children[0].children[0].attribs.href.split("/")[4];

    console.log("Linking " + id + " and " + steamid.toString());
    callback(id);
  });
}

client.logOn({
  "accountName": args.a,
  "password": args.p
});

client.on("loggedOn", function(){
  console.log("Logged on to Steam.");

  client.setPersona(S.Steam.EPersonaState.Online);

  client.gamesPlayed("notifies you of Barter.vg trade offers");

  if( pollInterval !== null ){
    clearInterval(pollInterval);
  }

  doPoll();
  pollInterval = setInterval(doPoll, pollIntervalValue*60000);
});

client.on("friendRelationship", function(u,r){
  if( r != S.Steam.EFriendRelationship.RequestRecipient ) return;

  client.addFriend(u);
  client.chatMessage(u, "Hello! I'm Sasara. Pleased to meet you! I'll notify you of trades you get on Barter.vg through Steam chat messages. Please wait while I link up your Steam and Barter profiles...");
  doProfileLink(u, function(ret){
    if( ret === null ){
      client.chatMessage(u, "Oops! It seems you don't already have a Barter.vg account. Please create one here: https://barter.vg/login/?login and add me again! Until next time...");
      client.removeFriend(u);
      return;
    }

    if( ret === "ERROR" ){
      client.chatMessage(u, "Oops! It seems that Barter.vg is down right now. Please try again later! Until next time...");
      client.removeFriend(u);
      return;
    }

    database[u.toString] = {
      steamID64: u.toString(),
      barterID: ret,
      notify: true,
      lastOffer: 0,
      firstTime: true
    };

    fs.writeFileSync("sasara.db", JSON.stringify(database));

    client.chatMessage(u, "Yay! I've successfully linked you up with Barter user ID " + ret + ", so you'll receive chat messages whenever you get an offer, or when a person you've offered to accepts your offer. To temporarily stop messages, simply type 'stop', and to start them back up again, type 'start'. Easy! If you have any other questions, please talk to Alex here: https://steamcommunity.com/id/antigravities . Have fun, and good luck on your trades!")

    doPoll();
  });
});

var C = require("./commands.js");

client.on("friendMessage", function(u,m){
  // haHAA
  if( m.toLowerCase().indexOf("cute") > -1 ){
    client.chatMessage(u, "C-cute? You t-think I'm c-cute? ♥");
    return;
  }

  var a = m.trim().split(" ");
  a[0] = a[0].toLowerCase();

  var t = C.unknown;

  if( C.hasOwnProperty(a[0]) ){
    t=C[a[0]];
  }

  var r = t.callback(u, a, m);
  if( typeof r == "string" ) client.chatMessage(u, r);

});
