import type React from 'react';
import { useStorageCreateMainBank, useStorageGetMainBanks } from '../../data/sdk/storage/storage.gen';
import { Button } from '../../ui/button/button';
import { Container } from '../../ui/container/container';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { BankItem } from './bank-item';

export const BankList: React.FC = () => {
    const banksQuery = useStorageGetMainBanks();
    const bankCreateMutation = useStorageCreateMainBank();

    const bankList = [ ...banksQuery.data?.data ?? [] ].sort((b1, b2) => b1.order < b2.order ? -1 : 1);

    return <Container
        style={{
            width: 'calc(100vw - 20px)',
            position: 'relative',
            top: -28,
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 16,
            padding: 8,
            backgroundColor: theme.bg.light,
            borderRadius: 0,
            borderLeft: 0,
            borderRight: 0,
            borderTop: 0,
        }}
    >
        {bankList.map(bank => <BankItem
            key={bank.id}
            bankId={bank.id}
        />)}

        <Button bgColor={theme.bg.primary} big onClick={() => bankCreateMutation.mutateAsync()}>
            <Icon name='plus' solid forButton />
        </Button>
    </Container>;
};
