#!/bin/bash
# renders the given episodes one after another, logging each and marking it done in logs/progress.log
cd "$(dirname "$0")"
for ep in "$@"; do
  if node render.js "$ep" > "logs/$ep.log" 2>&1; then echo "DONE $ep" >> logs/progress.log; else echo "FAIL $ep" >> logs/progress.log; fi
done
