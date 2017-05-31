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

        var user = func.getDatabaseEntry(b[v].to_user_hex, database);

        if( user != null && user.notify ){
          request("https://barter.vg/u/1a/o/" + v + "/json", function(e,r,b){
            if( e ) return;
            b=JSON.parse(b);
            console.log("Notifying " + user.steamID64 + "...");
            client.chatMessage(user.steamID64, func.offerToText(b, user, v));
          });
        }
      });

      fs.writeFileSync("poll.time", Date.now());
  });
}
