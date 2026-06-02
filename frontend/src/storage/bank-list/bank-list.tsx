import type React from 'react';
import { useStorageCreateMainBank, useStorageGetMainBanks } from '../../data/sdk/storage/storage.gen';
import { UIBankList, type UIBankTabData } from '../../ui-new/bank/ui-bank-list';
import { BankContext } from '../bank/bank-context';

export const BankList: React.FC = () => {
    const banksQuery = useStorageGetMainBanks();
    const bankCreateMutation = useStorageCreateMainBank();

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const selectBankProps = BankContext.useSelectBankProps();

    const bankList = banksQuery.data?.data ?? [];

    return <UIBankList
        value={selectedBankBoxes.data?.selectedBank.id ?? ''}
        data={bankList.map(({ id, name }): UIBankTabData => ({
            id,
            label: name,
            boxCount: -1,
            pkmCount: -1,
            ...selectBankProps(id),
        }))}
        onCreate={() => bankCreateMutation.mutateAsync()}
        onChange={console.log}
        onDelete={console.log}
    />;
};
