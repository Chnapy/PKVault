import React from "react";
import { StorageDetailsMain } from './details/storage-details-main';
import { StorageDetailsSave } from './details/storage-details-save';

export type StorageDetailsProps = {
  id: string;
  saveId?: number;
};

export const StorageDetails: React.FC<StorageDetailsProps> = ({
  id,
  saveId,
}) => {
  return saveId
    ? <StorageDetailsSave
      selectedId={id}
      saveId={saveId!}
    />
    : <StorageDetailsMain
      selectedId={id}
    />;
};
