HOMEDIR = $(shell pwd)

test:
	node tests/basictests.js

start:
	node responder.js

stop-docker-machine:
	docker-machine stop dev

start-docker-machine:
	docker-machine start dev

create-docker-machine:
	docker-machine create --driver virtualbox dev

stop-docker-machine:
	docker-machine stop dev

start-docker-machine:
	docker-machine start dev

# connect-to-docker-machine:
	# eval "$(docker-machine env dev)"

build-docker-image:
	docker build -t jkang/if-you-are-reading-this .

push-docker-image: build-docker-image
	docker push jkang/if-you-are-reading-this

run-docker-image:
	docker run -v $(HOMEDIR)/config:/usr/src/app/config \
    -v $(HOMEDIR)/data:/usr/src/app/data \
		jkang/if-you-are-reading-this

pushall: push-docker-image
	git push origin master
