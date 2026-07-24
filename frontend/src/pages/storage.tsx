import React from "react";
import { withErrorCatcher } from '../error/with-error-catcher';
import { StoragePanelWrapperDetails } from '../storage/panel/storage-panel-wrapper-details';
import { UIStorageContent } from '../ui/storage/storage-content/ui-storage-content';

export const StoragePage: React.FC = withErrorCatcher('default', () => {
  console.log('page storage')

  return (
    <UIStorageContent
      id='move-container'
      left={<StoragePanelWrapperDetails />}
      right={<StoragePanelWrapperDetails />}
    />
  );
});
