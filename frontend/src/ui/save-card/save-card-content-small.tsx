import { css } from '@emotion/css';
import type React from "react";
import type { EntityContext, GameVersion } from '../../data/sdk/model';
import { getEntityContextGenerationName } from '../../data/util/get-entity-context-generation-name';
import { withErrorCatcher } from '../../error/with-error-catcher';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";
import { SaveCardImg } from './save-card-img';

export type SaveCardContentSmallProps = {
  id: number;
  lastWriteTime: string;
  context: EntityContext;
  version: GameVersion;
  tid: number;
  trainerName: string;
  trainerGenderMale: boolean;
};

export const SaveCardContentSmall: React.FC<SaveCardContentSmallProps> = withErrorCatcher('default', ({
  id,
  context,
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
      className={css({
        display: "flex",
        borderRadius: 8,
        background: theme.bg.blue,
        alignItems: "flex-start",
        textAlign: 'left',
        overflow: 'hidden',
      })}
    >
      <SaveCardImg version={version} />

      <div
        className={css({
          flexGrow: 1,
          overflow: 'hidden'
        })}
      >
        <TextContainer noWrap forceScroll className={css({
          paddingBottom: 0,
        })}>
          <span className={css({ color: theme.text.red })}>{getEntityContextGenerationName(context, true)}</span>
          {" - "}
          <span className={css({ color: theme.text.primary })}>
            {t('save.pkm')} {staticData.versions[ version ]?.name}
          </span>
          {" - "}
          <span className={css({ color: theme.text.primary })}>{id}</span>
          <br />

          {tid > 0
            ? <>
              {t('save.ot')} {tid} -{" "}
              <span className={css({ color: theme.text.primary })}>{trainerName}</span>
            </>
            : '-'}

          <br />
          {t('save.sync')} <span className={css({ color: theme.text.primary })}>{renderTimestamp()}</span>
        </TextContainer>
      </div>
    </div>
  );
});
