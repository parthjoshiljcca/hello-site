import { Composition } from "remotion";
import { Overthinking } from "./Video";

export const RemotionRoot: React.FC = () => (
  <Composition id="Overthinking" component={Overthinking} durationInFrames={2110} fps={30} width={1080} height={1920} />
);
