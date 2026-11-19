# The Why Spaces · Data Structures Series · Ep. 6: Tree

Final: `ds-ep6-tree.mp4` (1080x1920, 30 fps, about 1:35 of content plus The Why Spaces credit)

This is the sixth episode of the DS series. It explains the Tree using the family-tree analogy, then the Binary Search Tree. It has four 3D shots with keyframed camera moves, cinematic SFX, and the locked Kabir voice. The 3D project is in `../ds-ep6-3d`.

## What it teaches
- **Hook:** not all data sits in a line (like a queue); some of it spreads out like the branches of a tree.
- **Family tree:** Dada ji at the top, Papa and Chacha below him, and you below Papa.
- **Terms:**
  - node: each box in the tree;
  - root: the top node;
  - parent and child: a node and the nodes directly below it;
  - leaf (patte): a node with nothing below it.
- **The path:** there is exactly one path from the root to any node.
- **Binary Search Tree:** each node has at most two children. Smaller values go left and bigger values go right.
- **Search for 40:** 40 < 50, so go left. 40 > 30, so go right. Found!
- **Speed:** every step drops half the tree, so search is O(log n). Even with 1 crore numbers, it takes about 24 steps.
- **The catch:** the tree has to stay balanced. If the numbers arrive already sorted, the tree becomes one long line and search drops back to O(n).
- **Uses:** folders inside folders on your phone, a website's HTML, and a company org chart.
- **Recap and next:** BST search and insert are O(log n), and an unbalanced tree is O(n). Next: Ep. 07, Graph (metro map).

## 3D shots (Remotion + R3F, keyframed camera paths via `camPath`)
1. **Hook:** Ep. 5's queue line lifts slot by slot into a 7-node binary tree, and the edges draw in.
2. **Family tree (continuous across five scenes):** DADA JI → PAPA, CHACHA → AAP, BHAI, BEHEN.
   - All nodes pulse on "node", and the root glows with a ROOT label.
   - Papa is labelled PARENT, and Aap and Bhai turn blue as CHILD.
   - The leaves turn blue on "leaf".
   - An orb travels DADA → PAPA → AAP while the edges on that path light up ("EK HI RAASTA").
3. **BST search (continuous across four scenes):** 50 / 30, 70 / 20, 40, 60, 80.
   - The left subtree tints blue (CHHOTE) and the right one orange (BADE).
   - A "40?" orb goes 50 → 30 → 40, and the discarded halves dim at each step.
   - 40 grows on "MIL GAYA!", followed by "7 NODES → SIRF 3 CHECK".
4. **Skew:** the balanced tree (root 40) turns red and collapses into a diagonal line 10 → 20 → … → 70 for sorted inserts. An orb hops down it, counting "7 / 7 CHECK".

## 2D scenes
- the title card;
- the BST title with 50 / 30 / 70;
- the 1 crore → 24 steps counter (each step halves the remaining numbers);
- the phone folder tree (PHONE / PHOTOS / TRIP);
- the HTML tag tree and the org chart;
- the recap table;
- the Ep. 07 Graph teaser (metro map);
- the comment prompt.

## Narration
- Locked voice: Sarvam `bulbul:v3`, kabir, pace 1.2, default temperature, **no audio processing**. The scene gap is 0.75 s.
- Devanagari for the terms: ट्री, नोड, रूट, पैरेंट, चाइल्ड, लीफ़, बाइनरी सर्च ट्री, ग्राफ़. Numbers are written in Hindi words (चालीस, पचास, तीस, चौबीस).
- Take selection with `saarika:v2.5`:
  - "किसी भी नोड" came out as "नोर" or "नोट", so "भी नोड" became a required keyword.
  - In the recap, "ट्री" came out as "थ्री" and a stray trailing "बिग" appeared, so both were banned.
- A word-by-word comparison of every clip against the script.

## Mix
The voice is in front. SFX:
- pops as nodes appear;
- whooshes and thuds for each search step, and a chime on "mil gaya";
- 24 fast ticks for the crore counter;
- clunks and descending beeps down the sorted line.

Braams and impacts land after "Big O of log n". The SFX bus is sidechain-ducked.

## Rebuild
Same as `../ds-ep5`, using this folder's `src/` and `../ds-ep6-3d`, with output to `../ds-ep6/ds-ep6-tree.mp4`. Run at most 3 Remotion renders in parallel.
