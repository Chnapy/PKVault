import { css } from "@emotion/css";
import React from "react";
import pkballImg from "../../assets/pkhex/img/ball/_ball4.png";
import { Container } from "../container/container";
import { theme } from "../theme";
import { getSpeciesImg } from "./util/get-species-img";
import { getSpeciesNO } from "./util/get-species-no";

const styles = {
  content: css({
    backgroundColor: theme.bg.dark,
    color: theme.text.light,
    textShadow: "1px 1px 0px rgba(255,255,255,0.2)",
    padding: 2,
    paddingTop: 0,
    borderRadius: 4,
    fontSize: 14,
  }),
};

export type DexItemProps = {
  species: number;
  speciesName: string;
  seen: boolean;
  caught: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export const DexItem: React.FC<DexItemProps> = React.memo(
  ({ species, speciesName, seen, caught, selected, onClick }) => {
    return (
      <Container
        as={onClick ? "button" : undefined}
        // borderRadius="small"
        onClick={onClick}
        selected={selected}
        noDropshadow={!onClick}
      >
        <div className={styles.content}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 2,
            }}
          >
            <span>{getSpeciesNO(species)}</span>

            {caught && (
              <img
                src={pkballImg}
                loading="lazy"
                style={{
                  height: 12,
                }}
              />
            )}
          </div>

          <div
            style={{
              background: theme.bg.default,
              borderRadius: 2,
            }}
          >
            <img
              src={getSpeciesImg(species, speciesName)}
              alt={speciesName}
              loading="lazy"
              style={{
                width: 96,
                height: 96,
                filter: seen ? undefined : "brightness(0) opacity(0.5)",
                display: "block",
              }}
            />
          </div>
        </div>
      </Container>
    );
  }
);
