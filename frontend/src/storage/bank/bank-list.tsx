import { css } from '@emotion/css';
import type React from 'react';
import { useStorageCreateMainBank, useStorageGetMainBanks } from '../../data/sdk/storage/storage.gen';
import { HelpButton } from '../../help/help-button';
import { Button } from '../../ui/button/button';
import { Container } from '../../ui/container/container';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { BankItem } from './bank-item';

export const BankList: React.FC = () => {
    const banksQuery = useStorageGetMainBanks();
    const bankCreateMutation = useStorageCreateMainBank();

    const bankList = banksQuery.data?.data ?? [];

    return <Container
        className={css({
            width: 'calc(100vw - 20px)',
            position: 'relative',
            top: -28,
            display: 'flex',
            gap: 16,
            padding: 24,
            paddingBottom: 16,
            backgroundColor: theme.bg.light,
            borderRadius: 0,
            borderLeft: 0,
            borderRight: 0,
            borderTop: 0,
        })}
    >
        <div className={css({
            fontSize: '150%',
            marginTop: 16,
            textAlign: 'right',
        })}>
            <Icon name='bank' solid />
        </div>

        <div className={css({
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 16,
        })}>
            {bankList.map(bank => <BankItem
                key={bank.id}
                bankId={bank.id}
            />)}

            <Button bgColor={theme.bg.primary} big onClick={() => bankCreateMutation.mutateAsync()} className={css({ minHeight: 56, order: 999 })}>
                <Icon name='plus' solid forButton />
            </Button>
        </div>

        <div className={css({
            display: 'flex',
            alignItems: 'center',
            minWidth: 24,
        })}>
            <HelpButton slug='3-storage.md#banks-and-boxes' />
        </div>
    </Container>;
};
