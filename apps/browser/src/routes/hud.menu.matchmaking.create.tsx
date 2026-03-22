import { RiArrowLeftSLine } from '@remixicon/react';
import type { UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { DefaultPendingPage } from '@/components/default-pending-page';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldSet } from '@/components/ui/field';
import { Rjsf } from '@/components/ui/rjsf';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { serverQuery } from '@/rpc';
import { queryClient } from '@/tanstack-query';

export const Route = createFileRoute('/hud/menu/matchmaking/create')({
  component: RouteComponent,
  pendingComponent: DefaultPendingPage,
  pendingMs: 500,
  pendingMinMs: 300,
  loader: async () => {
    await queryClient.ensureQueryData(
      serverQuery.gameModes.getSchemas.queryOptions(),
    );
  },
});

const createUiSchema: UiSchema = {
  maxPlayers: {
    'ui:widget': 'SliderWidget',
  },
  laps: {
    'ui:widget': 'SliderWidget',
  },
};

function RouteComponent() {
  const { data: gameModesSchemas } = useSuspenseQuery(
    serverQuery.gameModes.getSchemas.queryOptions(),
  );
  const navigate = useNavigate();

  const [gameMode, setGameMode] = useState<keyof typeof gameModesSchemas>();
  const [createOptions, setCreateOptions] = useState<Record<string, unknown>>();
  const mutation = useMutation(
    serverQuery.matchmaking.create.triggerMutationOptions({
      onSuccess() {
        navigate({ to: '/hud/menu/matchmaking' });
      },
    }),
  );

  const gameModes = Object.keys(gameModesSchemas);
  const schema = gameMode ? gameModesSchemas[gameMode] : null;

  const onJoinOptionsSubmit = (formData: Record<string, unknown>) => {
    mutation.mutate([
      {
        joinOptions: formData as any,
        createOptions: createOptions as any,
        name: gameMode as any,
      },
    ]);
  };

  const onCreateOptionsSubmit = (formData: Record<string, unknown>) => {
    setCreateOptions(formData);

    if (
      !Object.keys(schema?.joinSchema?.properties as Record<string, string>)
        .length
    ) {
      mutation.mutate([
        {
          joinOptions: {} as any,
          createOptions: formData as any,
          name: gameMode as any,
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4 relative">
      <Link to="/hud/menu/matchmaking">
        <Button
          variant="ghost"
          className="absolute -top-2 -left-2"
          size="icon-sm"
        >
          <RiArrowLeftSLine />
        </Button>
      </Link>
      <div className="w-64 flex flex-col gap-4">
        {createOptions ? (
          <FieldSet>
            <Rjsf
              showErrorList={false}
              key={`${gameMode}-join`}
              uiSchema={createUiSchema}
              schema={schema?.joinSchema as any}
              validator={validator}
              onSubmit={(s) => onJoinOptionsSubmit(s.formData)}
            />
          </FieldSet>
        ) : (
          <FieldSet className="flex flex-col gap-6">
            <Field>
              <FieldLabel>Game mode</FieldLabel>
              <Select onValueChange={(v) => setGameMode(v as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select game mode" />
                </SelectTrigger>
                <SelectContent>
                  {gameModes.map((mode, index) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {gameMode && (
              <Rjsf
                showErrorList={false}
                key={`${gameMode}-create`}
                uiSchema={createUiSchema}
                schema={schema?.createSchema as any}
                validator={validator}
                formData={createOptions}
                onSubmit={(s) => onCreateOptionsSubmit(s.formData)}
              />
            )}
          </FieldSet>
        )}
      </div>
    </div>
  );
}
