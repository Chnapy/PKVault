import type React from "react";
import type { GameVersion } from "../../data/sdk/model";
import { Button, type ButtonProps } from "../../ui/button/button";
import { getGameInfos } from "./util/get-game-infos";
import { useStaticData } from '../../hooks/use-static-data';

export const GameButton: React.FC<
  Omit<ButtonProps, "bgColor" | "children"> & {
    version: GameVersion;
    trainerName?: string;
    selected?: boolean;
  }
> = ({ version, trainerName, ...rest }) => {
  const { versions } = useStaticData();
  const { color } = getGameInfos(version);

  const text = versions[ version ]?.name;

  return (
    <Button bgColor={color} style={{ whiteSpace: 'nowrap' }} {...rest}>
      {text}
      {trainerName && " - " + trainerName}
    </Button>
  );
};
