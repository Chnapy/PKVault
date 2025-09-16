import React from "react";
import shinyIconImg from '../../assets/pkhex/img/Pokemon Sprite Overlays/rare_icon.png?url';
import type { GenderType } from '../../data/sdk/model';
import { Button } from '../button/button';
import { getSpeciesNO } from "../dex-item/util/get-species-no";
import { Gender } from '../gender/gender';
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";
import { DetailsCardContainer } from './details-card-container';

export type DetailsCardProps = {
  species: number;
  speciesName: string;
  // hasShiny: boolean;
  localSpecies: number;
  genders: GenderType[];
  types: string[];
  description?: string;
  abilities: string[];
  abilitiesHidden: string[];
  stats: number[];
  caught: boolean;
  defaultSprite?: string;
  shinySprite?: string;
  ballSprite?: string;
  fromSaves: React.ReactNode;
  compatibleGames: React.ReactNode;
  onClose: () => void;
};

export const DetailsCard: React.FC<DetailsCardProps> = ({
  species,
  speciesName,
  // hasShiny,
  localSpecies,
  genders,
  types,
  description,
  abilities,
  abilitiesHidden,
  stats,
  caught,
  defaultSprite,
  shinySprite,
  ballSprite,
  fromSaves,
  compatibleGames,
  onClose
}) => {
  const [ showShiny, setShowShiny ] = React.useState(false);

  return <DetailsCardContainer
    // header={fromSaves}
    title={null}
    mainImg={<>
      <img
        src={showShiny ? shinySprite! : defaultSprite!}
        alt={speciesName}
        style={{
          imageRendering: "pixelated",
          width: 96,
          display: "block",
          background: theme.bg.default,
          borderRadius: 8,
        }}
      />

      {caught && (
        <img
          src={ballSprite!}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
          }}
        />
      )}

      <Button onClick={() => setShowShiny(!showShiny)} selected={showShiny} style={{
        position: 'absolute',
        top: 6,
        right: 6,
      }}>
        <img
          src={shinyIconImg}
          alt='shiny-icon'
          style={{
            width: 12,
            margin: '0 -2px',
          }}
        />
      </Button>
    </>}
    mainInfos={<>
      N°{getSpeciesNO(species)} - <span style={{ color: theme.text.primary }}>{speciesName}</span>
      <span
        style={{
          float: 'right',
          fontFamily: theme.font.special,
        }}
      >
        {genders.map(gender => <Gender key={gender} gender={gender} />)}
      </span>
      <br />
      {types.join(' - ')}
      <br />
      Dex local N°<span style={{ color: theme.text.primary }}>{getSpeciesNO(localSpecies)}</span>
    </>}
    preContent={null}
    content={<>
      {description && (
        <div style={{ display: "flex" }}>
          <TextContainer>{description}</TextContainer>
        </div>
      )}

      {abilities.length > 0 && <div style={{ display: "flex" }}>
        <TextContainer>
          <span style={{ color: theme.text.primary }}>Abilities</span><br />
          {abilities.map(ability => <div key={ability}>{ability}</div>)}
          {abilitiesHidden.map(ability => <div key={ability}>{ability} (caché)</div>)}
        </TextContainer>
      </div>}

      <div style={{ display: "flex" }}>
        <TextContainer>
          <table>
            <thead>
              <tr>
                <td style={{ paddingTop: 0, paddingBottom: 0 }}></td>
                <td style={{ paddingTop: 0, paddingBottom: 0 }}>HP.</td>
                <td style={{ paddingTop: 0, paddingBottom: 0 }}>Atk</td>
                <td style={{ paddingTop: 0, paddingBottom: 0 }}>Def</td>
                <td style={{ paddingTop: 0, paddingBottom: 0 }}>SpA</td>
                <td style={{ paddingTop: 0, paddingBottom: 0 }}>SpD</td>
                <td style={{ paddingTop: 0, paddingBottom: 0 }}>Spe</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 0 }}>
                  <span style={{ color: theme.text.primary }}>Stats</span>
                </td>
                {stats.map((stat, i) => <td key={i} style={{ padding: 0, textAlign: 'center' }}>{stat}</td>)}
              </tr>
            </tbody>
          </table>
        </TextContainer>
      </div>
    </>}
    actions={null}
    onClose={onClose}
  />;

  // return (
  //   <>
  //     <div
  //       style={{
  //         display: 'flex',
  //         flexDirection: 'column',
  //         gap: 4,
  //         borderRadius: 8,
  //         padding: 4,
  //         background: theme.bg.info,
  //         marginTop: 4,
  //       }}
  //     >
  //       <TitleContainer title="Owned in games">
  //         <img src={defaultSprite!} alt="From Blue" style={{ width: 32 }} />
  //         <img src={shinySprite!} alt="From Crystal" style={{ width: 32 }} />
  //       </TitleContainer>
  //     </div>
  //     <div
  //       style={{
  //         marginTop: 8,
  //         padding: 4,
  //         background: theme.bg.dark,
  //         borderRadius: 8,
  //       }}
  //     >
  //       <TitleContainer title="Compatible with games">
  //         <div style={{ marginTop: 4, display: "flex", gap: 4 }}>
  //           {/* <Button bgColor={theme.game.blue} onClick={console.log}>
  //             Blue
  //           </Button>
  //           <Button bgColor={theme.game.crystal} onClick={console.log}>
  //             Crystal
  //           </Button>
  //           <Button bgColor={theme.game.saphir} onClick={console.log}>
  //             Saphir
  //           </Button> */}
  //           {compatibleGames}
  //         </div>
  //       </TitleContainer>
  //     </div>
  //     </>
  // );
};
