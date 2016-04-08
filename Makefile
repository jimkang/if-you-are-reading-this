HOMEDIR = $(shell pwd)
SSHCMD = ssh $(SMUSER)@smidgeo-headporters
APPDIR = /var/apps/if-you-are-reading-this

run:
	node post-tweet-chain.js

# start:
# 	node responder.js

pushall: sync
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(SMUSER)@smidgeo-headporters:/var/apps/ --exclude node_modules/
	ssh $(SMUSER)@smidgeo-headporters "cd $(APPDIR) && npm install"
