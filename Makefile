#
#
REPORTER ?= list

all: jshint test
	@

jshint:
	@node_modules/.bin/jshint ./

test:
	@node_modules/.bin/mocha -R ${REPORTER}

.PHONY: jshint test
