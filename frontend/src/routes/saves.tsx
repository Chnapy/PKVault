import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../hooks/use-static-data';
import { SaveItem } from "../saves/save-item/save-item";
import { TitledContainer } from '../ui/container/titled-container';

const Saves: React.FC = () => {
  const staticData = useStaticData();
  const saveInfosQuery = useSaveInfosGetAll();

  if (!saveInfosQuery.data) {
    return null;
  }

  const generations = [ ...new Set(Object.values(staticData.versions).map(version => version.generation)) ].sort();

  const saveInfos = Object.values(saveInfosQuery.data.data).sort((a, b) => {
    return a.lastWriteTime > b.lastWriteTime ? -1 : 1;
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: 'column',
        // alignItems: "flex-start",
        alignItems: "center",
        // flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}
      >
        {generations.map(generation => {
          const saves = saveInfos.filter(save => save.generation === generation);
          if (saves.length === 0) {
            return null;
          }

          const maxSpecies = Math.max(...saves.map(save => save.maxSpeciesId));

          return <TitledContainer key={generation} title={`Generation ${generation} / ${maxSpecies} species`}>
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                flexWrap: 'wrap'
              }}
            >
              {saves.map(save => <SaveItem key={save.id} saveId={save.id} showDelete />)}
            </div>
          </TitledContainer>;
        })}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/saves")({
  component: Saves,
});
