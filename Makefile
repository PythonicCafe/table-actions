help:	## List all make commands
	@awk 'BEGIN {FS = ":.*##"; printf "\n  Please use `make <target>` where <target> is one of:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' $(MAKEFILE_LIST)
	@echo ' '

clean:	## Clear build files
	rm -rf dist/

up:     ## Up container to use
	docker compose up -d

stop:   ## Stop container
	docker stop table_actions_dev

watch:  ## Runs a lite-server with examples accessible in http://localhost:3000
	docker exec -it table_actions_dev sh -c "yarn run watch & yarn lite-server"

bundle: ## Make a bundle local instalable pakage '.tgz'
	docker exec  table_actions_dev sh -c "yarn run build; yarn pack"

eslint: ## Run eslint
	docker exec table_actions_dev sh -c "yarn run eslint"

prettier: ## Run prettier
	docker exec table_actions_dev sh -c "yarn run prettier"

interact: ## Get access to /bin/sh interactive mode
	docker exec -it table_actions_dev /bin/sh

test:	## Run tests scripts located in /tests
	docker exec table_actions_dev sh -c "yarn run build; yarn lite-server & yarn run test"

test-watch:	## Run tests and watch every update in all tests scripts of /tests
	docker exec -it table_actions_dev sh -c "yarn run build; yarn lite-server & yarn run test-watch"

release: clean bundle ## Make clean, bundle and make release with publish command
	yarn publish

