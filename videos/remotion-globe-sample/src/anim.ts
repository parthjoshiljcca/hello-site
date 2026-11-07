import { Easing, interpolate } from "remotion";
import * as THREE from "three";
import timing from "./data/timing.json";

export const FPS = 30;
export const ev = timing.ev as Record<string, number>;
export const T1 = timing.scenes[1].start; // scene 2 starts (dive into the cable)

const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const ein = (x: number) => x * x * x;
export const back = (x: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** keyframe helper: piecewise eased values */
const kf = (t: number, keys: [number, number][], ease = Easing.inOut(Easing.cubic)) =>
  interpolate(t, keys.map((k) => k[0]), keys.map((k) => k[1]), {
    easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

export const MUM: [number, number] = [72.83, 19.0];
export const CHE: [number, number] = [80.27, 13.08];
// simplified real routes (SEA-ME-WE style)
export const R1: [number, number][] = [[5.4, 43.3], [11, 38.5], [20, 34.5], [29, 32.2], [32.4, 30.5], [34.5, 26], [38.5, 20], [42.5, 13.5], [46, 12], [52, 13.5], [60, 16.5], [68, 18.5], MUM];
export const R2: [number, number][] = [[103.8, 1.3], [100.5, 4], [97.5, 6.5], [93.5, 8.5], [87, 11.5], CHE];

export type GlobeState = {
  lon: number; lat: number; dist: number; scale: number; tilt: number;
  dots: number; grid: number; c1: number; c2: number; alpha: number;
};

/** Every 3D value is a pure function of time (no useFrame, no self-running animation). */
export function globeState(t: number): GlobeState {
  const lonBase = kf(t, [[0, 8], [ev.india - 0.3, 8], [ev.india + 1.3, 44], [ev.samundar - 0.5, 44], [ev.samundar + 1.1, 76]]);
  const latBase = kf(t, [[0, 24], [ev.india - 0.3, 24], [ev.india + 1.3, 20], [ev.samundar - 0.5, 20], [ev.samundar + 1.1, 14]]);
  const tiltBase = kf(t, [[ev.samundar - 0.5, 0], [ev.samundar + 1.1, -0.08]]);
  const d = ein(seg(t, T1 - 0.35, T1 + 0.55)); // dive into Mumbai
  return {
    lon: lerp(lonBase, MUM[0], d),
    lat: lerp(latBase, MUM[1] + 2, d),
    tilt: lerp(tiltBase, 0, d),
    dist: lerp(kf(t, [[0, 6.4], [1.0, 5.6]], Easing.out(Easing.cubic)), 2.2, d),
    scale: kf(t, [[0, 0.7], [1.0, 1]], Easing.out(Easing.cubic)),
    dots: kf(t, [[0.15, 0], [1.05, 1]], Easing.out(Easing.quad)),
    grid: kf(t, [[0.2, 0], [1.2, 1]]),
    c1: kf(t, [[ev.samundar - 0.25, 0], [ev.samundar + 0.75, 1]]),
    c2: kf(t, [[ev.neeche - 0.2, 0], [ev.neeche + 0.4, 1]]),
    alpha: eo(seg(t, 0, 0.3)) * (1 - seg(t, T1 + 0.35, T1 + 0.7)),
  };
}

const RAD = Math.PI / 180;
export const v3 = (lon: number, lat: number, r = 1) =>
  new THREE.Vector3(r * Math.cos(lat * RAD) * Math.sin(lon * RAD), r * Math.sin(lat * RAD), r * Math.cos(lat * RAD) * Math.cos(lon * RAD));

/** The 3D canvas is 1080x1080 placed at y=390 in the 1080x1920 frame. */
export const SIZE = 1080;
export const FOV = 30;

/** Full-frame 3D canvas (1080x1920). The vertical FOV is widened so a 1080px-tall square still spans 30deg,
 * and the view is offset so the globe centre sits at y=930 like the HTML pipeline. */
export const FULL_FOV = (2 * Math.atan(Math.tan((FOV / 2) * RAD) * (1920 / 1080))) / RAD;
export function frameCamera(cam: THREE.PerspectiveCamera) {
  cam.fov = FULL_FOV; cam.aspect = 1080 / 1920;
  cam.setViewOffset(1080, 1920, 0, 960 - 930, 1080, 1920);
  cam.updateProjectionMatrix();
}
export function applyCamera(cam: THREE.PerspectiveCamera, g: GlobeState) {
  frameCamera(cam);
  cam.position.set(0, 0, g.dist);
  cam.lookAt(0, 0, 0);
  cam.rotation.z = g.tilt;
  cam.updateMatrixWorld(true);
}
export function globeMatrix(g: GlobeState) {
  const outer = new THREE.Object3D();
  outer.rotation.set(g.lat * RAD, 0, 0);
  outer.scale.setScalar(g.scale);
  const inner = new THREE.Object3D();
  inner.rotation.set(0, -g.lon * RAD, 0);
  outer.add(inner);
  outer.updateMatrixWorld(true);
  return inner.matrixWorld.clone();
}
const projCam = new THREE.PerspectiveCamera(FOV, 1, 0.01, 50);
/** project a world-space point (or lon/lat on the globe) to frame pixels; vis>0 means facing the camera */
export function projectWorld(p: THREE.Vector3, g: GlobeState) {
  applyCamera(projCam, g);
  const s = p.clone().project(projCam);
  return { x: ((s.x + 1) / 2) * 1080, y: ((1 - s.y) / 2) * 1920 };
}
export function projectLL(lon: number, lat: number, g: GlobeState) {
  const p = v3(lon, lat, 1.01).applyMatrix4(globeMatrix(g));
  applyCamera(projCam, g);
  const n = p.clone().normalize();
  const toCam = projCam.position.clone().sub(p).normalize();
  return { ...projectWorld(p, g), vis: n.dot(toCam) };
}
export const satelliteWorld = (t: number) =>
  new THREE.Vector3(0.82 + Math.sin(t * 0.9) * 0.04, 0.86 + Math.sin(t * 2) * 0.04, 0.7);
