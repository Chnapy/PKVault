import type React from "react";
import brendanBigImg from "../../assets/trainer/big/Spr_RS_Brendan.png";
import brendanSmallImg from "../../assets/trainer/small/Brendan_RS_OD.png";
import type { GameVersion } from "../../data/sdk/model";
import { getGameInfos } from "../../pokedex/details/util/get-game-infos";
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";

export type SaveCardContentSmallProps = {
  id: number;
  timestamp: number;
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
  timestamp,
  trainerName,
  trainerGenderMale,
  version,
}) => {
  const date = new Date(timestamp);

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
        // padding: 4,
        background: theme.bg.info,
        alignItems: "flex-start",
        textAlign: 'left',
      }}
    >
      <div
        style={{
          // marginLeft: -4,
          // marginTop: -4,
          // marginRight: 4,
          padding: 4,
          borderRadius: 8,
          borderBottomLeftRadius: 0,
          background: theme.bg.dark,
        }}
      >
        <img
          src={brendanBigImg}
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
            Pokemon {getGameInfos(version).text}
          </span>
          {" - "}
          <span style={{ color: theme.text.primary }}>{id}</span>

          <br />
          OT {tid} -{" "}
          <span style={{ color: theme.text.primary }}>{trainerName}</span>
          <img
            src={brendanSmallImg}
            style={{
              margin: -10,
              marginLeft: 0,
            }}
          />
          <br />
          Sync <span style={{ color: theme.text.primary }}>{renderTimestamp()}</span>{" "}
          {Date.now() - timestamp < 3_600_000 && (
            <span style={{ color: theme.text.contrast }}>NEW !</span>
          )}
        </TextContainer>
      </div>
    </div>
  );
};
