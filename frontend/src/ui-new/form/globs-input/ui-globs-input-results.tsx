import { css } from '@emotion/css';
import { Accordion, Group } from '@mantine/core';
import { ListIcon } from 'lucide-react';
import React from 'react';
import { UIPathLine } from '../../path/ui-path-line';

export type UIGlobsInputResultsProps = {
    data: string[];
    showFiles: boolean;
    isLoading?: boolean;
    hasError?: boolean;
};

export const UIGlobsInputResults: React.FC<UIGlobsInputResultsProps> = ({ data, showFiles, isLoading, hasError }) => {

    return <Accordion.Item value='results'>
        <Accordion.Control>
            <Group wrap='nowrap' pr='md'>
                <ListIcon />

                <div className={css({ flexGrow: 1, lineBreak: 'anywhere' })}>
                    All results
                </div>

                <Group
                    c={hasError ? 'red' : undefined}
                    wrap='nowrap'
                    ml='auto'
                >
                    {/* {hasError && <Icon name='exclamation-triangle' solid forButton />} */}
                    {isLoading
                        ? '...'
                        : hasError
                            ? 'error'
                            : `${data.length} files found`}
                </Group>
            </Group>
        </Accordion.Control>

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
    </Accordion.Item>;
};
