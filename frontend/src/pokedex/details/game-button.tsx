import type React from "react";
import type { GameVersion } from "../../data/sdk/model";
import { Button, type ButtonProps } from "../../ui/button/button";
import { getGameInfos } from "./util/get-game-infos";

export const GameButton: React.FC<
  Omit<ButtonProps, "bgColor" | "children"> & {
    version: GameVersion;
    trainerName?: string;
    selected?: boolean;
  }
> = ({ version, trainerName, ...rest }) => {
  const { bgColor, text } = getGameInfos(version);

  return (
    <Button bgColor={bgColor} style={{ whiteSpace: 'nowrap' }} {...rest}>
      {text}
      {trainerName && " - " + trainerName}
    </Button>
  );
};
