import React from "react";
import { BankContext } from './bank/bank-context';
import { StorageMainBoxContent } from './storage-main-box-content';

export const StorageMainBox: React.FC = () => {
  const selectedBankBoxes = BankContext.useSelectedBankBoxes();
  const mainBoxIds = selectedBankBoxes.data?.selectedBoxes.map(box => box.idInt) ?? [];

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
