import type React from 'react';
import { theme } from '../theme';

export const Header: React.FC<React.PropsWithChildren> = ({ children }) => {

    return (
        <div
            style={{
                display: 'flex',
                marginBottom: 0,
                alignItems: 'flex-start',
                position: 'sticky',
                top: 0,
                zIndex: 10,
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
                        height: 48,
                        width: 48,
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
                    boxShadow: `0 2px 0 rgba(0,0,0,0.2), inset rgba(0, 0, 0, 0.2) -2px 2px 0px`,
                }}
            >
                {children}
            </div>
        </div>
    );
};
