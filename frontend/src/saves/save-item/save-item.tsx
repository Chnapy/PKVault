import { css } from '@emotion/css';
import React from "react";
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { Container } from "../../ui/container/container";
import { SaveItemEdit } from '../../ui/save-card/save-item-edit';
import { theme } from '../../ui/theme';
import { SaveItemContent, type SaveItemContentProps } from './save-item-content';

export type SaveItemProps = SaveItemContentProps & {
  width?: number | string;
  onClick?: () => void;
};

export const SaveItem: React.FC<SaveItemProps> = ({
  width = 350,
  onClick,
  ...saveItemContentProps
}) => {
  const staticData = useStaticData();
  const saveInfosQuery = useSaveInfosGetAll();

  const save = saveInfosQuery.data?.data[ saveItemContentProps.saveId ];
  const versionObj = staticData.versions[ save?.version ?? '' ];
  if (!save || !versionObj) {
    return null;
  }

  return (
    <div className={css({
      position: 'relative',
      width,
    })}>
      <Container
        as={onClick ? "button" : "div"}
        padding="big"
        className={css({
          backgroundColor: onClick
            ? theme.bg.item
            : theme.bg.panel,
          borderColor: onClick
            ? theme.text.default
            : undefined,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          width: '100%',
        })}
        onClick={onClick}
      >
        <SaveItemContent {...saveItemContentProps} />
      </Container>

      {!versionObj.isGameVersion && <div className={css({
        position: 'absolute',
        top: 4,
        left: 4,
        padding: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      })}>

        <SaveItemEdit saveId={saveItemContentProps.saveId} />
      </div>}
    </div>
  );
};
