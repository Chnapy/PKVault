import { css } from "@emotion/css";
import { Listbox, ListboxOption, ListboxOptions } from "@headlessui/react";
import type React from "react";
import { useForm } from "react-hook-form";
import type { StorageDexSyncParams } from "../../data/sdk/model";
import { useSaveInfosGetAll } from "../../data/sdk/save-infos/save-infos.gen";
import { useStorageDexSync } from "../../data/sdk/storage/storage.gen";
import { useStaticData } from "../../hooks/use-static-data";
import { getGameInfos } from "../../pokedex/details/util/get-game-infos";
import { useTranslate } from "../../translate/i18n";
import { Button } from "../../ui/button/button";
import { FilterLabel } from "../../ui/filter/filter-label/filter-label";
import { Icon } from "../../ui/icon/icon";
import { theme } from "../../ui/theme";

export const DexSyncAdvancedAction: React.FC<{
  saveId: number;
  close: () => void;
}> = ({ saveId, close }) => {
  const { t } = useTranslate();

  const staticData = useStaticData();

  const saveInfosQuery = useSaveInfosGetAll();
  const saveInfos = Object.values(saveInfosQuery.data?.data ?? {});

  const dexSyncMutation = useStorageDexSync();

  const { handleSubmit, watch, setValue, formState } =
    useForm<StorageDexSyncParams>({
      defaultValues: {
        saveIds: [saveId],
      },
    });

  const saveIds = watch("saveIds") ?? [];

  const onSubmit = handleSubmit(async ({ saveIds }) => {
    const result = await dexSyncMutation.mutateAsync({
      params: {
        saveIds,
      },
    });

    if (result.status >= 400) {
      return;
    }

    close();
  });

  return (
    <form
      onSubmit={onSubmit}
      className={css({
        maxWidth: 350,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      })}
    >
      <div>{t("storage.dex-sync.title")}</div>

      <Listbox
        multiple
        value={saveIds.map(String)}
        onChange={(newIds) => {
          setValue("saveIds", newIds.map(Number));
        }}
      >
        <ListboxOptions
          static
          className={css({
            maxHeight: 210,
            overflowY: "auto",
            userSelect: "none",
          })}
        >
          {[
            // pkvault storage
            {
              value: "0",
              label: (
                <>
                  <img
                    src={getGameInfos(null).img}
                    className={css({
                      height: 14,
                      width: 14,
                    })}
                  />
                  PKVault
                </>
              ),
              selected: saveIds.includes(0),
              disabled: 0 === saveId,
            },
            ...saveInfos.map((save) => ({
              value: save.id.toString(),
              label: (
                <>
                  <img
                    src={getGameInfos(save.version).img}
                    className={css({
                      height: 14,
                      width: 14,
                    })}
                  />
                  {staticData.versions[save.version]?.name} - {save.trainerName}
                </>
              ),
              selected: saveIds.includes(save.id),
              disabled: save.id === saveId,
            })),
          ].map(({ value, label, selected, disabled }, i) => (
            <ListboxOption
              key={value}
              value={value}
              className={css({
                marginTop: i ? 2 : 0,
                opacity: disabled ? 0.75 : undefined,
                pointerEvents: disabled ? "none" : undefined,
              })}
              disabled={disabled}
            >
              <FilterLabel
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                })}
                enabled={selected}
              >
                {label}
              </FilterLabel>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>

      <div>{t("storage.dex-sync.description")}</div>

      <div
        className={css({
          whiteSpace: "pre-line",
        })}
      >
        <Icon name="exclamation-triangle" solid forButton />{" "}
        {t("storage.actions.unsafe")}
      </div>

      <Button
        type="submit"
        big
        bgColor={theme.bg.primary}
        loading={formState.isSubmitting}
        disabled={saveIds.length < 2}
      >
        <Icon name="table" solid forButton />
        {t("action.submit")}
      </Button>
    </form>
  );
};
