#
#
REPORTER ?= list

all: jshint test
	@

jshint:
	@node_modules/.bin/jshint ./

test:
	@node_modules/.bin/mocha -R ${REPORTER}

test-cov: lib-cov
	@REDJS_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@./node_modules/jscoverage/jscoverage lib lib-cov

install-jscoverage:
	@git clone git://github.com/visionmedia/node-jscoverage.git node_modules/jscoverage
	@cd node_modules/jscoverage && ./configure && make

clean:
	@rm -rf node_modules/
	@rm -rf lib-cov/

.PHONY: jshint test
