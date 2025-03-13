#!/bin/bash

set -x

curl -X POST --header "Content-Type: application/json" -d @test.data.json localhost:3000/webhook -i
