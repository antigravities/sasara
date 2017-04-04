# sasara
Sasara (ささら) notifies you of Barter.vg trade offers. This is the original C#/.NET version.

## Using Sasara
Sasara is built using VS2015. Build the project, and then run the executable:
```
Sasara
A chat bot that notifies you of new trades on Barter.

Usage: sasara [-h|--help] [-u|--username] USERNAME [-p|--password] PASSWORD ([a|--authcode] AUTHCODE) ([-t|--twofactor TWOFACTORCODE])
	-u, --username : The account name of the user to log into.
	-p, --password : The password associated with the account name.
	-a, --authcode : This account's Steam Guard *e-mail* code. Only required if this is the first time logging in.
	-t, --twofactor: This account's Steam Guard *mobile* code. Only required if this is the first time logging in.
	-h, --help     : Print this help message and exit.
```

## License
GNU GPL v3