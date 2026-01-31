import React from "react";
import { Route } from "../../../routes/storage";
import { StorageSaveBoxContent } from './storage-save-box-content';
import { css, cx } from '@emotion/css';

export type StorageSaveBoxProps = {
  saveId: number;
};

export const StorageSaveBox: React.FC<StorageSaveBoxProps> = ({ saveId }) => {
  const saveBoxIds = Route.useSearch({ select: (search) => search.saves?.[ saveId ]?.saveBoxIds }) ?? [ 0 ];
  const saveOrder = Route.useSearch({ select: (search) => search.saves?.[ saveId ]?.order ?? 0 });

  return (
    <div
      className={css({
        display: 'flex',
      })}
    >
      {saveBoxIds.map((boxId, i) => <StorageSaveBoxContent
        key={boxId}
        saveId={saveId}
        boxId={boxId}
        order={saveOrder}
        className={saveBoxIds.length > 1
          ? cx(
            (i < saveBoxIds.length - 1
              ? css({
                borderRightWidth: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                paddingRight: 11,
              })
              : undefined),
            (i > 0
              ? css({
                borderLeftWidth: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                paddingLeft: 11,
              })
              : undefined),
          )
          : undefined
        }
      />)}
    </div>
  );
};
