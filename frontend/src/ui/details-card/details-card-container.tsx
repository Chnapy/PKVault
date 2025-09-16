import React from 'react';
import { Container } from '../container/container';
import { Button } from '../button/button';
import { theme } from '../theme';
import { TextContainer } from '../text-container/text-container';
import { Icon } from '../icon/icon';
import { css } from '@emotion/css';

export type DetailsCardContainerProps = {
    title: React.ReactNode;
    mainImg: React.ReactNode;
    mainInfos: React.ReactNode;
    preContent: React.ReactNode;
    content: React.ReactNode;
    extraContent?: React.ReactNode;
    actions: React.ReactNode;
    onClose: () => void;
    showFullDetails?: boolean;
};

export const DetailsCardContainer: React.FC<DetailsCardContainerProps> = ({
    title,
    mainImg,
    mainInfos,
    preContent,
    content,
    extraContent,
    actions,
    onClose,
    showFullDetails
}) => {
    const [ showDetails, setShowDetails ] = React.useState(false);

    const finalShowDetails = showFullDetails !== undefined ? showFullDetails : showDetails;

    return (
        <Container padding="big" borderRadius="big" style={{
            display: "flex",
            flexDirection: 'column',
            gap: 4,
            backgroundColor: theme.bg.contrast,
            borderColor: theme.border.contrast,
            color: theme.text.light,
        }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    paddingLeft: 4,
                }}
            >
                {title}

                <Button
                    onClick={() => setShowDetails(value => !value)} disabled={showFullDetails !== undefined}
                    style={{ minWidth: '2lh' }}
                >
                    <Icon name={finalShowDetails ? 'angle-down' : 'angle-up'} forButton />
                </Button>

                <Button onClick={onClose}>
                    <Icon name='times' forButton />
                </Button>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    borderRadius: 8,
                    background: theme.bg.info,
                }}
            >
                <div style={{
                    display: "flex",
                    alignItems: 'flex-start',
                }}>
                    <div
                        style={{
                            position: 'relative',
                            padding: 4,
                            borderRadius: 8,
                            background: theme.bg.dark,
                        }}
                    >
                        {mainImg}
                    </div>

                    <TextContainer noWrap>
                        {mainInfos}
                    </TextContainer>
                </div>
            </div>

            {preContent}

            {finalShowDetails && <>
                <div
                    className={css({
                        '& > .text-container:first-child': {
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                        },
                        '& > .text-container + .text-container:not(:last-child)': {
                            paddingTop: 0,
                            borderRadius: 0,
                        },
                        '& > .text-container:last-child': {
                            paddingTop: 0,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                        },
                    })}
                >{content}</div>

                {extraContent}
            </>}

            {actions}
        </Container>
    );
};
