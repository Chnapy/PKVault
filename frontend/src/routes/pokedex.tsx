import { css } from '@emotion/css';
import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import React from "react";
import z from "zod";
import { ErrorCatcher } from '../error/error-catcher';
import { withErrorCatcher } from '../error/with-error-catcher';
import { PokedexDetails } from "../pokedex/details/pokedex-details";
import { FiltersCard } from "../pokedex/filters/filters-card";
import { PokedexList } from "../pokedex/list/pokedex-list";
import { detailsExpandedStateValues } from '../ui/details-card/details-card-container';

export const PokedexPage: React.FC = withErrorCatcher('default', () => {
  const navigate = Route.useNavigate();

  return (
    <div>
      <div>
        <div
          className={css({
            display: "flex",
            justifyContent: "center",
            paddingBottom: 8,
          })}
        >
          <FiltersCard />
        </div>

        <PokedexList />
      </div>

      <div
        className={css({
          position: "fixed",
          top: 60,
          bottom: 24,
          left: 14,
          right: 24,
          pointerEvents: 'none',
          zIndex: 20,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          '&:hover': {
            zIndex: 25,
          },
          '& > *': {
            maxWidth: '100%',
            maxHeight: '100%',
            overflowY: 'auto',
            pointerEvents: 'initial',
          }
        })}
      >
        <ErrorCatcher
          onClose={() => navigate({
            search: {
              selected: undefined,
            }
          })}
        >
          <PokedexDetails />
        </ErrorCatcher>
      </div>
    </div>
  );
});

const searchSchema = z.object({
  selected: z.number().optional(),
  selectedSaveId: z.number().optional(),
  selectExpanded: z.enum(detailsExpandedStateValues).optional(),
  filterSpeciesName: z.string().optional(),
  filterTypes: z.array(z.number()).optional(),
  filterSeen: z.boolean().optional(),
  filterCaught: z.boolean().optional(),
  filterOwned: z.boolean().optional(),
  filterOwnedShiny: z.boolean().optional(),
  filterFromGames: z.array(z.number()).optional(), // saveIDs
  filterGenerations: z.array(z.number()).optional(), // generation.name
  showForms: z.boolean().optional(),
  showGenders: z.boolean().optional(),
});

export const Route = createFileRoute("/pokedex")({
  component: PokedexPage,
  validateSearch: zodValidator(fallback(searchSchema, {})),
  search: {
    middlewares: [ retainSearchParams(true) ],
  }
});
