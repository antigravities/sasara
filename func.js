module.exports = {};

module.exports.offerSideToText = function(offer, side, current){
  var retn = "";
  if( offer.items.hasOwnProperty(side) ){
    var items = offer.items[side];

    var itmtxts = [];
    Object.keys(items).forEach(function(v){
      var topush = entities.decode(items[v].title);

      if( ! current.hasOwnProperty("metadata") || current.metadata == true ) topush += " (" + items[v].user_reviews_positive + "% " + items[v].tradeable + "⇄ " + items[v].wishlist + "★ " + items[v].cards + "🃏)";

      itmtxts.push(topush);
    });
    retn+=itmtxts.join("; ");
  } else {
    retn+="(no items) for ";
  }
  return retn;
}

module.exports.offerToText = function(offer, current, oid){

  var retn = entities.decode(offer.from_username) + " https://barter.vg/u/" + offer.from_user_id + " proposed an offer: ";

  if( offer.from_and_or === null || offer.from_and_or == 0 ) retn+="all";
  else retn+=offer.from_and_or;
  retn+=" of their ";
  retn+=module.exports.offerSideToText(offer, "from", current);
  retn+=" for ";

  if( offer.to_and_or === null || offer.to_and_or == 0 ) retn+="all";
  else retn+=offer.to_and_or;
  retn+=" of your ";
  retn+=module.exports.offerSideToText(offer, "to", current);

  retn+=". Respond to this offer at https://barter.vg/u/" + current.barterID + "/o/" + oid + "/";

  return retn;
}

module.exports.doProfileLink = function(steamid, callback){
  request("https://barter.vg/u/json/", function(e,r,b){
    if( e ) return callback("ERROR");

    b = JSON.parse(b);

    var i = null;

    Object.keys(b).every(function(v, k){
      if( b[v].steam_id == steamid.toString() ){
        i=v;
        console.log("Linking " + i + " and " + steamid.toString());
        return false;
      }
      return true;
    });

    callback(i);

  });
}

module.exports.getPollTime = function(){
  if( ! fs.existsSync("poll.time") ) return 0;
  else return parseInt(fs.readFileSync("poll.time").toString());
}

module.exports.getDatabaseEntry = function(barterID){
  var barter = null;
  Object.keys(database).every(function(v,k){
    if( database[v].barterID == barterID ){
      barter = database[v];
      return false;
    } else return true;
  });

  return barter;
}

module.exports.commit = function(){
  fs.writeFileSync("sasara.db", JSON.stringify(database));
}
