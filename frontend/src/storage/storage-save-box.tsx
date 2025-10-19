import React from "react";
import { Route } from "../routes/storage";
import { StorageSaveBoxContent } from './storage-save-box-content';

export type StorageSaveBoxProps = {
  saveId: number;
};

export const StorageSaveBox: React.FC<StorageSaveBoxProps> = ({ saveId }) => {
  const saveBoxIds = Route.useSearch({ select: (search) => search.saves?.[ saveId ]?.saveBoxIds }) ?? [ 0 ];
  const saveOrder = Route.useSearch({ select: (search) => search.saves?.[ saveId ]?.order ?? 0 });

  return (
    <div
      style={{
        display: 'flex',
        // gap: 8,
      }}
    >
      {saveBoxIds.map((boxId, i) => <StorageSaveBoxContent
        key={boxId}
        saveId={saveId}
        boxId={boxId}
        order={saveOrder}
        style={saveBoxIds.length > 1 ? {
          ...(i < saveBoxIds.length - 1 ? {
            borderRightWidth: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            paddingRight: 11,
          } : undefined),
          ...(i > 0 ? {
            borderLeftWidth: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            paddingLeft: 11,
          } : undefined),
        } : undefined}
      />)}
    </div>
  );
};
