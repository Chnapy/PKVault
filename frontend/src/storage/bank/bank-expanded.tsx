import type React from 'react';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import { useStorageDeleteMainBank, useStorageGetBoxes, useStorageGetMainBanks } from '../../data/sdk/storage/storage.gen';
import { UIBankExpanded, type UIBankExpandedProps } from '../../ui-new/bank/ui-bank-expanded';
import type { UIBankTabData } from '../../ui-new/bank/ui-bank-list';
import { BankEdit } from './bank-edit';
import type { MoveContainerValue } from '../move/move-container-fns';

type BankExpandedProps = Pick<UIBankExpandedProps, keyof UIBankTabData<MoveContainerValue> | 'selected'>;

export const BankExpanded: React.FC<BankExpandedProps> = ({ id, selected, ...rest }) => {
    const banksQuery = useStorageGetMainBanks();
    const bankDeleteMutation = useStorageDeleteMainBank();
    const boxesQuery = useStorageGetBoxes();

    const bankList = banksQuery.data?.data ?? [];
    const bank = bankList.find(item => item.id === id);

    const boxes = boxesQuery.data?.data.filter(box => box.bankId === bank?.id).map(box => box.idInt) ?? [];

    const pkmsCountQuery = usePkmVariantIndex(data => {
        return boxes.map(boxId => Object.values(data.data.byBox[ boxId ] ?? {}).flat()).flat().length;
    });
    const pkmsCount = pkmsCountQuery.data ?? 0;

    const loading = [ banksQuery, boxesQuery, pkmsCountQuery ].some(query => query.isLoading);

    const canEdit = !!bank && !bank.isExternal;
    const canDelete = bankList.length > 1 && (canEdit || pkmsCount === 0);

    return <UIBankExpanded
        key={id}
        id={id}
        {...rest}
        selected={selected}
        loading={loading}
        onDelete={canDelete
            ? (() => bankDeleteMutation.mutateAsync({ bankId: id }))
            : undefined}
        boxCount={boxes.length}
        pkmCount={pkmsCount}
        editDropdown={canEdit && <BankEdit bankId={id} />}
    />;
};
