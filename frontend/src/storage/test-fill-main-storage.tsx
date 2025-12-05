

import type React from 'react';
import { saveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { storageCreateMainBox, storageDeleteMainBox, storageGetMainBoxes, storageGetSaveBoxes, storageGetSavePkms, storageMovePkm, type storageCreateMainBoxResponse } from '../data/sdk/storage/storage.gen';
import { Button } from '../ui/button/button';
import { BankContext } from './bank/bank-context';

export const TestFillMainStorage: React.FC = () => {
    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const onClick = async () => {
        const savesInfos = await saveInfosGetAll();

        const mainBoxes = await storageGetMainBoxes();

        for (const saveInfos of Object.values(savesInfos.data)) {
            if (!saveInfos) continue;

            try {
                // const saveBoxes = await storageGetSaveBoxes(saveInfos.id);
                // const savePkms = await storageGetSavePkms(saveInfos.id);
                const [ saveBoxes, savePkms ] = await Promise.all([
                    storageGetSaveBoxes(saveInfos.id),
                    storageGetSavePkms(saveInfos.id),
                ]);

                for (const saveBox of saveBoxes.data) {
                    if (saveBox.idInt < 1) continue;

                    try {
                        const saveBoxPkms = savePkms.data
                            .filter(pkm => pkm.boxId === saveBox.idInt)
                            .filter(pkm => pkm.canMoveAttachedToMain);

                        const boxName = `AUTO-${saveInfos.tid}-${saveBox.idInt}-${saveBox.name}`;
                        const mainBox = mainBoxes.data.find(box => box.name === boxName);
                        if (mainBox) {
                            try {
                                await storageDeleteMainBox(mainBox.id);
                            } catch (error) { console.error(error) }
                        }

                        if (saveBoxPkms.length === 0) continue;

                        let createBoxResponse: storageCreateMainBoxResponse | undefined;

                        try {
                            createBoxResponse = await storageCreateMainBox({
                                boxName,
                                bankId: selectedBankBoxes.data!.selectedBank.id,
                            });
                        } catch (error) { console.error(error) }

                        const boxId = (createBoxResponse?.data.mainBoxes?.find(box => box.name === boxName)
                            ?? mainBoxes.data!.find(box => box.name === boxName)!).idInt;

                        try {
                            await storageMovePkm({
                                attached: true,
                                sourceSaveId: saveInfos.id,
                                pkmIds: saveBoxPkms.map(pkm => pkm.id),
                                targetBoxId: boxId,
                                targetBoxSlots: saveBoxPkms.map(pkm => pkm.boxSlot),
                            });
                            console.log('Fill main box', boxName);
                        } catch (error) { console.error(error) }
                    } catch (error) { console.error(error) }
                }
            } catch (error) { console.error(error) }
        }
    };

    return <Button onClick={onClick}>Fill data</Button>
};
