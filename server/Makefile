.PHONY: test 

test:
	npm test

dev:
	nest start --watch --preserveWatchOutput

migrate:
	npx prisma generate
	npx prisma migrate dev
