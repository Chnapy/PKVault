import { css, cx } from '@emotion/css';
import React from 'react';
import { Container } from '../container/container';
import { TextContainer } from '../text-container/text-container';
import { TextContainerSticker } from '../text-container/text-container-sticker';
import { theme } from '../theme';
import { DetailsCardHeader, type DetailsCardHeaderProps } from './details-card-header';

export type DetailsExpandedState = 'none' | 'expanded' | 'expanded-max';

export type DetailsCardContainerProps = DetailsCardHeaderProps
    & {
        tabs?: React.ReactNode;
        bgColor?: string;
        mainImg: React.ReactNode;
        mainImgSub?: React.ReactNode;
        mainInfos: React.ReactNode;
        preContent: React.ReactNode;
        content: React.ReactNode;
        actions: React.ReactNode;
    };

const widths = {
    reduced: 324,
    mid: 400,
    expandedMax: 672,
};

export const DetailsCardContainer: React.FC<DetailsCardContainerProps> = ({
    tabs,
    bgColor,
    title,
    mainImg,
    mainImgSub,
    mainInfos,
    preContent,
    content,
    actions,
    onClose,
    expanded,
    setExpanded,
}) => {
    return (
        <div
            className={css({
                maxWidth: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            })}
        >
            {tabs && <div
                className={css({
                    width: 'min-content',
                    minWidth: '100%',

                    display: 'flex',
                    columnGap: 4,
                    padding: '0 8px',
                    flexWrap: 'wrap-reverse',
                })}
            >
                {tabs}
            </div>}

            <div className={css({
                display: 'flex',
                justifyContent: 'flex-end',
                overflowY: 'hidden',
            })}>
                <Container padding="big" borderRadius="big" className={css({
                    display: "flex",
                    flexDirection: 'column',
                    gap: 4,
                    backgroundColor: bgColor ?? theme.bg.contrast,
                    borderColor: bgColor ?? theme.border.contrast,
                    color: theme.text.light,
                    paddingRight: 0,
                })}>
                    <DetailsCardHeader
                        title={title}
                        expanded={expanded}
                        setExpanded={setExpanded}
                        onClose={onClose}
                    />

                    <div className={cx(
                        css({
                            width: widths.reduced,
                            minWidth: widths.reduced,
                            display: "flex",
                            flexDirection: 'column',
                            gap: 4,
                            overflowY: 'auto',
                            paddingRight: 4,
                        }),
                        {
                            [ css({
                                width: 'initial',
                                flexWrap: 'wrap',
                                maxHeight: 'calc(100vh - 150px)',  // required for auto-width

                                '& > *': {
                                    flexGrow: 0,
                                    flexShrink: 0,
                                    maxWidth: widths.mid,
                                },
                            }) ]: expanded === 'expanded-max',
                        }
                    )}>

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
                                    width: 104,
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

                                    {mainImgSub && <div className={css({
                                        margin: 4,
                                        marginTop: 0,
                                        borderRadius: 8,
                                        backgroundColor: theme.bg.default,
                                    })}>
                                        {mainImgSub}
                                    </div>}
                                </div>

                                <TextContainer noWrap>
                                    {mainInfos}
                                </TextContainer>
                            </div>
                        </div>}

                        {preContent}

                        {expanded === 'expanded' && <TextContainerSticker gap={4}>
                            {content}
                        </TextContainerSticker>}

                        {expanded === 'expanded-max' && content}

                        {actions}
                    </div>
                </Container>
            </div>
        </div>
    );
};
