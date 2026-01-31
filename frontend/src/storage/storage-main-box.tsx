import React from "react";
import { Route } from '../routes/storage';
import { StorageMainBoxContent } from './storage-main-box-content';
import { css, cx } from '@emotion/css';

export const StorageMainBox: React.FC = () => {
  const mainBoxIds = Route.useSearch({ select: search => search.mainBoxIds }) ?? [];

  return (
    <div
      className={css({
        display: 'flex',
      })}
    >
      {mainBoxIds.map((boxId, i) => <StorageMainBoxContent
        key={boxId}
        boxId={boxId}
        className={mainBoxIds.length > 1
          ? cx(
            (i < mainBoxIds.length - 1
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
