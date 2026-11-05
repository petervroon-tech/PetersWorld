.PHONY: all build serve test hooks clean

all: build

# Bouw de WebAssembly binary en update versie
build:
	python3 build.py

# Start een lokale ontwikkelserver
serve: build
	@echo "🌍 PetersWorld draait op: http://localhost:8080"
	python3 -m http.server 8080

# Voer lokale tests uit (WASM validatie & optionele C runner)
test: build
	@echo "🧪 WebAssembly verificatie..."
	python3 build.py
	@if command -v clang >/dev/null 2>&1; then \
		echo "🧪 C Runner compilatietest..."; \
		clang -O2 src/petersworld.c -o /tmp/petersworld-test-cli && /tmp/petersworld-test-cli && rm /tmp/petersworld-test-cli; \
	fi

# Activeer automatische Git Push hooks
hooks:
	./setup-hooks.sh

clean:
	rm -f petersworld-c-cli
