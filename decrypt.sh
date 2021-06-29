#!/usr/bin/env bash

set -ex

# for openssl 1.1+ we need to add -pbkdf2 to remove the
# warning but that option does not exist in openssl 1.0.x
# debug

export GPG_TTY=$(tty)

openssl enc -d -aes-256-cbc -pass pass:${GPG_ENCPHRASE} -in yavin-dev_pubring.gpg.enc -out yavin-dev_pubring.gpg
openssl enc -d -aes-256-cbc -pass pass:${GPG_ENCPHRASE} -in yavin-dev_secring.gpg.enc -out yavin-dev_secring.gpg
