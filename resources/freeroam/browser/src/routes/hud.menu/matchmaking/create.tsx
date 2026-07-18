import { RiArrowLeftSLine } from '@remixicon/react';
import type Form from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { DefaultPendingPage } from '@/components/default-pending-page';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldSet } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { serverQuery } from '@/rpc';
import { queryClient } from '@/tanstack-query';
import { CreateMatchForm, JoinMatchForm } from './-components/form';

export const Route = createFileRoute('/hud/menu/matchmaking/create')({
  component: RouteComponent,
  pendingComponent: DefaultPendingPage,
  pendingMs: 500,
  pendingMinMs: 300,
  loader: async () => {
    await queryClient.ensureQueryData(
      serverQuery.gameModes.getCreateSchemas.queryOptions(),
    );
  },
});

function RouteComponent() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [gameMode, setGameMode] =
    useState<keyof typeof createGameModeSchemas>();
  const [createOptions, setCreateOptions] = useState<Record<string, unknown>>();

  const joinSchemaMutation = useMutation(
    serverQuery.gameModes.getJoinSchema.callMutationOptions(),
  );
  const joinSchema = joinSchemaMutation.data;
  const isJoinSchemaLoading = joinSchemaMutation.isPending;

  const { data: createGameModeSchemas } = useSuspenseQuery(
    serverQuery.gameModes.getCreateSchemas.queryOptions(),
  );
  const mutation = useMutation(
    serverQuery.matchmaking.create.triggerMutationOptions({
      onSuccess() {
        navigate({ to: '/hud/menu/matchmaking' });

        queryClient.invalidateQueries(
          serverQuery.matchmaking.getAll.queryOptions(),
        );
      },
    }),
  );

  const gameModes = Object.keys(createGameModeSchemas);
  const createSchema = gameMode ? createGameModeSchemas[gameMode] : null;

  const createFormRef = useRef<Form<any, RJSFSchema, any>>(null);
  const joinFormRef = useRef<Form<any, RJSFSchema, any>>(null);

  const onJoinOptionsSubmit = (formData: Record<string, unknown>) => {
    mutation.mutate([
      {
        joinOptions: formData as any,
        createOptions: createOptions as any,
        name: gameMode as any,
      },
    ]);
  };

  const onCreateOptionsSubmit = async (formData: Record<string, unknown>) => {
    if (!gameMode) {
      return;
    }

    setCreateOptions(formData);

    const joinSchemaResponse = await joinSchemaMutation.mutateAsync([
      { createOptions: formData, modeName: gameMode },
    ]);

    if (
      !Object.keys(joinSchemaResponse.properties as Record<string, string>)
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

  if (isJoinSchemaLoading) {
    return <DefaultPendingPage />;
  }

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
      <div className="w-full overflow-y-scroll h-full flex items-center justify-center pt-12">
        <div className="w-64 flex flex-col gap-4">
          {createOptions && joinSchema ? (
            <div className="flex flex-col gap-4">
              <JoinMatchForm
                ref={joinFormRef}
                key={`${gameMode}-join`}
                uiSchema={{
                  'ui:submitButtonOptions': {
                    norender: true,
                  },
                }}
                schema={joinSchema as any}
                onSubmit={(s) => onJoinOptionsSubmit(s.formData)}
              />
              <Button
                onClick={() => joinFormRef?.current?.submit()}
                className="absolute bottom-4 right-4"
              >
                CREATE
              </Button>
            </div>
          ) : (
            <FieldSet className="flex flex-col gap-6">
              <Field>
                <FieldLabel>Game mode</FieldLabel>
                <Select onValueChange={(v) => setGameMode(v as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select game mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {gameModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {gameMode && (
                <div className="flex flex-col gap-4">
                  <CreateMatchForm
                    ref={createFormRef}
                    key={`${gameMode}-create`}
                    schema={createSchema as any}
                    formData={createOptions}
                    uiSchema={{
                      'ui:submitButtonOptions': {
                        norender: true,
                      },
                    }}
                    onSubmit={(s) => onCreateOptionsSubmit(s.formData)}
                  />
                  <Button
                    onClick={() => createFormRef?.current?.submit()}
                    className="absolute bottom-4 right-4"
                  >
                    CREATE
                  </Button>
                </div>
              )}
            </FieldSet>
          )}
        </div>
      </div>
    </div>
  );
}
