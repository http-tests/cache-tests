
PKGNAME=mnot/proxy-cache-tests


.PHONY: build
build:
	docker build -t $(PKGNAME) .

.PHONY: upload
upload:
	docker push $(PKGNAME)
