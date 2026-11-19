# The Why Spaces · Data Structures Series · Ep. 7: Graph

Final: `ds-ep7-graph.mp4` (1080x1920, 30 fps, about 1:38 of content plus The Why Spaces credit)

This is the seventh episode of the DS series. It explains the Graph with the metro-map analogy. It has four 3D shots with keyframed camera moves, cinematic SFX, and the locked Kabir voice. The 3D project is in `../ds-ep7-3d`.

## What it teaches
- **Hook:** in a tree every node has one parent, but in the real world things connect from every side.
- **Metro map:** every station connects to several others. Stations are vertices, and the lines joining them are edges.
- **No root:** a graph has no root, and there can be many paths between two places.
- **Kinds of graph:**
  - directed: Instagram follow is one-way;
  - undirected: Facebook friendship goes both ways;
  - weighted: each edge carries a distance or a time.
- **Storage:** an adjacency list, where each station keeps a list of its neighbours.
- **Search:**
  - BFS: neighbours first, then neighbours of neighbours, like ripples in water;
  - DFS: go to the end of one path, then come back and try another, like a bhool-bhulaiya (maze);
  - shortest path: Google Maps adds up the edge weights and picks the smallest total.
- **Use:** Instagram friend suggestions come from friends of friends.
- **Recap:** BFS and DFS are O(V+E). Next: Ep. 08, Hash Table (locker room).

## 3D shots (Remotion + R3F, keyframed camera paths via `camPath`)
All four shots use one graph lying on the floor: stations A–G and 9 edges with weights 2–6.
1. **Hook:** Ep. 6's vertical tree falls flat onto the floor, its tree edges fade, and the cross links draw in to make a graph.
2. **Metro (continuous across three scenes):** stations pop up and the orange and blue lines draw in.
   - Station C is labelled VERTEX, and C–D is labelled EDGE.
   - Two orbs take different routes from A to F: A-B-D-F in gold and A-G-E-F in blue.
3. **Types:**
   - arrowheads with orbs flowing one way (FOLLOW: A → B);
   - two-way blue heads (DOSTI: A ↔ B);
   - weight labels on every edge.
4. **Search (continuous across four scenes):**
   - BFS ripples spread from A, and stations light up level by level (L1 B, C, G; L2 D, E; L3 F);
   - a DFS orb runs A → B → D → C → E → G, turns red for "WAPAS ↩", then goes to F;
   - the shortest path A-C-D-F glows gold, labelled "2 + 3 + 2 = 7".

## 2D scenes
- the title card with the A–G graph;
- the adjacency list (rows highlight with their neighbours on the graph);
- friend suggestions (AAP → friends → dashed "SUGGESTED" friends of friends);
- the recap table;
- the Ep. 08 Hash Table teaser (lockers);
- the comment prompt.

## Narration
- Locked voice: Sarvam `bulbul:v3`, kabir, pace 1.2, default temperature, **no audio processing**. The scene gap is 0.75 s.
- Devanagari for the terms: ग्राफ़, वर्टेक्स, एज, डायरेक्टेड, अनडायरेक्टेड, वेटेड, एडजेसेंसी लिस्ट, बीएफ़एस, डीएफ़एस, हैश टेबल.
- Take selection with `saarika:v2.5`: in "Computer ग्राफ़ को…", ग्राफ़ came out as "बाफ", so it was made a required keyword. Then every clip was compared word by word against the script.

## Mix
The voice is in front. SFX:
- station pops and a metro chime;
- whooshes for the two routes;
- ticks for the adjacency rows;
- BFS pings that rise per level;
- DFS hop pops, with a glitch on the backtrack;
- clunks for the weights, with a ding and impact landing after the shortest-path line.

The SFX bus is sidechain-ducked, and the transition whoosh/thump finishes before each scene's first word.

## Rebuild
Same as `../ds-ep6`, using this folder's `src/` and `../ds-ep7-3d`, with output to `../ds-ep7/ds-ep7-graph.mp4`. Run at most 3 Remotion renders in parallel.
