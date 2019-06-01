
TARGETS = nginx squid trafficserver apache


.PHONY: all
all: $(TARGETS)

.PHONY: $(TARGETS)
$(TARGETS):
	cd $@; docker build -t mnot/$@ .; docker push mnot/$@
