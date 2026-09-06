import { UIExpandableTabs, type UIExpandableTabsData, type UIExpandableTabsProps } from '../../../expandable-tabs/ui-expandable-tabs';
import { useCurrentPanel } from '../../../storage/storage-content/context/ui-panel-context';
import { UISubHeaderTab } from './ui-sub-header-tab';

export type UISubHeaderTabsData = UIExpandableTabsData & {
    to?: string;
    search?: object;
};

export type UISubHeaderProps<D extends UISubHeaderTabsData> =
    & Pick<UIExpandableTabsProps<D>, 'data' | 'value' | 'onChange' | 'controlsLabel' | 'controlsDetailsLabel' | 'renderExpanded' | 'left'>
    & Partial<Pick<UIExpandableTabsProps<D>, 'renderTab'>>;

export function UISubHeader<D extends UISubHeaderTabsData = UISubHeaderTabsData>(props: UISubHeaderProps<D>) {
    const { isInCurrentPanel } = useCurrentPanel();

    return <UIExpandableTabs
        id='sub-header'
        level={2}
        controlsEnabled={isInCurrentPanel}
        variant="pills"
        grow={false}
        __vars={{
            '--mantine-color-body': 'var(--mantine-color-primary-7)',
        }}
        renderTab={({ item }) => <UISubHeaderTab
            key={item.id}
            {...item}
        />}
        {...props}
    />;
};
