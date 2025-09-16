import React from "react";
import { StorageDetailsMain } from './details/storage-details-main';
import { StorageDetailsSave } from './details/storage-details-save';

export type StorageDetailsProps = {
  type: "main" | "save";
  id: string;
  saveId?: number;
};

export const StorageDetails: React.FC<StorageDetailsProps> = ({
  type,
  id,
  saveId,
}) => {
  switch (type) {
    case 'main':
      return <StorageDetailsMain
        selectedId={id}
      />;
    case 'save':
      return <StorageDetailsSave
        selectedId={id}
        saveId={saveId!}
      />;
  }
};
