import { Accordion, Group } from '@mantine/core';
import { AlertCircleIcon, FileIcon, ListIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { UIPathLine } from '../../path/ui-path-line';

export type UIGlobsInputResultsProps = {
    name: string;
    data: string[];
    showFiles: boolean;
    isLoading?: boolean;
    hasError?: boolean;
};

export const UIGlobsInputResults: React.FC<UIGlobsInputResultsProps> = ({ name, data, showFiles, isLoading, hasError }) => {
    const { t } = useTranslate();

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        controls: [
            data.length > 0 && getSelectControl({
                main: false,
                label: t('action.select'),
            }),
        ],
    });

    return <Accordion variant='contained'>
        <Accordion.Item {...focusProps} value='results'>
            <WithControlsIcons placement='out' icons={controlIcons('open')}
                as={Accordion.Control} {...controlProps('open')}>
                <Group wrap='nowrap' pr='md'>
                    <ListIcon />

                    <div style={{ flexGrow: 1, lineBreak: 'anywhere' }}>
                        {t('settings.form.globs.results')}
                    </div>

                    <Group
                        c={hasError ? 'red' : undefined}
                        wrap='nowrap'
                        ml='auto'
                    >
                        <Group
                            c={hasError ? 'red' : undefined}
                            wrap='nowrap'
                            gap='sm'
                        >
                            <FileIcon />
                            {hasError
                                ? '-'
                                : data.length}
                        </Group>

                        {hasError && <AlertCircleIcon />}
                    </Group>
                </Group>
            </WithControlsIcons>

            {showFiles && data.length > 0 && <Accordion.Panel>
                <pre style={{
                    fontFamily: 'inherit',
                    maxHeight: 200,
                    overflow: 'auto',
                    padding: 4,
                    margin: 0,
                }}>
                    {!isLoading && data.map(path => <Group key={path}>
                        <UIPathLine>{path}</UIPathLine>
                    </Group>)}
                </pre>
            </Accordion.Panel>}
        </Accordion.Item>
    </Accordion>;
};
