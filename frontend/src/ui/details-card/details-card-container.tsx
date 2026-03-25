import { css, cx } from '@emotion/css';
import { Button as HUIButton } from '@headlessui/react';
import React from 'react';
import type { MarkingColorUniversal } from '../../data/sdk/model';
import { Button } from '../button/button';
import { Container } from '../container/container';
import { Icon } from '../icon/icon';
import { Marking } from '../marking/marking';
import { TextContainer } from '../text-container/text-container';
import { theme } from '../theme';

// eslint-disable-next-line react-refresh/only-export-components
export const detailsExpandedStateValues = [ 'none', 'expanded', 'expanded-max' ] as const;
export type DetailsExpandedState = typeof detailsExpandedStateValues[ number ];

export type DetailsCardContainerProps = {
    tabs?: React.ReactNode;
    bgColor?: string;
    title: React.ReactNode;
    mainImg: React.ReactNode;
    markings?: MarkingColorUniversal[];
    mainInfos: React.ReactNode;
    preContent: React.ReactNode;
    content: React.ReactNode;
    extraContent?: React.ReactNode;
    actions: React.ReactNode;
    onClose: () => void;
    expanded: DetailsExpandedState;
    setExpanded: ((state: DetailsExpandedState) => void) | undefined;
};

export const DetailsCardContainer: React.FC<DetailsCardContainerProps> = ({
    tabs,
    bgColor,
    title,
    mainImg,
    markings = [],
    mainInfos,
    preContent,
    content,
    extraContent,
    actions,
    onClose,
    expanded,
    setExpanded,
}) => {
    return (
        <div
            className={cx(css({
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }), {
                [ css({
                    maxWidth: '100%',
                }) ]: expanded === 'expanded-max'
            })}
        >
            {tabs && <div
                className={css({
                    display: 'flex',
                    columnGap: 4,
                    padding: '0 8px',
                    marginLeft: 16,
                    flexWrap: 'wrap-reverse',
                    width: expanded === 'expanded-max' ? 682 : 334,
                })}
            >
                {tabs}
            </div>}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    overflowY: 'auto',
                }}
            >
                <HUIButton
                    style={{
                        width: 16,
                        background: 'red',
                        marginTop: 8,
                        marginBottom: 8,
                    }}
                    onClick={setExpanded && (() => {
                        switch (expanded) {
                            case 'expanded-max': return setExpanded('expanded');
                            default: return setExpanded('expanded-max');
                        }
                    })}
                    disabled={!setExpanded}
                >
                    {'<'}
                </HUIButton>

                <Container padding="big" borderRadius="big" className={cx(
                    css({
                        width: 334,
                        display: "flex",
                        flexDirection: 'column',
                        gap: 4,
                        backgroundColor: bgColor ?? theme.bg.contrast,
                        borderColor: bgColor ?? theme.border.contrast,
                        color: theme.text.light,
                        overflowY: 'auto',
                    }),
                    {
                        [ css({
                            '& > .text-container': {
                                flexShrink: 0,
                                flexGrow: 0,
                            },
                            '& > :not(.text-container-stick) + .text-container-stick': {
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                            },
                            '& > .text-container-stick + .text-container-stick:not(:nth-last-child(1 of .text-container-stick))': {
                                marginTop: -4,
                                paddingTop: 0,
                                borderRadius: 0,
                            },
                            '& > :nth-last-child(1 of .text-container-stick)': {
                                marginTop: -4,
                                paddingTop: 0,
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                            },
                        }) ]: expanded === 'expanded',

                        [ css({
                            minWidth: 682,
                            width: 'initial',
                            flexWrap: 'wrap',
                            height: 'calc(100vh - 150px)',  // required for auto-width
                            '& > *': {
                                maxWidth: 334,
                            },
                        }) ]: expanded === 'expanded-max',
                    }
                )}>
                    <div className={css({
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                    })}>
                        <div
                            className={css({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                paddingLeft: 4,
                            })}
                        >
                            <div className={css({
                                flexGrow: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                overflow: 'hidden'
                            })}>
                                {title}
                            </div>

                            <Button
                                onClick={setExpanded && (() => {
                                    switch (expanded) {
                                        case 'none': return setExpanded('expanded');
                                        default: return setExpanded('none');
                                    }
                                })}
                                disabled={!setExpanded}
                                className={css({ minWidth: '2lh' })}
                            >
                                <Icon name={expanded === 'none' ? 'angle-up' : 'angle-down'} forButton />
                            </Button>

                            <Button onClick={onClose}>
                                <Icon name='times' forButton />
                            </Button>
                        </div>

                        {(mainImg || mainInfos) && <div
                            className={css({
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                                borderRadius: 8,
                                background: theme.bg.blue,
                            })}
                        >
                            <div className={css({
                                display: "flex",
                                alignItems: 'stretch',
                            })}>
                                <div className={css({
                                    alignSelf: 'flex-start',
                                    display: "flex",
                                    flexDirection: 'column',
                                    background: theme.bg.dark,
                                    borderRadius: 8,
                                })}>
                                    <div
                                        className={css({
                                            padding: 4,
                                            borderRadius: 8,
                                            alignSelf: 'flex-start',
                                        })}
                                    >
                                        <div
                                            className={css({
                                                position: 'relative',
                                            })}
                                        >
                                            {mainImg}
                                        </div>
                                    </div>

                                    {markings.length > 0 && <div className={css({
                                        display: 'flex',
                                        alignItems: 'center',
                                        columnGap: 4,
                                        margin: 4,
                                        marginTop: 0,
                                        padding: 4,
                                        borderRadius: 8,
                                        backgroundColor: theme.bg.default,
                                        fontSize: 10,
                                        justifyContent: 'space-evenly',
                                    })}>
                                        {markings.map((mark, i) => <Marking
                                            key={i}
                                            index={i}
                                            mark={mark}
                                        />)}
                                    </div>}
                                </div>

                                <TextContainer noWrap>
                                    {mainInfos}
                                </TextContainer>
                            </div>
                        </div>}
                    </div>

                    {preContent}

                    {expanded !== 'none' && <>
                        {content}

                        {extraContent}
                    </>}

                    {actions}
                </Container>
            </div>
        </div>
    );
};
