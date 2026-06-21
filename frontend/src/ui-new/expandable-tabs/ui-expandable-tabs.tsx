import { ActionIcon, Stack, Tabs, type TabsProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React from 'react';
import { useControls } from '../interaction/controls/use-controls';
import { getBackControl } from '../interaction/focus-controls/common-controls/back-controls';
import type { FocusScopeId } from '../interaction/focus/provider/focus-context';
import { Focus } from '../interaction/focus/provider/use-focus-context';
import { FocusScope } from '../interaction/focus/scope/focus-scope';
import { useFocusScopeContext } from '../interaction/focus/scope/use-focus-scope-context';
import { ScrollerControlled, type ScrollerControlledProps } from '../scroller-controlled/scroller-controlled';

export type UIExpandableTabsData = {
    id: string;
    label: React.ReactNode;
};

type Params<D extends UIExpandableTabsData> = {
    item: D;
    i: number;
    selected: boolean;
    select: () => void;
};

type Options = {
    expand: () => void;
    reduce: () => void;
};

type UIExpandableTabsOwnProps<D extends UIExpandableTabsData> = {
    value: D[ 'id' ];
    data: D[];
    onChange: (id: D[ 'id' ]) => void;
    renderTab: (params: Params<D>, opt: Options) => React.ReactNode;
    renderExpanded?: (params: Params<D>[], opt: Options) => React.ReactNode;
    left?: React.ReactNode;
    right?: React.ReactNode;
    grow?: boolean;
};

export type UIExpandableTabsProps<D extends UIExpandableTabsData> =
    UIExpandableTabsOwnProps<D>
    & Pick<ScrollerControlledProps, 'id' | 'level' | 'controlsEnabled' | 'controlsLabel'>
    & Omit<TabsProps, keyof UIExpandableTabsOwnProps<D>>
    & {
        controlsDetailsLabel?: string;
        expanded?: boolean;
    };

export function UIExpandableTabs<D extends UIExpandableTabsData = UIExpandableTabsData>({
    id, level, controlsEnabled, controlsLabel, controlsDetailsLabel, expanded: forcedExpanded,
    value, data, onChange, renderTab, renderExpanded,
    left, right, grow = true,
    ...tabsProps
}: UIExpandableTabsProps<D>) {
    const [ expandedInner, setExpanded ] = React.useState(false);

    const [ scopeId ] = React.useState((): FocusScopeId => `expandable-tabs_${self.crypto.randomUUID()}`);

    const expanded = forcedExpanded ?? expandedInner;

    const tabsRef = React.useRef<HTMLDivElement>(null);

    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

    const currentScopeActive = Focus.useIsScopeActive(parentScope.scopeId);
    const expandedScopeActive = Focus.useIsScopeActive(scopeId);

    controlsEnabled &&= currentScopeActive;
    const expandEnabled = controlsEnabled && !!controlsDetailsLabel && !!renderExpanded;

    // console.log('scroller', id, parentScope, expandEnabled, controlsEnabled, !!controlsDetailsLabel, !!renderExpanded);

    const tabsDetailedName = 'tabs-detailed-' + id;

    const { controlProps } = useControls(
        id + '-detailed',
        true,
        order,
        React.useMemo(() => [
            expandedInner && getBackControl({
                label: 'Back',
                action: () => {
                    setExpanded(false);
                },
            }),
            controlsDetailsLabel && {
                name: tabsDetailedName,
                label: controlsDetailsLabel,
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: level === 1
                            ? [ 'LB', 'RB' ]
                            : [ 'LT', 'RT' ],
                        allowPressedSuite: 4,
                    },
                },
                spread: true,
                action: () => {
                    setExpanded(value => !value)
                },
            }
        ], [ controlsDetailsLabel, expandedInner, level, tabsDetailedName ]),
        {
            enabled: expandEnabled || expandedScopeActive,
        },
    );

    const ref = useMergedRef(
        tabsRef,
        controlProps(tabsDetailedName, 'back').ref,
        tabsProps.ref
    );

    React.useEffect(() => {
        const selectedTab = tabsRef.current?.querySelector<HTMLButtonElement>('button[role="tab"][data-active="true"]');

        selectedTab?.scrollIntoView({
            behavior: 'instant',
            block: 'center',
            inline: 'center',
        });
    }, [ value ]);

    return <Tabs
        {...controlProps(tabsDetailedName, 'back')}
        value={value.toString()}
        onChange={tabId => tabId && onChange(tabId)}
        miw={0}
        {...tabsProps}
        ref={ref}
        style={{
            flexGrow: grow ? 1 : undefined,
            ...tabsProps.style,
        }}
    >
        <Stack gap={0}>
            <Tabs.List
                style={{
                    flexGrow: 1,
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                    gap: 'var(--mantine-spacing-md)',
                }}
            >
                {left}

                <ScrollerControlled
                    id={id} level={level} controlsEnabled={controlsEnabled}
                    controlsLabel={controlsLabel}
                    opacity={expanded ? 0.5 : undefined}
                >
                    {data.map((item, i) => renderTab(
                        {
                            item,
                            i,
                            selected: item.id === value,
                            select: () => onChange(item.id),
                        },
                        {
                            expand: () => setExpanded(true),
                            reduce: () => setExpanded(false),
                        },
                    ))}
                </ScrollerControlled>

                {renderExpanded && <ActionIcon
                    variant='subtle'
                    size='sm'
                    p='xs'
                    mih='1lh'
                    ml={grow ? 'auto' : undefined}
                    onClick={() => setExpanded(value => !value)}
                    color='currentcolor'
                    disabled={forcedExpanded !== undefined}
                >
                    {expanded
                        ? <ChevronUpIcon />
                        : <ChevronDownIcon />}
                </ActionIcon>}

                {right}
            </Tabs.List>

            {expanded && renderExpanded && <FocusScope id={scopeId}>
                {renderExpanded(
                    data.map((item, i) => ({
                        item,
                        i,
                        selected: item.id === value,
                        select: () => onChange(item.id),
                    })),
                    {
                        expand: () => setExpanded(true),
                        reduce: () => setExpanded(false),
                    },
                )}
            </FocusScope>}
        </Stack>
    </Tabs>;
};
