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

fs = require("fs");
S = require("steam-user");
request = require("request");
entities = new (require('html-entities').AllHtmlEntities)();

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

func = require("./func.js");

var doPoll = require("./poll.js");

var pollIntervalValue = 0.5;
var pollInterval = null;

var queue = [];
var spPollDone = true;
var queueInterval = null;

var shouldBePolling = false;

SASARA = "://///+++//////::::///:/:/-......-:///::::::::::::::///-......................-:\n:++++/::::///:/+//+s//:///+- .-::/:::::::::::::::::::::://:-.\`                 :\n:///////++/:+++///++:::o:/:o/:::::::::::::::::::::::::::::://///:.             :\n://///++//++//::::::::++:/:/:::::////+++/+///:::::::::::::::::::::/:.          :\n:/+o++o+oo////++///o/os///--//+++///::/++/:::::::::::::::::::::/:::::/:\`       :\n:o-.-++s+////o+///o+os+++/++//:::::://::::::::::::::::::::::::://::::::/:.     :\n::/:o+yo////s+//+oo+sos+/::::::::://::::::::::::::::::::::::::::/+::::::::/.   :\n/---oyysooooy+++++ooo+::::-:::::/:::::::::::::::::::::::::::::::://::::::::/:  :\n/\`.:/++///++////+s+o///::::::://:::::::::::::::::::::::::::::::::+//:::/:::::/-:\n///+++//++//++///o++/////:::/+--:::::::::://::::::://::::::::::::/+/::://:::/:/:\n::-:+/+++//++////os+++////://:///::--:////::::://+/::::::/:::/:::/o//:::/:-:/:-:\n:\`-/:::::/+/////+o++++++++++//://////:--:////++/::::::::/:::/::::/oo//:-/:--/+//\n:-/:/:/:/+/:///+oo+///++++oooo++++++++++++/::-:::::::::/::--/:---/oso//--/--/+/:\n:///://++/:////+oo+/////+/::://///////::::::::://::::/+/::-/::-::/o:y+/::+::///:\n//:///++/::////o+oo////++/::::::::::+:::::::::/+/:::/o/::::/:::/:/+:/y+/:/::///:\n::/:/++/:::////s/+o////+/+:::/::::://::::::::/:/:::/+/:::::::::/:++-.so+//::+//:\n//:/++::::////os/+o+//+/+/:::/:::::+/::::-://:/:-:/:/:::--:---//:++..-h++/::+//:\n::/++:::::///+yo/+o+/+//+/::::::::+/::/::://-//-//-/:-:-::---:///+/\`\`.y++/::+//:\n:/++:::::////sos/+o+++:/+/::/::::/+/:/+/++//++++::/:-:::-:---///oo:...+o+/:/+/+:\n:++/--:::///o+/s//o++/:++/::/::::+/+/////-:+//-.:/::::-.::--:+/+/:\`\`\`\`-so///+/o:\n:o/::-::///oo.:s//+oo::o++::/::::+/////:.:+/:-:+/::--\`\`::--://:/:\`\`\`\`\`.oo/+/o++:\n://::::///oo/-:s+//o+:/o/+::/::://////::++++::...\`\`\`\`\`-:--://:/:--:-.\`.os/+/o+/:\n:/:::://++so\`/-oo//o/:+o/+/:/:::/+/+oyhmmmddmhy+.\`\`\`\`--:::::-//osddhy++oo++os//:\n::::://+/soo\`:.+s/+o/:+o/++://:-/+odysyyyys+/--/:\`\`\`\`.-......+dhy+o:s+yy/+os+/::\n::::///+++:+.\`:-oo++/:+o/++///:-//:+o/hhyyyh+  \`\`\`\`\`\`\`\`\`\`\`\`\`:dyyy+\`:-ys+/oso:-/:\n://///+//-.+. -:/so+//++++/+//:-:/+.-./ooooo.\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`/dsos+..+ss/s+o//-/:\n:/+///+//--+. \`:::y+////o/+++//--//:.\`\`\`--\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`::/-\`\`.hsoo/o++\`oo:\n:/+///+//:/+\`  \`-::+////+++/++/:--//:\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`+yo++oo+-++.:\n:/+///+//+o/    .-://+///+++/++/:-://:\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`.\`\`\`\`\`\`\`\`\`\`d++ooo//o/  :\n:///:/+::+s+:.\`\`.:://+//-//////+/:::/++:.\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`+s+///:/:-/\` :\n:+/+::o:::o/-:/..o:/://:-:///////://.::.\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`/s////:-+/--- :\n::+++:+:::::/--+o--/:/-:-::////:::+yy/:.\`\`\`\`\`\`\`\`\`.:-.\`\`-\`\`\`\`\`\`\`.so/////--+:-:: :\n:+/::/+s/:::-/-.+:.+::\`/-::::/::::///so/:\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`.sy/::+//:.:/:.:: :\n:\` \`.-/:o+::::/./+.:/:.---/::-/::://..:/syy+-\`\`\`\`\`\`\`\`\`\`\`\`\`\`:ss/::/+:::-:-/::+\` :\n:  \`.+:/.-+///+-/s.-/:----/:/:-/:://..:-..-/shs/-\`\`\`\`\`\`./sy//:://+:/:/-.+///\`  :\n:: .o:/\`-/::-o:-so\`:-/+-.::/:/--/:///:-.......-/+ss+/++/:o//::::+/++:\`:s+/.    :\n:+\`\`s/+/+/:+o+++./ \`::-o/-+/::/--o/oo.............+:-\`.+s++::/+oo+o+/+:.       :\n:+.:yssoso+/:-\`\`\`    -:-:-//+/://-/+s+............o/+oo+:.o://:.../-           :\n: :-:/\`\`\`\`\`             ./.+--//:+oossso/---......+\`\`\`  -.s:+   --+:           :\n:-:::/--.................:::/:--/o::/+++++/-------+:....::///...::-/.-........-:";

console.log(SASARA);

console.log("S               A               S              A               R               A");

database = {};

if( fs.existsSync("sasara.db") ){
  console.log("Verifying database");
  database=JSON.parse(fs.readFileSync("sasara.db"));

  // User.emailverify
  Object.keys(database).forEach(function(v){
    if( ! database[v].hasOwnProperty("emailverify") ){
      console.log("Warning: user " + v + " did not have required emailverify key, setting to default of true");
      database[v].emailverify = true;
    }
  });
} else {
  console.log("Writing fresh database")
}

fs.writeFileSync(args.d, JSON.stringify(database));

console.log("Done, verified and wrote " + Object.keys(database).length + " records");

client = new S();

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

  doPoll(database, client);
  pollInterval = setInterval(function(){ doPoll(database, client); }, pollIntervalValue*60000);
});

client.on("friendRelationship", function(u,r){
  if( r != S.Steam.EFriendRelationship.RequestRecipient ) return;

  client.addFriend(u);
  client.chatMessage(u, "Hello! I'm Sasara. Pleased to meet you! I'll notify you of trades you get on Barter.vg through Steam chat messages. Please wait while I link up your Steam and Barter profiles...");
  func.doProfileLink(u, function(ret){
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

    database[u.toString()] = {
      steamID64: u.toString(),
      barterID: ret,
      notify: true,
      emailnotify: true
    };

    fs.writeFileSync("sasara.db", JSON.stringify(database));

    client.chatMessage(u, "Yay! I've successfully linked you up with Barter user ID " + ret + ", so you'll receive chat messages whenever you get an offer, or when a person you've offered to accepts your offer. To temporarily stop messages, simply type 'stop', and to start them back up again, type 'start'. Easy! If you have any other questions, please talk to Alex here: https://steamcommunity.com/id/antigravities . Have fun, and good luck on your trades!")

    doPoll(database, client);
  });
});

commands = require("./commands.js");
C = commands.C;

email = require("./email-notify.js");

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
