HOMEDIR = $(shell pwd)
SMUSER = noderunner
SERVER = sprigot-droplet
SSHCMD = ssh $(SMUSER)@$(SERVER)
APPDIR = /var/www/if-you-are-reading-this

run:
	node post-tweet-chain.js

pushall: sync
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(SMUSER)@$(SERVER):/var/www/ --exclude node_modules/
	ssh $(SMUSER)@$(SERVER) "cd $(APPDIR) && npm install"
