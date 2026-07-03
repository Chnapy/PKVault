import type React from 'react';
import { Route } from '../routes/settings';
import { UISettingsCategories } from '../ui-new/settings/categories/ui-settings-categories';

export const SettingsSubMenu: React.FC = () => {
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
                id: 'main',
                label: 'Main',
            },
            {
                id: 'external-pkms',
                label: 'External pkms',
            },
            {
                id: 'backups',
                label: 'Backups',
            },
        ]}
    />;
};
