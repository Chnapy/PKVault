import type React from 'react';
import { useTranslate } from '../translate/i18n';
import { ButtonExternalLink } from '../ui/button/button';
import { Icon } from '../ui/icon/icon';
import { useCheckUpdate } from './hooks/use-check-update';
import { css } from '@emotion/css';

export const HasUpdateWarning: React.FC = () => {
    const { t } = useTranslate();

    const updateVersion = useCheckUpdate();
    if (!updateVersion) {
        return null;
    }

    return <tr>
        <td>
            {t('notifications.warnings.update', {
                version: updateVersion
            })}
        </td>
        <td className={css({ verticalAlign: 'top' })}>
            <ButtonExternalLink href='https://projectpokemon.org/home/files/file/5766-pkvault/' target='__blank'>
                <Icon name='external-link' solid forButton />
            </ButtonExternalLink>
        </td>
    </tr>;
};
