import { SettingsIcon } from 'lucide-react';
import type React from 'react';
import type { UIExpandableTabsData } from '../../expandable-tabs/ui-expandable-tabs';
import { UISubHeader, type UISubHeaderProps } from '../../layout/header/ui-sub-header';

type Data = UIExpandableTabsData;

type UISettingsCategoriesProps = Pick<UISubHeaderProps<Data>, 'data' | 'value' | 'onChange'>;

export const UISettingsCategories: React.FC<UISettingsCategoriesProps> = (props) => {
    return <UISubHeader<Data>
        controlsLabel='Change category'
        left={<SettingsIcon />}
        {...props}
    />;
};
