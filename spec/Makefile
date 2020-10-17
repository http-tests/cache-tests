saxpath ?= "lib/saxon9.jar"
saxon ?= java -classpath $(saxpath) net.sf.saxon.Transform -l
themedir ?= ../../../httpwg-theme
saxparam ?= bootstrapJsUrl='/spec/node_modules/bootstrap/dist/js/bootstrap.min.js' \
					  bootstrapCssUrl='/spec/node_modules/bootstrap/dist/css/bootstrap.min.css' \
						jqueryJsUrl='/spec/node_modules/jquery/dist/jquery.min.js' \
						siteJsUrl='/spec/script.js' \
						siteCssUrl='/spec/style.css'
stylesheet := lib/rfcbootstrap.xslt

specs := cache
TARGETS := $(addsuffix .html,$(specs))

.PHONY: all clean

all: $(TARGETS)

clean:
	rm -f $(TARGETS)

%.cleanxml: %.xml
	$(saxon) $< lib/xreffer.xslt | $(saxon) - lib/clean-for-DTD.xslt > $@

%.html: %.cleanxml $(stylesheet)
	$(saxon) $< $(stylesheet) $(saxparam) pageUrl='https://httpwg.org/specs/$@' > $@
