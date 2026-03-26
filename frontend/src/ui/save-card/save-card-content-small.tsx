import { css } from '@emotion/css';
import type React from "react";
import type { EntityContext, GameVersion, Gender as GenderType } from '../../data/sdk/model';
import { getEntityContextGenerationName } from '../../data/util/get-entity-context-generation-name';
import { withErrorCatcher } from '../../error/with-error-catcher';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { TextContainer } from "../text-container/text-container";
import { theme } from "../theme";
import { renderTimestamp } from '../util/render-date-time';
import { DOLine } from './do-line';
import { SaveCardImg } from './save-card-img';

export type SaveCardContentSmallProps = {
  id: number;
  lastWriteTime: string;
  context: EntityContext;
  version: GameVersion;
  tid: number;
  sid?: number;
  trainerName: string;
  trainerGender: GenderType;
};

export const SaveCardContentSmall: React.FC<SaveCardContentSmallProps> = withErrorCatcher('default', ({
  id,
  context,
  tid,
  sid,
  lastWriteTime,
  trainerName,
  trainerGender,
  version,
}) => {
  const { t } = useTranslate();

  const staticData = useStaticData();

  const date = new Date(lastWriteTime);

  return (
    <div
      className={css({
        flexShrink: 0,
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

          <DOLine
            tid={tid}
            sid={sid}
            originTrainerName={trainerName}
            originTrainerGender={trainerGender}
          />

          <br />
          {t('save.sync')} <span className={css({ color: theme.text.primary })}>{renderTimestamp(date)}</span>
        </TextContainer>
      </div>
    </div>
  );
});
