import { Tabs, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { UIExpandableTabs, type UIExpandableTabsData, type UIExpandableTabsProps } from '../../expandable-tabs/ui-expandable-tabs';
import { useCurrentPanel } from '../../storage/storage-content/context/ui-panel-context';

export type UISubHeaderTabsData = UIExpandableTabsData & {
    to?: string;
    search?: object;
};

export type UISubHeaderProps<D extends UISubHeaderTabsData> =
    & Pick<UIExpandableTabsProps<D>, 'data' | 'value' | 'onChange' | 'controlsLabel' | 'controlsDetailsLabel' | 'renderExpanded' | 'left'>;

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
        renderTab={({ item }) => <Tabs.Tab
            key={item.id}
            renderRoot={item.to
                ? (props => <Link
                    to={item.to}
                    search={(oldSearch) => {
                        // remove all search params
                        const clearedSearch = Object.fromEntries(Object.keys(oldSearch).map(key => [ key, undefined ]));

                        return {
                            ...clearedSearch,
                            ...item.search,
                        } as never;
                    }}
                    {...props}
                />)
                : undefined}
            color='primary.6'
            value={item.id}
            py={0}
        >
            <Text display='flex' style={{ alignItems: 'center' }}>
                {item.label}
            </Text>
        </Tabs.Tab>}
        {...props}
    />;
};
