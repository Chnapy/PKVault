import { css } from "@emotion/css";
import type React from "react";
import { useTranslate } from "../../translate/i18n";
import { BallImg } from '../../ui/img/ball-img';
import { Icon } from "../../ui/icon/icon";
import { ShinyIcon } from "../../ui/icon/shiny-icon";
import { theme } from "../../ui/theme";

type PokedexCountProps = {
  seenCount: number;
  caughtCount: number;
  ownedCount: number;
  shinyCount: number;
  totalCount: number;
};

export const PokedexCount: React.FC<PokedexCountProps> = ({
  seenCount,
  caughtCount,
  ownedCount,
  shinyCount,
  totalCount,
}) => {
  const { t } = useTranslate();

  return (
    <div
      className={css({
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        gap: 4,
      })}
    >
      <Icon name="eye" solid forButton />{" "}
      <span className={css({ color: theme.text.primary })}>{seenCount}</span>
      <BallImg size={14} />
      <span className={css({ color: theme.text.primary })}>{caughtCount}</span>
      <Icon name="folder" solid forButton />{" "}
      <span className={css({ color: theme.text.primary })}>{ownedCount}</span>
      <ShinyIcon />
      <span className={css({ color: theme.text.primary })}>
        {shinyCount}
      </span>{" "}
      {t("total")}.
      <span className={css({ color: theme.text.primary })}>{totalCount}</span>
    </div>
  );
};
