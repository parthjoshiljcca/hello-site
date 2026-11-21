#!/bin/sh
# scenes.js = parts concatenated; index.html = head.html + scenes.js
cd "$(dirname "$0")" && cat parts/base.part parts/aprims.part parts/dsprims.part parts/ep8.part parts/prims.part parts/dom.part > scenes.js && { cat head.html; cat scenes.js; printf '\n</script></body></html>\n'; } > index.html
