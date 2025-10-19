import React from "react";
import { ErrorCatcher } from '../error/error-catcher';
import { Route } from '../routes/storage';
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
  const navigate = Route.useNavigate();

  return <ErrorCatcher onClose={() => navigate({
    search: {
      selected: undefined,
    }
  })}>
    {saveId
      ? <StorageDetailsSave
        selectedId={id}
        saveId={saveId!}
      />
      : <StorageDetailsMain
        selectedId={id}
      />}
  </ErrorCatcher>;
};
