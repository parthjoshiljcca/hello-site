# Internet India: Remotion + React Three Fiber sample (6 s)

- `internet-globe-remotion-sample.mp4` is the first 6 s of "Internet India tak kaise pahuncha?", rebuilt in Remotion. The 3D parts are made with `@remotion/three` (React Three Fiber).
- `compare-html-vs-remotion.mp4` shows the same 6 s side by side: the HTML + three.js version (`../internet-india-kaise-pahuncha-sample`) on the left and Remotion on the right.

## What changed versus the HTML version
- **Real bloom** (`@react-three/postprocessing`): the cables, cable heads, pins and India's dots use colour values above 1.0, so only they glow.
- **Glow shader around the globe** (a custom Fresnel `ShaderMaterial`) replaces the 2D radial gradient.
- **3D satellite** made of lit metal meshes with glowing solar panels. It tumbles away on "nahi".
- **3D pins:** rings on the globe surface that pulse.
- **3D cable cut-away** in place of the flat SVG cross-section. The layers step out one after another: plastic sheath, 20 steel armour wires, copper, inner core, and 7 glowing glass fibres with light pulses. It's lit by a key light and an orange fill light. On the cut, the camera dives into Mumbai and the cable bursts out of the globe.
- Everything is driven by `useCurrentFrame()`, with no `useFrame` (the Remotion rule). Labels and the cross are DOM overlays that use the same camera math to follow the 3D positions (`src/anim.ts`).
- The locked layout (header, pill, auto-fit title, 3D captions, waveform bar, progress bar, grain, dust, vignette) is rebuilt as React components in `src/Chrome.tsx`.

## Run / render
```
npm i
npx remotion studio                  # live preview
npx remotion render InternetGlobe out/video.mp4 --gl=swangle --concurrency=1 --crf=21
```
- `--gl=swangle` is needed on machines without a GPU.
- Use `--concurrency=1`: the first frame each browser tab renders with WebGL comes out blank. Both 3D canvases stay mounted from frame 0 and the globe fades in, so frame 0 is the only cold frame.
- Audio (`public/mix-6s.wav`) is the first 6 s of the HTML sample's mix. Timing (`src/data/timing.json`) comes from that sample's `build.py`.
