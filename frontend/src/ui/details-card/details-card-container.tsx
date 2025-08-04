import React from 'react';
import { Container } from '../container/container';
import { Button } from '../button/button';
import { theme } from '../theme';
import { TextContainer } from '../text-container/text-container';

export type DetailsCardContainerProps = {
    mainImg: React.ReactNode;
    mainInfos: React.ReactNode;
    preContent: React.ReactNode;
    content: React.ReactNode;
    actions: React.ReactNode;
    onClose: () => void;
};

export const DetailsCardContainer: React.FC<DetailsCardContainerProps> = ({
    mainImg,
    mainInfos,
    preContent,
    content,
    actions,
    onClose
}) => {
    const [ showDetails, setShowDetails ] = React.useState(false);

    return (
        <Container padding="big" borderRadius="big" style={{ display: "block" }}>
            <Button
                onClick={onClose}
                style={{
                    float: 'right',
                    marginTop: -33
                }}
            >Close</Button>

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
                <div style={{ display: "flex" }}>
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

                <Button onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? "Hide" : "Show"} details
                </Button>

                {showDetails && content}
            </div>

            {actions && <div
                style={{
                    display: "flex",
                    gap: 4,
                    padding: 4,
                }}
            >
                {actions}
            </div>}
        </Container>
    );
};
