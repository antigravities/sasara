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

var database = [];
if( fs.existsSync("sasara.db") ) database=JSON.parse(fs.readFileSync("sasara.db"));

var client = new S();

function doPoll(){

  console.log("Polling!");

  shouldBePolling = true;

  queue = database.slice();

  queueInterval = setInterval(function(){
    if( queue.length == 0 ) clearInterval(queueInterval);
    if( ! spPollDone ) return;

    var current = queue.pop();

    if( current == undefined ) return spPollDone = true;

    console.log("Polling https://barter.vg/u/" + current.barterID + " (" + client.users[current.steamID64].player_name + ", " + current.steamID64 + ")");

    feed("https://barter.vg/u/" + current.barterID + "/o/rss/", function(err, articles){

      // come back later
      if( err ){
        return spPollDone = true;
      }

      for( let i=articles.length-1; i>0; i-- ){
        if( parseInt(articles[i].link.split("/")[6]) > current.lastOffer ){
          if( (! current.firstTime) && current.notify ) client.chatMessage(current.steamID64, articles[i].title + " (" + articles[i].content + ") " + articles[i].link);
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

    database.push({
      steamID64: u.toString(),
      barterID: ret,
      notify: true,
      lastOffer: 0,
      firstTime: true
    });

    fs.writeFileSync("sasara.db", JSON.stringify(database));

    client.chatMessage(u, "Yay! I've successfully linked you up with Barter user ID " + ret + ", so you'll receive chat messages whenever you get an offer, or when a person you've offered to accepts your offer. To temporarily stop messages, simply type 'stop', and to start them back up again, type 'start'. Easy! If you have any other questions, please talk to Alex here: https://steamcommunity.com/id/antigravities . Have fun, and good luck on your trades!")

    doPoll();
  });
});

client.on("friendMessage", function(u,m){
  if( m.toLowerCase() == "stop" ){
    database.forEach(function(v,k){
      if( v.steamID64 == u.toString() ){
        database[k].notify = false; //just to be safe. can't remember right now if v is a ref to the item in the array
        client.chatMessage(u, "Okay! I'll stop bothering you for now. If you'd like to start receiving messages again, let me know by typing 'start'.");
        fs.writeFileSync("sasara.db", JSON.stringify(database));
      }
    });
    return;
  }

  if( m.toLowerCase() == "start" ){
    database.forEach(function(v,k){
      if( v.steamID64 == u.toString() ){
        database[k].notify = true;
        client.chatMessage(u, "I'm going to notify you about offers again now! If you'd like to stop receiving messages, let me know by typing 'stop'.");
        fs.writeFileSync("sasara.db", JSON.stringify(database));
      }
    });
    return;
  }

  // haHAA
  if( m.toLowerCase().indexOf("cute") > -1 ){
    client.chatMessage(u, "C-cute? You t-think I'm c-cute? ♥");
    return;
  }

  client.chatMessage(u, "What? I'm sorry, I don't quite understand what you said. If you'd like to stop receiving messages, type 'stop'. To start again, type 'start'.");
});
