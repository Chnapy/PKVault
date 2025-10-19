import type React from "react";
import type { GameVersion } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";
import { SaveCardImg } from './save-card-img';

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
  const { t } = useTranslate();

  const staticData = useStaticData();

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
        background: theme.bg.blue,
        alignItems: "flex-start",
        textAlign: 'left',
        overflow: 'hidden',
      }}
    >
      <SaveCardImg version={version} />

      <div
        style={{
          flexGrow: 1,
          overflow: 'hidden'
        }}
      >
        <TextContainer noWrap forceScroll style={{
          paddingBottom: 0,
        }}>
          <span style={{ color: theme.text.red }}>{t('save.gen')} {generation}</span>
          {" - "}
          <span style={{ color: theme.text.primary }}>
            {t('save.pkm')} {staticData.versions[ version ]?.name}
          </span>
          {" - "}
          <span style={{ color: theme.text.primary }}>{id}</span>

          <br />
          {t('save.ot')} {tid} -{" "}
          <span style={{ color: theme.text.primary }}>{trainerName}</span>
          <br />
          {t('save.sync')} <span style={{ color: theme.text.primary }}>{renderTimestamp()}</span>{" "}
          {/* {Date.now() - date.getMilliseconds() < 3_600_000 && (
            <span style={{ color: theme.text.red }}>NEW !</span>
          )} */}
        </TextContainer>
      </div>
    </div>
  );
};
