import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { getSaveInfosGetAllUrl, type saveInfosGetAllResponse200ApplicationJson } from '../../../data/sdk/save-infos/save-infos.gen';
import { getStorageGetBoxesUrl, type storageGetBoxesResponse200, getStorageGetMainPkmVariantsUrl, type storageGetMainPkmVariantsResponse200, getStorageGetSavePkmsUrl, type storageGetSavePkmsResponse200, getStorageMovePkmUrl, getStorageMovePkmBankUrl } from '../../../data/sdk/storage/storage.gen';

export const setupTestDataServer = () => {

    const server = setupServer(
        http.get(getSaveInfosGetAllUrl(), () => {
            return HttpResponse.json<saveInfosGetAllResponse200ApplicationJson[ 'data' ]>({
                123: {
                    id: 123,
                    generation: 3,
                    version: 1,
                },
                456: {
                    id: 456,
                    generation: 4,
                    version: 1,
                },
                789: {
                    id: 789,
                    generation: 3,
                    version: 1,
                },
            });
        }),
        http.get(getStorageGetBoxesUrl(), ({ request }) => {
            const url = new URL(request.url)
            const saveId = Number(url.searchParams.get('saveId') ?? '0');
            switch (saveId) {
                case 0:
                    return HttpResponse.json<storageGetBoxesResponse200[ 'data' ]>([
                        {
                            id: '0',
                            idInt: 0,
                            slotCount: 30,
                            bankId: '0',
                        },
                        {
                            id: '1',
                            idInt: 1,
                            slotCount: 30,
                            bankId: '1',
                        },
                        {
                            id: '2',
                            idInt: 2,
                            slotCount: 30,
                        },
                        {
                            id: '3',
                            idInt: 3,
                            slotCount: 30,
                        }
                    ]);
                case 123:
                    return HttpResponse.json<storageGetBoxesResponse200[ 'data' ]>([
                        {
                            id: '0',
                            idInt: 0,
                            slotCount: 30,
                            canSaveWrite: true,
                            canSaveReceivePkm: true,
                        },
                        {
                            id: '1',
                            idInt: 1,
                            slotCount: 30,
                            canSaveWrite: true,
                            canSaveReceivePkm: true,
                        },
                        {
                            id: '2',
                            idInt: 2,
                            slotCount: 30,
                            canSaveWrite: false,
                            canSaveReceivePkm: false,
                        },
                    ]);
                case 456:
                    return HttpResponse.json<storageGetBoxesResponse200[ 'data' ]>([
                        {
                            id: '0',
                            idInt: 0,
                            slotCount: 30,
                            canSaveWrite: true,
                            canSaveReceivePkm: true,
                        },
                    ]);
                case 789:
                    return HttpResponse.json<storageGetBoxesResponse200[ 'data' ]>([
                        {
                            id: '0',
                            idInt: 0,
                            slotCount: 30,
                            canSaveWrite: true,
                            canSaveReceivePkm: true,
                        },
                    ]);
            }
        }),
        http.get(getStorageGetMainPkmVariantsUrl(), () => {
            return HttpResponse.json<storageGetMainPkmVariantsResponse200[ 'data' ]>([
                {
                    id: 'canMove',
                    boxId: 0,
                    boxSlot: 0,
                    species: 1,
                    generation: 3,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToSave: true,
                    canMoveToSave: true,
                    compatibleWithVersions: [ 1 ],
                },
                {
                    id: 'canMove2',
                    boxId: 0,
                    boxSlot: 1,
                    species: 1,
                    generation: 3,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToSave: true,
                    canMoveToSave: true,
                    compatibleWithVersions: [ 1 ],
                },
                {
                    id: 'cannotMove',
                    boxId: 0,
                    boxSlot: 2,
                    species: 1,
                    generation: 3,
                    isEnabled: true,
                    canMove: false,
                    canMoveAttachedToSave: false,
                    canMoveToSave: false,
                    compatibleWithVersions: [ 1 ],
                },
                {
                    id: 'canMoveNotCompatible',
                    boxId: 0,
                    boxSlot: 3,
                    species: 1,
                    generation: 3,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToSave: true,
                    canMoveToSave: true,
                    compatibleWithVersions: [ 0 ],
                },
                {
                    id: 'isDisabled',
                    boxId: 0,
                    boxSlot: 4,
                    species: 0,
                    generation: 3,
                    isEnabled: false,
                    canMove: true,
                    canMoveAttachedToSave: true,
                    canMoveToSave: true,
                    compatibleWithVersions: [ 1 ],
                },
                {
                    id: 'isAttached',
                    attachedSaveId: 123,
                    attachedSavePkmIdBase: 'isAttached',
                    boxId: 0,
                    boxSlot: 5,
                    species: 1,
                    generation: 3,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToSave: true,
                    canMoveToSave: true,
                    compatibleWithVersions: [ 1 ],
                },
                {
                    id: 'existID',
                    idBase: 'existID',
                    boxId: 0,
                    boxSlot: 6,
                    species: 1,
                    generation: 3,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToSave: true,
                    canMoveToSave: true,
                    compatibleWithVersions: [ 1 ],
                },
            ]);
        }),
        http.get(getStorageGetSavePkmsUrl(123), () => {
            return HttpResponse.json<storageGetSavePkmsResponse200[ 'data' ]>([
                {
                    id: 'canMove',
                    saveId: 123,
                    boxId: 0,
                    boxSlot: 0,
                    species: 1,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToMain: true,
                    canMoveToSave: true,
                    canMoveToMain: true,
                },
                {
                    id: 'cannotMove',
                    saveId: 123,
                    boxId: 0,
                    boxSlot: 0,
                    species: 1,
                    isEnabled: true,
                    canMove: false,
                    canMoveAttachedToMain: false,
                    canMoveToSave: false,
                    canMoveToMain: false,
                },
                {
                    id: 'isAttached',
                    idBase: 'isAttached',
                    saveId: 123,
                    boxId: 0,
                    boxSlot: 1,
                    species: 1,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToMain: true,
                    canMoveToSave: true,
                    canMoveToMain: true,
                },
                {
                    id: 'canMove2',
                    saveId: 123,
                    boxId: 0,
                    boxSlot: 1,
                    species: 1,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToMain: true,
                    canMoveToSave: true,
                    canMoveToMain: true,
                },
                {
                    id: 'egg',
                    saveId: 123,
                    boxId: 0,
                    boxSlot: 2,
                    species: 1,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToMain: true,
                    canMoveToSave: true,
                    canMoveToMain: true,
                    isEgg: true,
                },
                {
                    id: 'shadow',
                    saveId: 123,
                    boxId: 0,
                    boxSlot: 3,
                    species: 1,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToMain: true,
                    canMoveToSave: true,
                    canMoveToMain: true,
                    isShadow: true,
                },
                {
                    id: 'existID',
                    idBase: 'existID',
                    saveId: 123,
                    boxId: 0,
                    boxSlot: 4,
                    species: 1,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToMain: true,
                    canMoveToSave: true,
                    canMoveToMain: true,
                },
            ]);
        }),
        http.get(getStorageGetSavePkmsUrl(456), () => {
            return HttpResponse.json<storageGetSavePkmsResponse200[ 'data' ]>([
                {
                    id: 'canMove',
                    saveId: 456,
                    boxId: 0,
                    boxSlot: 0,
                    species: 1,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToMain: true,
                    canMoveToSave: true,
                    canMoveToMain: true,
                },
            ]);
        }),
        http.get(getStorageGetSavePkmsUrl(789), () => {
            return HttpResponse.json<storageGetSavePkmsResponse200[ 'data' ]>([
                {
                    id: 'canMove',
                    saveId: 789,
                    boxId: 0,
                    boxSlot: 0,
                    species: 1,
                    isEnabled: true,
                    canMove: true,
                    canMoveAttachedToMain: true,
                    canMoveToSave: true,
                    canMoveToMain: true,
                },
                {
                    id: 'cannotMove',
                    saveId: 789,
                    boxId: 0,
                    boxSlot: 1,
                    species: 1,
                    isEnabled: true,
                    canMove: false,
                    canMoveAttachedToMain: false,
                    canMoveToSave: false,
                    canMoveToMain: false,
                },
            ]);
        }),
        http.put(getStorageMovePkmUrl(), () => {
            return HttpResponse.json({});
        }),
        http.put(getStorageMovePkmBankUrl(), () => {
            return HttpResponse.json({});
        }),
    );

    beforeAll(() => server.listen({
        onUnhandledRequest: 'error',
    }));

    afterEach(() => server.resetHandlers());

    afterAll(() => server.close());

    return server;
};
