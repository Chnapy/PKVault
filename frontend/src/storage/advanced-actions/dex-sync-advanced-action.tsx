import { Group, Stack, type ComboboxItem } from '@mantine/core';
import { AlertTriangleIcon, CalendarSyncIcon } from 'lucide-react';
import type React from "react";
import { useForm, useWatch } from "react-hook-form";
import type { StorageDexSyncParams } from "../../data/sdk/model";
import { useSaveInfosGetAll } from "../../data/sdk/save-infos/save-infos.gen";
import { useStorageDexSync } from "../../data/sdk/storage/storage.gen";
import { useStaticData } from "../../hooks/use-static-data";
import { useTranslate } from "../../translate/i18n";
import { UIButton } from '../../ui-new/form/button/ui-button';
import { UIMultiSelect } from '../../ui-new/form/select/ui-multi-select';
import { usePopover } from '../../ui-new/interaction/focus-controls/components/popover/hooks/use-popover';
import { GameImg } from '../../ui/img/game-img';

export const DexSyncAdvancedAction: React.FC<{
  saveId: number;
}> = ({ saveId }) => {
  const { t } = useTranslate();

  const popover = usePopover();

  const staticData = useStaticData();

  const saveInfosQuery = useSaveInfosGetAll();
  const saveInfos = saveInfosQuery.data?.data ?? {};

  const dexSyncMutation = useStorageDexSync();

  const { handleSubmit, setValue, formState, control } =
    useForm<StorageDexSyncParams>({
      defaultValues: {
        saveIds: [ saveId ],
      },
    });

  const [ saveIds = [] ] = useWatch({ control, name: [ 'saveIds' ] });

  const onSubmit = handleSubmit(async ({ saveIds }) => {
    const result = await dexSyncMutation.mutateAsync({
      params: {
        saveIds,
      },
    });

    if (result.status >= 400) {
      return;
    }

    popover?.setOpened(false);
  });

  return <Stack
    component='form'
    onSubmit={onSubmit}
    maw={350}
  >
    <UIMultiSelect
      name='saveIds'
      controlLabel='Select Pokedexes'
      label={t("storage.dex-sync.title")}
      value={saveIds.map(String)}
      onChange={value => setValue('saveIds', value.map(Number))}
      data={[
        {
          value: '0',
          label: 'PKVault',
          disabled: saveId === 0,
        },
        ...Object.values(saveInfos).map((save): ComboboxItem => ({
          value: save.id.toString(),
          label: `${staticData.versions[ save.version ]?.name} - ${save.trainerName}`,
          // selected: saveIds.includes(save.id),
          disabled: save.id === saveId,
        })),
      ]}
      // renderPill={({ option, onRemove }) => }
      renderOption={({ option, checked = false }) => option && <Group>
        <GameImg
          version={option.value === '0' ? null : saveInfos[ +option.value ]!.version}
          size={14}
        />
        {option.label}
      </Group>}
      searchable
      comboboxProps={{ withinPortal: false, position: 'right-start', floatingHeight: "viewport" }}
      floatingHeight="viewport"
    />

    <div>{t("storage.dex-sync.description")}</div>

    <div
      style={{
        whiteSpace: "pre-line",
      }}
    >
      <AlertTriangleIcon />{" "}
      {t("storage.actions.unsafe")}
    </div>

    <UIButton
      name='submit'
      controlLabel='Submit'
      type="submit"
      color='blue'
      loading={formState.isSubmitting}
      disabled={saveIds.length < 2}
      leftSection={<CalendarSyncIcon />}
    >
      {t("action.submit")}
    </UIButton>
  </Stack>;
};
