import type React from 'react';
import { Route } from '../routes/settings';
import { useTranslate } from '../translate/i18n';
import { UISettingsCategories } from '../ui/settings/categories/ui-settings-categories';

export const SettingsSubMenu: React.FC = () => {
    const { t } = useTranslate();

    const navigate = Route.useNavigate();

    const currentValue = Route.useSearch({ select: search => search.subMenu ?? 'main' });

    return <UISettingsCategories
        value={currentValue}
        onChange={value => {
            navigate({
                search: {
                    subMenu: value as typeof currentValue,
                },
            });
        }}
        data={[
            {
                id: 'main' satisfies typeof currentValue,
                label: t('settings.sub.main'),
            },
            {
                id: 'external-pkms' satisfies typeof currentValue,
                label: t('settings.sub.external'),
            },
            {
                id: 'backups' satisfies typeof currentValue,
                label: t('settings.sub.backups'),
            },
            {
                id: 'about' satisfies typeof currentValue,
                label: t('settings.sub.about'),
            },
        ]}
    />;
};
