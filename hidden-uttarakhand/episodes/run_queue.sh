#!/bin/bash
# renders the given jobs one after another ("name" or "name:--v" for 9:16), marking each in logs/progress.log
cd "$(dirname "$0")"
for job in "$@"; do
  ep="${job%%:*}"; flag=""; [ "$job" != "$ep" ] && flag="${job#*:}"
  if node render.js "$ep" $flag > "logs/$ep$flag.log" 2>&1; then echo "DONE $job" >> logs/progress.log; else echo "FAIL $job" >> logs/progress.log; fi
done
