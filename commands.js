function Command(description, callback){
  this.description = description;
  this.callback = callback;
}

var C = {};

C.help = new Command("Show help with using Sasara.", function(f,a,m){
  var resp = "\nHi! I'm Sasara. I'll notify you of Barter.vg offers through Steam chat! You can tell me the following things to help make your experience using Sasara better:\n\n";

  Object.keys(C).forEach(function(v){
    resp+=v+": " + C[v].description + "\n";
  });

  resp+="\nIf you have any further questions, comments, or concerns, feel free to leave a comment on my profile or drop a reply in my thread here: http://steamcommunity.com/groups/bartervg/discussions/1/133261370014619410/ . Thanks and enjoy!";

  return resp;
});

C.status = new Command("Show your settings.", function(f,a,m){
  return "I am " + (database[f.toString()].notify ? "" : "not " ) + "sending you notifications. I am " + (database[f.toString()].metadata ? "" : "not " ) + "showing you item metadata. Type 'help' to see how to change these settings.";
});

C.stop = new Command("Tell Sasara to stop sending you notifications.", function(f,a,m){
  database[f.toString()].notify = false;
  func.commit();
  return "Okay! I'll stop bothering you for now. If you'd like to start receiving messages again, let me know by typing 'start'.";
});

C.start = new Command("Tell Sasara to start sending you notifications again.", function(f,a,m){
  database[f.toString()].notify = true;
  func.commit();
  return "I'm going to notify you about offers again now! If you'd like to stop receiving messages, let me know by typing 'stop'.";
});

C.togglemeta = new Command("Toggle the showing of certain extra data, such as game ratings, tradable, and wishlist counts.", function(f,a,m){
  if( ! database[f.toString()].hasOwnProperty("metadata") || database[f.toString()].metadata === true ) database[f.toString()].metadata = false;
  else database[f.toString()].metadata = true;

  func.commit();

  if( database[f.toString()].metadata ) return "Now showing metadata.";
  return "Not showing metadata.";
});

C.unknown = new Command("???", function(f,a,m){
  return "What? I'm sorry, I don't quite understand what you said. For help, type 'help'.";
});

module.exports = C;
