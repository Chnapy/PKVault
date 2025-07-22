import { css } from "@emotion/css";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import type React from "react";
import brendanBigImg from "../../assets/trainer/big/Spr_RS_Brendan.png";
import brendanSmallImg from "../../assets/trainer/small/Brendan_RS_OD.png";
import type { GameVersion } from "../../data/sdk/model";
import { getGameInfos } from "../../pokedex/details/util/get-game-infos";
import { Button } from "../button/button";
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";

export type SaveCardContentProps = {
  // id: number;
  timestamp: number;
  version: GameVersion;
  generation: number;
  tid: number;
  // sid: number;
  trainerName: string;
  trainerGenderMale: boolean;
  onDelete?: () => Promise<unknown>;
};

export const SaveCardContent: React.FC<SaveCardContentProps> = ({
  generation,
  tid,
  timestamp,
  trainerName,
  trainerGenderMale,
  version,
  onDelete,
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
      }}
    >
      <div
        style={{
          // marginLeft: -4,
          // marginTop: -4,
          // marginRight: 4,
          padding: 4,
          borderRadius: 8,
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
        }}
      >
        <TextContainer>
          <span style={{ color: theme.text.contrast }}>Gen {generation}</span>
          {" - "}
          <span style={{ color: theme.text.primary }}>
            Pokemon {getGameInfos(version).text}
          </span>
          <img
            src={brendanSmallImg}
            style={{
              float: "right",
              margin: -8,
            }}
          />
          <br />
          OT {tid} -{" "}
          <span style={{ color: theme.text.primary }}>{trainerName}</span>
          <br />
          {renderTimestamp()}{" "}
          {Date.now() - timestamp < 3_600_000 && (
            <span style={{ color: theme.text.contrast }}>NEW !</span>
          )}
          {onDelete && (
            <span style={{ position: "absolute", right: 0, bottom: 0 }}>
              <Popover className="relative">
                {/* <Button>X</Button> */}
                <Button as={PopoverButton} componentDescriptor="button">
                  X
                </Button>
                <PopoverPanel
                  anchor="bottom"
                  className={css({ overflow: "unset !important" })}
                >
                  <Button onClick={onDelete}>Confirm ?</Button>
                </PopoverPanel>
              </Popover>
            </span>
          )}
          {/* N°{getSpeciesNO(species)} - {speciesNameTranslated} */}
        </TextContainer>
      </div>
    </div>
  );
};
