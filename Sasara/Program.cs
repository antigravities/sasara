using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SteamKit2;
using System.IO;
using static SteamKit2.SteamClient;
using static SteamKit2.SteamUser;
using System.Threading;
using Newtonsoft.Json;
using System.Xml;
using System.ServiceModel.Syndication;
using static SteamKit2.SteamFriends;
using static SteamKit2.SteamFriends.FriendsListCallback;
using HtmlAgilityPack;
using System.Net;

namespace Sasara {
    enum SASARA_MODE {
        PROFILECOMMENT,
        FORUMCOMMENT,
        CHATMESSAGE
    }

    public class SasaraUser {
        public ulong steamID64;
        public string barterID;
        public bool notify;
        public long lastOffer;
        public bool firstTime;
    }

    class Sasara {

        private SteamClient client;
        private CallbackManager callbacks;
        private SteamUser user;
        private SteamFriends friends;

        private string accountName;
        private string password;
        private string authCode;
        private string twofactor;

        //private string[] cute = { "3622a65.png", "bbbcf9d.png", "6eaaefc.png", "f816cc5.png", "5377522.png", "051dcc6.png", "e073810.png", "86a30be.png", "971f6b2.png" };

        private Thread updateThread;

        private bool running;

        private List<SasaraUser> database = new List<SasaraUser>();

        public Sasara(string u, string p, string a, string two) {

            accountName = u;
            password = p;
            authCode = a;
            twofactor = two;

            client = new SteamClient();
            callbacks = new CallbackManager(client);

            user = client.GetHandler<SteamUser>();
            friends = client.GetHandler<SteamFriends>();

            callbacks.Subscribe<ConnectedCallback>(OnConnected);
            callbacks.Subscribe<DisconnectedCallback>(OnDisconnected);

            callbacks.Subscribe<LoggedOnCallback>(OnLoggedOn);
            callbacks.Subscribe<LoggedOffCallback>(OnLoggedOff);

            callbacks.Subscribe<AccountInfoCallback>(OnAccountInfo);
            callbacks.Subscribe<FriendsListCallback>(OnFriendsList);
            callbacks.Subscribe<FriendMsgCallback>(OnMessage);

            running = true;

            client.Connect();
            
            while (running) callbacks.RunWaitCallbacks(TimeSpan.FromSeconds(1));

            Environment.Exit(0);

        }

        private void OnConnected(ConnectedCallback callback) {

            byte[] sentryHash = null;

            if( File.Exists("sentry-" + accountName + ".bin")) {
                sentryHash = CryptoHelper.SHAHash(File.ReadAllBytes("sentry-" + accountName + ".bin"));
            }

            user.LogOn(new LogOnDetails {
                Username = accountName,
                Password = password,
                AuthCode = authCode,
                TwoFactorCode = twofactor,
                SentryFileHash = sentryHash
            });
        }

        private void OnDisconnected(DisconnectedCallback callback) {
            Console.WriteLine("Disconnected from Steam. Reconnecting in 3 seconds.");
            Thread.Sleep(3000);
            client.Connect();
        }

        private void OnLoggedOn(LoggedOnCallback callback) {
            if( callback.Result == EResult.AccountLogonDenied || callback.Result == EResult.AccountLoginDeniedNeedTwoFactor) {
                Console.WriteLine("Account login was denied. Please specify a two-factor e-mail or mobile code with -a or -t respectively when next logging on.");
                running = false;
                return;
            }
            else if( callback.Result != EResult.OK ) {
                Console.WriteLine("Something went wrong when connecting.");
                Console.WriteLine(callback.ExtendedResult);
                running = false;
                return;
            }

            if (File.Exists("sasara.db")) database = JsonConvert.DeserializeObject<List<SasaraUser>>(File.ReadAllText("sasara.db"));

            updateThread = new Thread(new ThreadStart(RSSUpdateThread));
            updateThread.Start();
        }

        private void RSSUpdateThread() {

            Console.WriteLine("Polling");

            foreach(SasaraUser user in database) {
                XmlReader xmlreader = XmlReader.Create("https://barter.vg/u/" + user.barterID + "/o/rss/");
                SyndicationFeed rss = SyndicationFeed.Load(xmlreader);
                xmlreader.Close();
                xmlreader.Dispose();

                SyndicationItem[] offers = rss.Items.ToArray();

                for(int i = offers.Length-1; i>=0; i--) {
                    long offerid = long.Parse(offers[i].Links[0].Uri.ToString().Split('/')[6]);
                    if( offerid > user.lastOffer) {
                        user.lastOffer = offerid;
                        if( ! user.firstTime && user.notify ) NotifyUser(new SteamID(user.steamID64), offers[i]);
                    }
                }
                user.firstTime = false;
            }

            File.WriteAllText("sasara.db", JsonConvert.SerializeObject(database));

            Thread.Sleep(TimeSpan.FromMinutes(3));

            RSSUpdateThread();
        }

        private void NotifyUser(SteamID u, SyndicationItem offer) {
            friends.SendChatMessage(u, EChatEntryType.ChatMsg, offer.Title.Text.ToString() + " (" + offer.Summary.Text + "): " + offer.Links[0].Uri.ToString());
        }

        private void OnLoggedOff(LoggedOffCallback callback) {
            
        }

        private void OnAccountInfo(AccountInfoCallback callback) {
            friends.SetPersonaState(EPersonaState.Online);
        }

        private void OnFriendsList(FriendsListCallback callback) {
            foreach(Friend friend in callback.FriendList) {
                if(friend.Relationship == EFriendRelationship.RequestRecipient) {
                    friends.AddFriend(friend.SteamID);

                    Thread.Sleep(5000);

                    friends.SendChatMessage(friend.SteamID, EChatEntryType.ChatMsg, "Hello! I'm Sasara. Pleased to meet you! I'll notify you about new trades you get on Barter.vg through Steam chat messages. Please wait while I link up your Steam and Barter profiles...");

                    string barterID = LinkBarterAccount(friend.SteamID);
                    if(barterID == null) {
                        friends.SendChatMessage(friend.SteamID, EChatEntryType.ChatMsg, "Oops! It seems you don't already have a Barter account. Please create one and add me again! Until next time...");
                        Thread.Sleep(2000);
                        friends.RemoveFriend(friend.SteamID);
                        return;
                    }

                    Console.WriteLine("Linking " + friend.SteamID + " and " + barterID);

                    database.Add(new SasaraUser {
                        steamID64 = friend.SteamID.ConvertToUInt64(),
                        barterID = barterID,
                        notify = true,
                        lastOffer = 0,
                        firstTime = true
                    });

                    File.WriteAllText("sasara.db", JsonConvert.SerializeObject(database));

                    friends.SendChatMessage(friend.SteamID, EChatEntryType.ChatMsg, "Yay! I've successfully linked you up with barter user ID " + barterID + ", so you'll receive chat messages whenever you get an offer. To temporarily stop messages, simply type 'stop', and to start them back up again, type 'start'. Easy! If you have any other questions, please talk to Alex here: https://steamcommunity.com/id/antigravities . Have fun, and good luck on your trades!");
                }
            }
        }

        private void OnMessage(FriendMsgCallback callback) {

            if (callback.Message.Equals("")) return;

            if (callback.Message.Contains("cute")) {
                friends.SendChatMessage(callback.Sender, EChatEntryType.ChatMsg, "C-cute? Y-you think I'm cute? ♥");
                return;
            }

            if( callback.Message.Equals("stop")) {
                foreach(SasaraUser user in database) {
                    if( user.steamID64 == callback.Sender.ConvertToUInt64()) {
                        friends.SendChatMessage(callback.Sender, EChatEntryType.ChatMsg, "Okay! I'll stop bothering you for now. If you'd like to start receiving messages again, let me know by typing 'start'.");
                        user.notify = false;
                        File.WriteAllText("sasara.db", JsonConvert.SerializeObject(database));
                        return;
                    }
                }
            } else if (callback.Message.Equals("start")) {
                foreach (SasaraUser user in database) {
                    if (user.steamID64 == callback.Sender.ConvertToUInt64()) {
                        friends.SendChatMessage(callback.Sender, EChatEntryType.ChatMsg, "I'm going to notify you about offers again now - if you'd like to stop receiving messages again, let me know by typing 'stop'.");
                        user.notify = true;
                        File.WriteAllText("sasara.db", JsonConvert.SerializeObject(database));
                        return;
                    }
                }
            } else {
                friends.SendChatMessage(callback.Sender, EChatEntryType.ChatMsg, "What? I'm sorry, I don't quite understand what you said. If you'd like to stop receiving messages, type 'stop'. To start again, type 'start'.");
            }
        }
        
        private string LinkBarterAccount(SteamID steamid) {
            HtmlDocument doc = new HtmlDocument();
            doc.LoadHtml(new WebClient().DownloadString("https://barter.vg/u/"));
            foreach(HtmlNode x in doc.DocumentNode.Descendants("tr")) {
                if( x.ChildNodes[2].InnerText.Equals(steamid.ConvertToUInt64().ToString())) {
                    var id = x.ChildNodes[0].FirstChild.GetAttributeValue("href", "").Split('/')[4];
                    doc = null;
                    GC.Collect();
                    return id;
                }
            }
            return null;
        }

        static void PrintUsage() {
            Console.WriteLine("Sasara 0.1");
            Console.WriteLine("A chat bot that notifies you of new trades on Barter.");
            Console.WriteLine("");
            Console.WriteLine("Usage: sasara [-h|--help] [-u|--username] USERNAME [-p|--password] PASSWORD ([-a|--authcode] AUTHCODE) ([-t|--twofactor] TWOFACTORCODE)");
            Console.WriteLine("");
            Console.WriteLine("\t-u, --username : The account name of the user to log into.");
            Console.WriteLine("\t-p, --password : The password associated with the account name.");
            Console.WriteLine("\t-a, --authcode : This account's Steam Guard *e-mail* code. Only required if this is the first time logging in.");
            Console.WriteLine("\t-t, --twofactor: This account's Steam Guard *mobile* code. Only required if this is the first time logging in.");
            Console.WriteLine("\t-h, --help     : Print this help message and exit.");
        }

        static void Main(string[] args) {

            string username = "";
            string password = "";
            string authcode = null;
            string twofactor = null;

            for(int i=0; i<args.Length; i++) {
                if( args[i] == "-h" || args[i] == "--help") {
                    PrintUsage();
                    Environment.Exit(0);
                }
                else if ((args[i] == "-u" || args[i] == "--username") && args.Length >= i + 1) {
                    username = args[i + 1];
                }
                else if ((args[i] == "-p" || args[i] == "--password") && args.Length >= i + 1) {
                    password = args[i + 1];
                }
                else if ((args[i] == "-a" || args[i] == "--authcode") && args.Length >= i + 1) {
                    authcode = args[i + 1];
                }
                else if ((args[i] == "-t" || args[i] == "--twofactor") && args.Length >= i + 1) {
                    twofactor = args[i + 1];
                }
            }

            new Sasara(username, password, authcode, twofactor);
        }
    }
}
