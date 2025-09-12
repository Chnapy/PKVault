import type React from "react";
import type { GameVersion } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";

export type SaveCardContentSmallProps = {
  id: number;
  lastWriteTime: string;
  version: GameVersion;
  generation: number;
  tid: number;
  // sid: number;
  trainerName: string;
  trainerGenderMale: boolean;
};

export const SaveCardContentSmall: React.FC<SaveCardContentSmallProps> = ({
  id,
  generation,
  tid,
  lastWriteTime,
  trainerName,
  trainerGenderMale,
  version,
}) => {
  const staticData = useStaticData();

  const gameInfos = getGameInfos(version);

  const date = new Date(lastWriteTime);

  const normTo2 = (value: number) => `${value < 10 ? "0" : ""}${value}`;

  const renderTimestamp = () =>
    `${normTo2(date.getDate())}/${normTo2(date.getMonth() + 1)}/${normTo2(date.getFullYear() - 2000)} - ${normTo2(
      date.getHours()
    )}:${normTo2(date.getMinutes())}:${normTo2(date.getSeconds())}`;

  return (
    <div
      style={{
        display: "flex",
        borderRadius: 8,
        background: theme.bg.info,
        alignItems: "flex-start",
        textAlign: 'left',
      }}
    >
      <div
        style={{
          padding: 4,
          borderRadius: 8,
          borderBottomLeftRadius: 0,
          background: theme.bg.dark,
        }}
      >
        <img
          src={gameInfos.img}
          alt={generation + ""}
          style={{
            imageRendering: "pixelated",
            width: 64,
            display: "block",
            background: theme.bg.default,
            borderRadius: 8,
          }}
        />
      </div>

      <div
        style={{
          flexGrow: 1,
          padding: 4,
          overflow: 'hidden'
        }}
      >
        <TextContainer noWrap>
          <span style={{ color: theme.text.contrast }}>Gen {generation}</span>
          {" - "}
          <span style={{ color: theme.text.primary }}>
            Pokemon {staticData.versions[ version ].name}
          </span>
          {" - "}
          <span style={{ color: theme.text.primary }}>{id}</span>

          <br />
          OT {tid} -{" "}
          <span style={{ color: theme.text.primary }}>{trainerName}</span>
          <br />
          Last sync <span style={{ color: theme.text.primary }}>{renderTimestamp()}</span>{" "}
          {Date.now() - date.getMilliseconds() < 3_600_000 && (
            <span style={{ color: theme.text.contrast }}>NEW !</span>
          )}
        </TextContainer>
      </div>
    </div>
  );
};
