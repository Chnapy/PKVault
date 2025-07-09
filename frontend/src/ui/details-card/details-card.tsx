import type React from "react";
import pkballImg from "../../assets/pkhex/img/ball/_ball4.png";
import pkm73Img from "../../assets/pkhex/img/Big Pokemon Sprites/b_73.png";
import pkm73sImg from "../../assets/pkhex/img/Big Shiny Sprites/b_73s.png";
import { Container } from "../container/container";
import { getSpeciesImg } from "../dex-item/util/get-species-img";
import { getSpeciesNO } from "../dex-item/util/get-species-no";
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";
import { TitleContainer } from "../title-container/title-container";

export type DetailsCardProps = {
  species: number;
  speciesName: string;
  caught: boolean;
  fromGames: React.ReactNode;
  compatibleGames: React.ReactNode;
};

export const DetailsCard: React.FC<DetailsCardProps> = ({
  species,
  speciesName,
  caught,
  fromGames,
  compatibleGames,
}) => {
  return (
    <Container padding="big" borderRadius="big">
      <div style={{ marginBottom: 2, display: "flex", gap: 4 }}>
        {/* <Button bgColor={theme.game.blue} onClick={console.log}>
          Blue
        </Button>
        <Button bgColor={theme.game.crystal} onClick={console.log}>
          Crystal
        </Button>
        <Button bgColor={theme.game.saphir} onClick={console.log}>
          Saphir
        </Button> */}
        {fromGames}
      </div>

      <div
        style={{
          borderRadius: 8,
          padding: 4,
          background: theme.bg.info,
          marginTop: 4,
        }}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              marginLeft: -4,
              marginTop: -4,
              marginRight: 4,
              padding: 4,
              borderRadius: 8,
              background: theme.bg.dark,
            }}
          >
            <img
              src={getSpeciesImg(species, speciesName)}
              alt={speciesName}
              style={{
                width: 96,
                display: "block",
                background: theme.bg.default,
                borderRadius: 8,
              }}
            />
          </div>

          <TextContainer>
            {caught && (
              <img
                src={pkballImg}
                style={{
                  height: 12,
                  marginRight: 2,
                  paddingBottom: 1,
                  verticalAlign: "text-bottom",
                }}
              />
            )}
            N°{getSpeciesNO(species)} - {speciesName}
          </TextContainer>
        </div>

        <div style={{ marginTop: 4, marginBottom: 4 }}>
          <TextContainer>
            Description
            <br />
            foobar
          </TextContainer>
        </div>

        <TitleContainer title="Owned in games">
          <img src={pkm73Img} alt="From Blue" style={{ width: 32 }} />
          <img src={pkm73sImg} alt="From Crystal" style={{ width: 32 }} />
        </TitleContainer>
      </div>
      <div
        style={{
          marginTop: 8,
          padding: 4,
          background: theme.bg.dark,
          borderRadius: 8,
        }}
      >
        <TitleContainer title="Compatible with games">
          <div style={{ marginTop: 4, display: "flex", gap: 4 }}>
            {/* <Button bgColor={theme.game.blue} onClick={console.log}>
              Blue
            </Button>
            <Button bgColor={theme.game.crystal} onClick={console.log}>
              Crystal
            </Button>
            <Button bgColor={theme.game.saphir} onClick={console.log}>
              Saphir
            </Button> */}
            {compatibleGames}
          </div>
        </TitleContainer>
      </div>
    </Container>
  );
};
