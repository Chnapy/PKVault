import { Container, Grid, Stack } from '@mantine/core';
import { doesFocusableExist, getCurrentFocusKey } from '@noriginmedia/norigin-spatial-navigation-core';
import React from 'react';
import { ErrorCatcher } from '../../../error/error-catcher';
import { Focus } from '../../interaction/focus/provider/use-focus-context';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UIFrame } from '../frame/ui-frame';

type UIAppLayoutProps = {
    header: React.ReactNode;
    bottom: React.ReactNode;
    footer: React.ReactNode;
    children: React.ReactNode;
};

export const UIAppLayout: React.FC<UIAppLayoutProps> = ({ header, bottom, footer, children }) => {
    const restoreFocus = Focus.useRestoreScopeFocus();

    React.useEffect(() => {
        const currentKey = getCurrentFocusKey();
        if (!currentKey || !doesFocusableExist(currentKey)) {
            restoreFocus('root');
        }
    }, [ header, bottom, footer, children, restoreFocus ]);

    return <UIFrame>
        <ErrorCatcher>
            {header}

            <UISpriteSizeWrapper<typeof Container>
                component={Container}
                speciesSize='md'
                fluid style={{ overflow: 'hidden', flexGrow: 1 }} w='100%' p='md'>
                <Stack h='100%'>
                    {children}

                    <Grid grow>
                        <Grid.Col span='auto'>
                            {bottom}
                        </Grid.Col>
                    </Grid>
                </Stack>
            </UISpriteSizeWrapper>

            {footer}
        </ErrorCatcher>
    </UIFrame>;
};
