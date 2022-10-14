all: watch

clean:
	rm -rf dist/

watch:
	docker compose up

bundle:
	docker compose -f docker-compose.yml -f build.yml up >/dev/null
	yarn pack

release: clean bundle
	yarn publish
