import type React from 'react';
import type { BoxDTO } from '../../data/sdk/model';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { ButtonWithDisabledPopover } from '../../ui/button/button-with-disabled-popover';
import { ButtonWithPopover } from '../../ui/button/button-with-popover';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { css } from '@emotion/css';

export const StorageBoxList: React.FC<{
    selectedBoxes: number[];
    boxes: BoxDTO[];
    pkms: { id: string; boxId: number; boxSlot: number; }[];
    onBoxChange: (boxId: number) => void;
    editPanelContent?: (boxId: string, close: () => void) => React.ReactNode;
    deleteFn?: (boxId: string) => Promise<unknown>;
    addFn?: () => Promise<unknown>;
}> = ({ selectedBoxes, boxes, pkms, onBoxChange, editPanelContent, deleteFn, addFn }) => {
    const { t } = useTranslate();

    return <div
        className={css({
            width: 614,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            padding: 5,
            marginTop: 4,
        })}
    >
        {boxes.map(box => {

            const boxPkmsList = pkms.filter(pkm => pkm.boxId === box.idInt);

            const boxPkms = Object.fromEntries(
                boxPkmsList.map((pkm) => [ pkm.boxSlot, pkm ])
            );

            const allItems = new Array(box.slotCount)
                .fill(null)
                .map((_, i): typeof boxPkms[ number ] | null => boxPkms[ i ] ?? null);

            const canEditBox = box.canWrite && !!editPanelContent;
            const canDeleteBox = box.canWrite && !!deleteFn && boxes.length > 1 && boxPkmsList.length === 0;

            return <div
                key={box.id}
                className={css({
                    display: 'inline-flex',
                })}
            >
                <Button
                    onClick={() => onBoxChange(box.idInt)}
                    selected={selectedBoxes.includes(box.idInt)}
                    // disabled={selectedBoxes.includes(box.idInt)}
                    // loading={isLoading}
                    className={css({
                        zIndex: 1,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                    })}
                >
                    <div className={css({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%'
                    })}>
                        {box.name}

                        <div
                            className={css({
                                width: 58,
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
                                marginBottom: 2,
                            })}
                        >
                            {allItems.map((pkm, i) => <div
                                key={i}
                                className={css({
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 58 / 6,
                                    height: 58 / 6,
                                    borderWidth: 1,
                                    borderStyle: 'solid',
                                    borderColor: '#aaa',
                                })}
                                style={{ order: i }}
                            >
                                {pkm && <div className={css({
                                    width: '60%',
                                    height: '60%',
                                    borderRadius: 50,
                                    backgroundColor: theme.bg.default,
                                })} />}
                            </div>)}
                        </div>
                    </div>
                </Button>

                <div>
                    <ButtonWithPopover
                        panelContent={close => editPanelContent?.(box.id, close)}
                        // loading={isLoading}
                        disabled={!canEditBox}
                        className={css({
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                        })}
                    >
                        <Icon name='pen' forButton />
                    </ButtonWithPopover>

                    <ButtonWithDisabledPopover
                        as={ButtonWithConfirm}
                        helpTitle={t('storage.box.delete.help')}
                        showHelp={!canDeleteBox}
                        onClick={deleteFn && (() => deleteFn(box.id))}
                        disabled={!canDeleteBox}
                        // loading={isLoading}
                        className={css({
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderTopRightRadius: 0,
                        })}
                    >
                        <Icon name='trash' solid forButton />
                    </ButtonWithDisabledPopover>
                </div>
            </div>;
        })}

        {addFn && <Button bgColor={theme.bg.primary} onClick={addFn} className={css({
            width: 72,
            minHeight: 78,
        })}>
            <Icon name='plus' solid forButton />
        </Button>}
    </div>;
};
