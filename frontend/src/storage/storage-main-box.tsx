import React from "react";
import { Route } from "../routes/storage";
import { StorageMainBoxContent } from './storage-main-box-content';

export const StorageMainBox: React.FC = () => {
  const mainBoxIds = Route.useSearch({ select: (search) => search.mainBoxIds }) ?? [ 0 ];

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      {mainBoxIds.map((boxId, i) => <StorageMainBoxContent
        key={boxId}
        boxId={boxId}
        style={mainBoxIds.length > 1 ? {
          ...(i < mainBoxIds.length - 1 ? {
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
