#!/bin/bash
# starts the given jobs in order, never more than MAX renders at once; each job goes through run_queue.sh
cd "$(dirname "$0")"
MAX=${MAX:-3}
for job in "$@"; do
  while [ "$(pgrep -fc 'node render.js')" -ge "$MAX" ]; do sleep 20; done
  setsid nohup ./run_queue.sh "$job" > /dev/null 2>&1 < /dev/null &
  sleep 5
done
