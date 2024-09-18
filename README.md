# Webinaire

<legend>
Book a webinaire with clean code.
<img src="https://github.com/KINFOO/webinaires/actions/workflows/tests.yml/badge.svg" alt="Build status"/>
</legend>

## Installation

```bash
$ nvm use
$ pnpm install
```

## Test

```bash
# Unit tests
$ pnpm run test

# Integration tests
$ pnpm run test:int
```

**Troubleshooting**: if your use `colima`, try setting `DOCKER_HOST` &
`TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE`:

```bash
$ export DOCKER_HOST=unix://${HOME}/.colima/default/docker.sock
$ export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
$ pnpm run test:int
```
