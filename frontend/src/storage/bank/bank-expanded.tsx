import type React from 'react';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import { useStorageDeleteMainBank, useStorageGetBoxes, useStorageGetMainBanks } from '../../data/sdk/storage/storage.gen';
import { UIBankExpanded, type UIBankExpandedProps } from '../../ui-new/bank/ui-bank-expanded';
import type { UIBankTabData } from '../../ui-new/bank/ui-bank-list';
import { BankEdit } from './bank-edit';
import type { MoveContainerValue } from '../move/state/move-select-impl-provider';

type BankExpandedProps = Pick<UIBankExpandedProps, keyof UIBankTabData<MoveContainerValue> | 'onSelect' | 'selected'>;

export const BankExpanded: React.FC<BankExpandedProps> = ({ id, selected, onSelect, ...rest }) => {
    const banksQuery = useStorageGetMainBanks();
    const bankDeleteMutation = useStorageDeleteMainBank();
    const boxesQuery = useStorageGetBoxes();
    const pkmsQuery = usePkmVariantIndex();

    const loading = [ banksQuery, boxesQuery, pkmsQuery ].some(query => query.isLoading);

    const bankList = banksQuery.data?.data ?? [];
    const bank = bankList.find(item => item.id === id);

    const boxes = boxesQuery.data?.data.filter(box => box.bankId === bank?.id).map(box => box.idInt) ?? [];
    const pkms = boxes.map(boxId => Object.values(pkmsQuery.data?.data.byBox[ boxId ] ?? {}).flat()).flat();

    const canEdit = !!bank && !bank.isExternal;
    const canDelete = bankList.length > 1 && (canEdit || pkms.length === 0);

    return <UIBankExpanded
        key={id}
        id={id}
        {...rest}
        selected={selected}
        loading={loading}
        onSelect={onSelect}
        onDelete={canDelete
            ? (() => bankDeleteMutation.mutateAsync({ bankId: id }))
            : undefined}
        boxCount={boxes.length}
        pkmCount={pkms.length}
        editDropdown={canEdit && <BankEdit bankId={id} />}
    />;
};
