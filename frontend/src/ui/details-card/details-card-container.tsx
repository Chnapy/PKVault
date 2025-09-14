import React from 'react';
import { Container } from '../container/container';
import { Button } from '../button/button';
import { theme } from '../theme';
import { TextContainer } from '../text-container/text-container';
import { Icon } from '../icon/icon';

export type DetailsCardContainerProps = {
    header: React.ReactNode;
    title: React.ReactNode;
    mainImg: React.ReactNode;
    mainInfos: React.ReactNode;
    preContent: React.ReactNode;
    content: React.ReactNode;
    onClose: () => void;
};

export const DetailsCardContainer: React.FC<DetailsCardContainerProps> = ({
    header,
    title,
    mainImg,
    mainInfos,
    preContent,
    content,
    onClose
}) => {
    const [ showDetails, setShowDetails ] = React.useState(false);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    padding: '0 8px',
                }}
            >
                {header}
            </div>

            <Container padding="big" borderRadius="big" style={{
                display: "flex",
                flexDirection: 'column',
                gap: 4,
                backgroundColor: theme.bg.contrast,
                color: theme.text.light
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

                    <Button onClick={() => setShowDetails(value => !value)}>
                        <Icon name={showDetails ? 'angle-down' : 'angle-up'} forButton />
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
                        padding: 4,
                        background: theme.bg.info,
                    }}
                >
                    <div style={{
                        display: "flex",
                        alignItems: 'flex-start'
                    }}>
                        <div
                            style={{
                                position: 'relative',
                                marginLeft: -4,
                                marginTop: -4,
                                marginRight: 4,
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

                    {preContent}

                    {showDetails && content}
                </div>
            </Container>
        </div>
    );
};
