# sasara
Sasara (ささら) notifies you of Barter.vg trade offers. This is the newer, JavaScript-based version.

## Installing + running
```
npm install
node index.js -a username -p password
```

## Daemonize Sasara
```
npm i -g forever
forever start -l forever.log -o sasara.log index.js -a username -p password
```

## License
GNU GPL v3
