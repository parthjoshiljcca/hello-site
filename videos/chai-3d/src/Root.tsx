import { Composition, staticFile } from "remotion";
import { Chai3D } from "./Video";

const FontFaces: React.FC = () => (
  <style>{`
@font-face{font-family:M;src:url(${staticFile("fonts/Montserrat-500.ttf")});font-weight:500}
@font-face{font-family:M;src:url(${staticFile("fonts/Montserrat-800.ttf")});font-weight:800}
@font-face{font-family:M;src:url(${staticFile("fonts/Montserrat-900.ttf")});font-weight:900}
@font-face{font-family:J;src:url(${staticFile("fonts/JetBrainsMono-Medium.ttf")})}`}</style>
);
const WithFonts: React.FC = () => (<><FontFaces /><Chai3D /></>);

export const RemotionRoot: React.FC = () => (
  <Composition id="Chai3D" component={WithFonts} durationInFrames={2623} fps={30} width={1080} height={1920} />
);
