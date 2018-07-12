
.PHONY: server
server:
	node server.js
	
.PHONY: lint
lint:
	standard --fix server.js client.js utils.js templates.js tests/*.js
