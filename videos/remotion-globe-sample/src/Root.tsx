import { Composition } from "remotion";
import { InternetGlobe } from "./Video";

export const RemotionRoot: React.FC = () => (
  <Composition id="InternetGlobe" component={InternetGlobe} durationInFrames={180} fps={30} width={1080} height={1920} />
);
