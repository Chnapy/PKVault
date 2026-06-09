import React from "react";
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { Route } from '../../routes/storage';
import { UIStorageDetails } from '../../ui-new/storage/storage-details/ui-storage-details';
import { useCurrentStorage } from '../panel/storage-panel-context';
import { DetailsActions } from './details-actions';
import { DetailsContent } from './details-content';
import { DetailsMain } from './details-main';
import { DetailsSaves } from './details-saves';

export const StorageDetails: React.FC = () => {
  const navigate = Route.useNavigate();

  const { getSelected } = useCurrentStorage();
  const selectedSaveId = Route.useSearch({ select: search => getSelected(search.selected)?.saveId });
  const selectedId = Route.useSearch({ select: search => getSelected(search.selected)?.id }) ?? '';

  const pkmIndexQuery = usePkmIndex(selectedSaveId ?? null, data => !!data.data.byId[ selectedId ]);
  const noPkmsFound = !!selectedId && pkmIndexQuery.data === false && !pkmIndexQuery.isLoading;

  const unselect = React.useCallback(() => navigate({
    search: {
      selected: undefined,
    },
  }), [ navigate ]);

  // unselect if pkm does not exist
  React.useEffect(() => {
    if (noPkmsFound) {
      unselect();
    }
  }, [ unselect, noPkmsFound ]);

  return <UIStorageDetails
    header={closeBtn => <DetailsSaves actions={closeBtn} />}
    main={<DetailsMain />}
    content={<DetailsContent />}
    actions={!!selectedId && <DetailsActions
      pkmIds={[ selectedId ]}
      saveId={selectedSaveId ?? null}
    />}
    onClose={unselect}
  />;
};
