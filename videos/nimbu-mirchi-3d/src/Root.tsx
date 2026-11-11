import { Composition, staticFile } from "remotion";
import timing from "./data/timing.json";
import { Nazar3D } from "./Video";

const FontFaces: React.FC = () => (
  <style>{`
@font-face{font-family:M;src:url(${staticFile("fonts/Montserrat-500.ttf")});font-weight:500}
@font-face{font-family:M;src:url(${staticFile("fonts/Montserrat-800.ttf")});font-weight:800}
@font-face{font-family:M;src:url(${staticFile("fonts/Montserrat-900.ttf")});font-weight:900}
@font-face{font-family:J;src:url(${staticFile("fonts/JetBrainsMono-Medium.ttf")})}`}</style>
);
const WithFonts: React.FC = () => (<><FontFaces /><Nazar3D /></>);

export const RemotionRoot: React.FC = () => (
  <Composition id="Nazar3D" component={WithFonts} durationInFrames={Math.ceil(timing.TOT * 30)} fps={30} width={1080} height={1920} />
);
