import type React from 'react';
import { theme } from '../theme';

export type FrameProps = {
    headerItems: React.ReactNode;
};

export const Frame: React.FC<React.PropsWithChildren<FrameProps>> = ({
    headerItems,
    children
}) => {

    return <div
        style={{
            backgroundColor: theme.bg.contrast,
            padding: 10,
            paddingRight: 0,    // +10 from scrollbar
            scrollbarWidth: 'thin',

            minHeight: "100vh",
            height: "100vh",
            boxSizing: 'border-box',
            overflowY: 'scroll',
            scrollbarColor: `${theme.bg.contrastdark} ${theme.bg.contrast}`,
            // border: '2px solid rgba(0, 0, 0, 0.2)'
        }}
    >
        <div
            style={{
                backgroundColor: theme.bg.app,
                backgroundImage: `radial-gradient(${theme.bg.appdark} 4px, ${theme.bg.app} 4px)`,
                backgroundSize: '40px 40px',

                minHeight: '100%',
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 16,
                border: `2px solid rgba(0, 0, 0, 0.2)`,
                scrollbarColor: 'initial',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    margin: -2,
                    marginBottom: 0,
                    alignItems: 'flex-start',
                }}
            >
                <div
                    style={{
                        backgroundColor: theme.bg.contrast,
                        display: 'flex',
                        padding: 8,
                        paddingTop: 0,
                        paddingLeft: 0,
                        gap: 16,
                        zIndex: 1,
                        boxShadow: `0 2px 0 rgba(0,0,0,0.2)`,
                    }}
                >
                    <img
                        src="/logo.svg"
                        style={{
                            height: 48
                        }}
                    />

                    <div>
                        <div
                            style={{
                                display: 'flex',
                                gap: 12
                            }}
                        >
                            <div style={{ backgroundColor: theme.game.red, borderRadius: 99, width: 12, height: 12 }} />
                            <div style={{ backgroundColor: theme.game.yellow, borderRadius: 99, width: 12, height: 12 }} />
                            <div style={{ backgroundColor: theme.game.emerald, borderRadius: 99, width: 12, height: 12 }} />
                        </div>
                        <div
                            style={{
                                fontSize: 24,
                                fontWeight: 'bold',
                                color: theme.text.light,
                                marginTop: 8,
                            }}
                        >
                            PKVault
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        overflow: 'hidden',
                        paddingLeft: 1,
                        marginLeft: -1,
                        marginRight: -150,
                        alignSelf: 'stretch',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: theme.bg.contrast,
                            height: '100%',
                            width: 150,
                            transform: 'rotate(-45deg)',
                            transformOrigin: 'bottom left',
                            // borderBottom: `2px solid ${theme.border.contrast}`,
                            boxShadow: `0 2px 0 rgba(0,0,0,0.1)`,
                            pointerEvents: 'none',
                        }}
                    />
                </div>

                <div
                    style={{
                        backgroundColor: theme.bg.contrastdark,
                        flexGrow: 1,
                        padding: 4,
                        display: 'flex',
                        paddingLeft: 64,
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: theme.text.light,
                        alignItems: 'center',
                        gap: 16,
                        boxShadow: `0 2px 0 rgba(0,0,0,0.2)`,
                    }}
                >
                    {headerItems}
                </div>
            </div>

            {/* <div style={{ height: 1600 }} /> */}
            {children}
        </div>
    </div>;
};
