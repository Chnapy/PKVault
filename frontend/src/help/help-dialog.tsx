import { css } from '@emotion/css';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import React from 'react';
import { Route } from '../routes/__root';
import { useTranslate } from '../translate/i18n';
import { ButtonLike } from '../ui/button/button-like';
import { TitledContainer } from '../ui/container/titled-container';
import { Icon } from '../ui/icon/icon';
import { HelpDialogContent } from './help-dialog-content';
import { HelpDialogMenu } from './help-dialog-menu';
import { useHelpMenuItems } from './hooks/use-help-menu-items';
import { useHelpNavigate } from './hooks/use-help-navigate';

export const HelpDialog: React.FC = () => {
    const { t } = useTranslate();

    const helpPath = Route.useSearch({ select: search => search.help ?? '' });
    const helpNavigate = useHelpNavigate();

    const [ helpHash, helpAnchor ] = helpPath.split('#');

    const { language, menuItems } = useHelpMenuItems();

    const menuItem = menuItems.find(item => item.endPath === helpHash) ?? menuItems[ 0 ]!;

    const selectedEndPath = menuItem.endPath;

    const finalSelectedPath = `/docs/${language}/${selectedEndPath}`;

    const onClose = () => helpNavigate(undefined);

    return (
        <Dialog
            className={css({
                position: 'relative',
                zIndex: 50,
            })}
            open={!!helpPath}
            // unmount={false}
            onClose={onClose}
        >
            <DialogBackdrop
                className={css({
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.25)'
                })}
            />

            <div
                className={css({
                    zIndex: 10,
                    position: 'fixed',
                    width: '100%',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 16,
                })}
            >
                <DialogPanel
                    className={css({
                        width: 768,
                        height: 600,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        display: 'flex',
                    })}
                >
                    <TitledContainer
                        contrasted
                        className={css({
                            flexGrow: 1,
                        })}
                        title={<div
                            className={css({
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingLeft: 4,
                            })}
                        >
                            {t('header.help')}

                            <ButtonLike
                                onClick={onClose}>
                                <Icon name='times' />
                            </ButtonLike>
                        </div>}
                    >
                        <div
                            className={css({
                                display: 'flex',
                                alignItems: 'flex-start',
                                height: '100%',
                                gap: 8,
                            })}
                        >
                            <div
                                className={css({
                                    position: 'sticky',
                                    top: 0,
                                    flexShrink: 0,
                                    width: 200,
                                })}
                            >
                                <HelpDialogMenu
                                    finalSelectedPath={finalSelectedPath}
                                />
                            </div>

                            <TitledContainer
                                className={css({
                                    flexGrow: 1,
                                    height: '100%',
                                })}
                                title={null}
                            >
                                <HelpDialogContent
                                    selectedEndPath={selectedEndPath}
                                    finalSelectedPath={finalSelectedPath}
                                    anchor={helpAnchor}
                                    slugs={[ ...menuItem.slugs ]}
                                />
                            </TitledContainer>
                        </div>
                    </TitledContainer>
                </DialogPanel>
            </div>
        </Dialog>
    );
};
