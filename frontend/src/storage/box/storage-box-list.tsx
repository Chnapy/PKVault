import { css } from '@emotion/css';
import type React from 'react';
import { type BoxDTO } from '../../data/sdk/model';
import { Button } from '../../ui/button/button';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { ButtonWithPopover } from '../../ui/button/button-with-popover';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { SizingUtil } from '../../ui/util/sizing-util';
import { BoxName } from './box-name';

export const StorageBoxList: React.FC<{
    selectedBoxes: number[];
    boxes: BoxDTO[];
    pkms: { id: string; boxId: number; boxSlot: number }[];
    onBoxChange: (boxId: number) => void;
    editPanelContent?: (boxId: string, close: () => void) => React.ReactNode;
    deleteFn?: (boxId: string) => Promise<unknown>;
    addFn?: () => Promise<unknown>;
}> = ({ selectedBoxes, boxes, pkms, onBoxChange, editPanelContent, deleteFn, addFn }) => {
    const maxBoxSlotCount = Math.max(0, ...boxes.map(box => box.slotCount));
    const nbrItemsPerLine = SizingUtil.getItemsPerLine(maxBoxSlotCount);

    return (
        <div
            className={css({
                maxWidth: SizingUtil.getMaxWidth(nbrItemsPerLine),
                maxHeight: SizingUtil.getMaxHeight(),
                display: 'flex',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: SizingUtil.itemsGap,
                margin: 4,
                marginTop: 8,
                overflowY: 'auto',
            })}
        >
            {boxes.map(box => {
                const nbrItemsPerLine = SizingUtil.getItemsPerLine(box.slotCount);

                const boxPkmsList = pkms.filter(pkm => pkm.boxId === box.idInt);

                const boxPkms = Object.fromEntries(boxPkmsList.map(pkm => [ pkm.boxSlot, pkm ]));

                const allItems = new Array(box.slotCount).fill(null).map((_, i): (typeof boxPkms)[ number ] | null => boxPkms[ i ] ?? null);

                const canEditBox = !!editPanelContent;
                const canDeleteBox = !!deleteFn && boxes.length > 1;

                return (
                    <div
                        key={box.id}
                        className={css({
                            display: 'inline-flex',
                        })}
                        style={{ order: box.order }}
                    >
                        <Button
                            onClick={() => onBoxChange(box.idInt)}
                            selected={selectedBoxes.includes(box.idInt)}
                            className={css({
                                zIndex: 1,
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            })}
                        >
                            <div
                                className={css({
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: '100%',
                                })}
                            >
                                <BoxName boxType={box.type} boxName={box.name} />

                                <div
                                    className={css({
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${nbrItemsPerLine}, 1fr)`,
                                        marginBottom: 2,
                                    })}
                                >
                                    {allItems.map((pkm, i) => (
                                        <div
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
                                            {pkm && (
                                                <div
                                                    className={css({
                                                        width: '60%',
                                                        height: '60%',
                                                        borderRadius: 50,
                                                        backgroundColor: theme.bg.default,
                                                    })}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Button>

                        <div>
                            <ButtonWithPopover
                                panelContent={close => editPanelContent?.(box.id, close)}
                                disabled={!canEditBox}
                                className={css({
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                })}
                            >
                                <Icon name='pen' forButton />
                            </ButtonWithPopover>

                            <ButtonWithConfirm
                                onClick={deleteFn && (() => deleteFn(box.id))}
                                disabled={!canDeleteBox}
                                className={css({
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                    borderTopRightRadius: 0,
                                })}
                            >
                                <Icon name='trash' solid forButton />
                            </ButtonWithConfirm>
                        </div>
                    </div>
                );
            })}

            {addFn && (
                <Button
                    bgColor={theme.bg.primary}
                    onClick={addFn}
                    className={css({
                        width: 72,
                        minHeight: 78,
                        order: 999,
                    })}
                >
                    <Icon name='plus' solid forButton />
                </Button>
            )}
        </div>
    );
};
