up:
	docker compose -f tests/docker-compose.yml up -d

down:
	docker compose -f tests/docker-compose.yml down

test:
	docker compose -f tests/docker-compose.yml run --rm tests-runner

coverage:
	docker compose -f tests/docker-compose.yml run --rm tests-runner

coverage-report:
	@echo "XML: tests/reports/coverage.xml" && echo "HTML: tests/reports/coverage/"

report:
	cat tests/reports/summary.json || true

clean:
	rm -f tests/reports/summary.json || true
