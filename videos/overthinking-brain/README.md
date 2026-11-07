# Day 4 Overthinking: 3D brain replacing the two spheres

Takes the finished `public/overthinking.mp4` and covers the two orange wireframe spheres (the "brain") with a procedural 3D brain made with Remotion and React Three Fiber.

- **Tracking:** in each frame the spheres were found by the density of thin orange lines, which ignores the orbit ring, bubbles and captions. Each segment was smoothed into a per-frame path: centre, a running-max size envelope, the opening pop, the final zoom, and fades. The result is in `src/data/path.json`. Segments: A 0.2–6.8 s, B 17.2–26.0 s, C 36.2–38.4 s, D 56.1–63.4 s.
- **Brain** (`src/brainGeometry.ts`): an anatomical side view. The cerebrum hemispheres come from an SDF (frontal, parietal, occipital and temporal lobes, and a flat medial wall giving the longitudinal fissure), found by marching rays out from each centre. The Sylvian fissure and central sulcus are cut in as landmark grooves. Gyri come from domain-warped Perlin noise. Below sit the striped cerebellum and the brain stem.
- **Shader** (`src/Brain3D.tsx`): burnt-orange tissue with dark grooves (ambient occlusion from groove depth), lit folds, an orange rim, and brand-orange (#ff8a1f, linear) "thought" pulses travelling through the grooves. Bloom comes from `@react-three/postprocessing`. A transparent canvas sits over the original video.
- **Render:** only the segment frames are rendered, each with one warm-up frame (`--concurrency=1`, `--gl=swangle` without a GPU). They are spliced frame-exactly back into the original, and the audio is copied untouched.
