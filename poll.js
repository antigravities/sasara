module.exports = function(){

  var pollTime = func.getPollTime();

  if( pollTime <= 0 ){
    fs.writeFileSync("poll.time", Date.now());
    return;
  }

  request("https://barter.vg/o/json/" + parseInt(pollTime/1000), function(e,r,b){
      if( e ) return;

      b=JSON.parse(b);

      Object.keys(b).forEach(function(v){
        console.log("Discovered offer " + v + " (" + b[v].from_user_hex + " -> " + b[v].to_user_hex + ")");

        if( b[v].to_status != "pending" ){
          console.log("fixme: This is an accepted offer");
          return;
        }

        var user = func.getDatabaseEntry(b[v].to_user_hex, database);

        if( user != null && ( user.notify || ( user.emailNotify && user.hasOwnProperty("email") ) ) ){
          request("https://barter.vg/u/1a/o/" + v + "/json", function(e,r,b){
            if( e ) return;
            b=JSON.parse(b);
            if( b.opened === 1 ) return;
            console.log("Notifying " + user.steamID64 + "...");
            if( user.notify ) client.chatMessage(user.steamID64, func.offerToText(b, user, v));

            if( ! user.hasOwnProperty("emailnotify") || user.emailnotify ) email.offerMail(user.email, b.from_username, b.to_username, func.offerToText(b,user,v));
          });
        }
      });

      fs.writeFileSync("poll.time", Date.now());
  });
}
