
PKGNAME=mnot/proxy-cache-tests


.PHONY: build
build:
	docker build --platform linux/amd64 --pull -t $(PKGNAME) .

.PHONY: upload
upload:
	docker push $(PKGNAME)
