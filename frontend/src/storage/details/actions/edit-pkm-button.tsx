import { PencilIcon } from 'lucide-react';
import type React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useTranslate } from '../../../translate/i18n';
import { UIButton } from '../../../ui/form/button/ui-button';
import { UIPopover } from '../../../ui/popover/ui-popover';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { pick } from '../../../util/pick';
import { useSelectCallback } from '../../../util/use-select-callback';
import { DetailsEdit } from '../details-edit';

export type ActionButtonDefaultProps = {
    pkmIds: string[];
    saveId: number | null;
};

export const EditPkmButton: React.FC<ActionButtonDefaultProps> = ({ pkmIds, saveId }) => {
    const { t } = useTranslate();

    const pkmIndexQuery = usePkmIndex(saveId ?? null,
        useSelectCallback(data => {
            return pkmIds.map(id => data.data.byId[ id ])
                .filter(filterIsDefined)
                .map(pkm => pick(pkm, [ 'id', 'canEdit' ]));
        }, [ pkmIds ]));

    const pkms = pkmIndexQuery.data ?? [];

    const canEditList = pkms.filter(pkm => pkm.canEdit);

    return canEditList.length < 2 && <UIPopover
        position='left'
        nested
        dropdown={canEditList[ 0 ] && <DetailsEdit
            pkmId={canEditList[ 0 ].id}
            saveId={saveId}
        />}
    >
        <UIButton
            name='edit'
            controlLabel={t('storage.actions.edit')}
            variant='filled'
            color='blue'
            size='compact-md'
            leftSection={<PencilIcon />}
            disabled={canEditList.length === 0}
        >
            {t('storage.actions.edit')}
        </UIButton>
    </UIPopover>;
};
