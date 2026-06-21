import type React from 'react';
import { useStorageCreateMainBank, useStorageGetMainBanks } from '../../data/sdk/storage/storage.gen';
import { UIBankList, type UIBankTabData } from '../../ui-new/bank/ui-bank-list';
import { BankContext } from './bank-context';
import type { MoveContainerValue } from '../move/move-container-fns';
import { BankExpanded } from './bank-expanded';

export const BankList: React.FC = () => {
    const banksQuery = useStorageGetMainBanks();

    const bankCreateMutation = useStorageCreateMainBank();

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const selectBankProps = BankContext.useSelectBankProps();

    const bankList = [ ...banksQuery.data?.data ?? [] ].sort((b1, b2) => b1.order < b2.order ? -1 : 1);

    return <UIBankList
        value={selectedBankBoxes.data?.selectedBank.id ?? ''}
        data={bankList.map(({ id, name, isDefault, isExternal }): UIBankTabData<MoveContainerValue> => {
            return {
                id,
                container: {
                    type: 'bank',
                    bankId: id,
                },
                label: name,
                isDefault,
                isExternal,
                ...selectBankProps(id),
            };
        })}
        onCreate={() => bankCreateMutation.mutateAsync()}
        onChange={console.log}
        renderExpanded={(data) =>
            data.map(({ item, selected }) => <BankExpanded
                key={item.id}
                {...item}
                selected={selected}
            />)}
    />;
};
