import { SettingsIcon } from 'lucide-react';
import type React from 'react';
import type { UIExpandableTabsData } from '../../expandable-tabs/ui-expandable-tabs';
import { UISubHeader, type UISubHeaderProps } from '../../layout/header/sub-header/ui-sub-header';
import { useTranslate } from '../../../translate/i18n';

type Data = UIExpandableTabsData;

type UISettingsCategoriesProps = Pick<UISubHeaderProps<Data>, 'data' | 'value' | 'onChange'>;

export const UISettingsCategories: React.FC<UISettingsCategoriesProps> = (props) => {
    const { t } = useTranslate();

    return <UISubHeader<Data>
        controlsLabel={t('settings.sub.controls-label')}
        left={<SettingsIcon />}
        {...props}
    />;
};
