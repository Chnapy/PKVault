import { css } from "@emotion/css";
import React from "react";
import { Gender as GenderType } from "../../data/sdk/model";
import { withErrorCatcher } from "../../error/with-error-catcher";
import type { SpeciesFormItem } from "../../pokedex/list/hooks/use-pokedex-items";
import { Gender } from "../gender/gender";
import { AlphaIcon } from '../icon/alpha-icon';
import { Icon } from "../icon/icon";
import { ShinyIcon } from "../icon/shiny-icon";
import { BallImg } from '../img/ball-img';
import { SpeciesImg } from "../img/species-img";
import { theme } from "../theme";

export const DexFormItem: React.FC<Omit<SpeciesFormItem, "id">> =
  withErrorCatcher(
    "item",
    ({
      species,
      context,
      form,
      genders,
      isSeen,
      isSeenAlpha,
      isCaught,
      isOwned,
      isOwnedShiny,
    }) => {
      return (
        <div
          className={css({
            position: "relative",
            alignSelf: "flex-start",
            padding: 0,
            borderColor: isSeen ? theme.text.default : undefined,
          })}
        >
          <div
            className={css({
              position: "absolute",
              right: 4,
              top: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
            })}
          >
            {isSeenAlpha && <AlphaIcon className={css({ height: "0.8lh" })} />}

            {isOwnedShiny && <ShinyIcon className={css({ height: "0.8lh" })} />}

            {isOwned && <Icon name="folder" solid forButton />}

            {isCaught && <BallImg size={16} />}
          </div>

          <div
            className={css({
              position: "absolute",
              right: 2,
              bottom: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
            })}
          >
            {genders.map((gender) => (
              <Gender key={gender} gender={gender} />
            ))}
          </div>

          <div
            className={css({
              display: "flex",
              background: theme.bg.default,
              borderRadius: 2,
            })}
          >
            <SpeciesImg
              species={species}
              context={context}
              form={form}
              isFemale={genders[ 0 ] == GenderType.Female}
              className={css({
                filter: isSeen ? undefined : "brightness(0) opacity(0.5)",
              })}
            />
          </div>
        </div>
      );
    },
  );
