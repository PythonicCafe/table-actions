help:	## List all make commands
	@awk 'BEGIN {FS = ":.*##"; printf "\n  Please use `make <target>` where <target> is one of:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' $(MAKEFILE_LIST)
	@echo ' '

clean:	## Clear build files
	rm -rf dist/

watch:	## Runs a lite-server with examples accessible in http://localhost:3000
	docker compose -f docker-compose.yml -f docker/watch.yml up

bundle: ## Make a bundle local instalable pakage '.tgz'
	docker compose -f docker-compose.yml -f docker/build.yml up
	yarn pack

eslint: ## Run eslint
	docker compose -f docker-compose.yml -f docker/eslint.yml up

prettier: ## Run prettier
	docker compose -f docker-compose.yml -f docker/prettier.yml up

interact: ## Get access to /bin/sh interactive mode 
	docker compose -f docker-compose.yml -f docker/interactive.yml up -d
	docker exec -it ta_dev /bin/sh
	docker stop ta_dev

test:	## Run tests scripts located in /tests
	docker compose -f docker-compose.yml -f docker/test.yml up

test-watch:	## Run tests and watch every update in all tests scripts of /tests
	docker compose -f docker-compose.yml -f docker/test-watch.yml up

release: clean bundle ## Make clean, bundle and make release with publish command
	yarn publish

