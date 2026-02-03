import { css } from "@emotion/css";
import React from "react";
import { Gender as GenderType } from "../../data/sdk/model";
import { withErrorCatcher } from "../../error/with-error-catcher";
import { useStaticData } from "../../hooks/use-static-data";
import type { SpeciesFormItem } from "../../pokedex/list/hooks/use-pokedex-items";
import { ItemImg } from "../details-card/item-img";
import { SpeciesImg } from "../details-card/species-img";
import { Gender } from "../gender/gender";
import { Icon } from "../icon/icon";
import { ShinyIcon } from "../icon/shiny-icon";
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
      isCaught,
      isOwned,
      isOwnedShiny,
    }) => {
      const staticData = useStaticData();

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
              right: 2,
              top: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
            })}
          >
            {isOwnedShiny && <ShinyIcon className={css({ height: "0.8lh" })} />}

            {isOwned && <Icon name="folder" solid forButton />}

            {isCaught && (
              <ItemImg
                item={staticData.itemPokeball.id}
                size={"1lh"}
                className={css({ margin: "0 -2px" })}
              />
            )}
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
              isFemale={genders[0] == GenderType.Female}
              className={css({
                filter: isSeen ? undefined : "brightness(0) opacity(0.5)",
              })}
            />
          </div>
        </div>
      );
    },
  );
