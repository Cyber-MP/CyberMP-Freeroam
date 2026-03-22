import validator from '@rjsf/validator-ajv8';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Rjsf } from '@/components/ui/rjsf';
import { Skeleton } from '@/components/ui/skeleton';
import { type ServerOutputs, serverQuery } from '@/rpc';
import { queryClient } from '@/tanstack-query';

export const Route = createFileRoute('/hud/menu/matchmaking/')({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  pendingMs: 500,
  pendingMinMs: 300,
  loader: async () => {
    await queryClient.ensureQueryData(
      serverQuery.gameModes.getSchemas.queryOptions(),
    );
    await queryClient.ensureQueryData(
      serverQuery.matchmaking.getAll.queryOptions(),
    );
  },
});

type MatchStatus = `${ServerOutputs['matchmaking']['getAll'][0]['status']}`;
type GameModeName = `${ServerOutputs['matchmaking']['getAll'][0]['modeName']}`;

type Match = Omit<
  ServerOutputs['matchmaking']['getAll'][0],
  'modeName' | 'status'
> & {
  status: MatchStatus;
  modeName: GameModeName;
};

function PendingComponent() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <Link className="w-full" from="/hud/menu/matchmaking/" to="create">
        <Button className="w-full">Create</Button>
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
        <Skeleton className="h-68" />
      </div>
    </div>
  );
}

const matchStatusVariants = cva('px-2 py-1 text-xs font-bold uppercase', {
  variants: {
    status: {
      LOBBY: 'bg-green-500/20 text-green-500',
      ACTIVE: 'bg-yellow-500/20 text-yellow-500',
      ENDED: 'bg-red-500/20 text-red-500',
    } as Record<MatchStatus, string>,
  },
});

const JoinMatch = (match: Match) => {
  const queryClient = useQueryClient();
  const joinMutation = useMutation(
    serverQuery.matchmaking.join.triggerMutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(
          serverQuery.matchmaking.getAll.queryOptions(),
        );
      },
    }),
  );
  const { data: gameModesSchemas } = useSuspenseQuery(
    serverQuery.gameModes.getSchemas.queryOptions(),
  );

  const schema = gameModesSchemas[match.modeName].joinSchema;

  if (!Object.keys(schema.properties as Record<string, string>).length) {
    return (
      <Button
        onClick={() => joinMutation.mutate([{ id: match.id, options: {} }])}
        size="xs"
        variant="secondary"
      >
        Join
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="xs" variant="secondary">
          Join
        </Button>
      </DialogTrigger>
      <DialogContent overlay className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Rjsf
          showErrorList={false}
          uiSchema={{
            'ui:submitButtonOptions': {
              norender: true,
              submitText: 'Submit',
            },
          }}
          schema={gameModesSchemas[match.modeName]['joinSchema'] as any}
          validator={validator}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MatchComponent = (match: Match) => {
  const leaveMutation = useMutation(
    serverQuery.matchmaking.leave.triggerMutationOptions({}),
  );

  const { data: playerId } = useQuery(serverQuery.getPlayerId.queryOptions());

  const queryClient = useQueryClient();

  const leaveMatch = async () => {
    await leaveMutation.mutateAsync([]);

    queryClient.invalidateQueries(
      serverQuery.matchmaking.getAll.queryOptions(),
    );
  };

  // const joinMatch = async () => {
  //   await joinMutation.mutateAsync([{}]);

  //   queryClient.invalidateQueries(
  //     serverQuery.matchmaking.getAll.queryOptions(),
  //   );
  // };

  const members = Object.keys(match.members);
  const { maxPlayers, ...matchOptions } = match.options;

  const options = {
    owner: match.ownerId,
    ...matchOptions,
  };

  const isMember = members.some((o) => +o === +(playerId ?? 0));
  const isOwner = match.ownerId === playerId;

  return (
    <Card key={match.id} className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{match.modeName}</CardTitle>
            <CardDescription>ID: {match.id.slice(0, 8)}...</CardDescription>
          </div>
          <div className={matchStatusVariants({ status: match.status })}>
            {match.status}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 h-full">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Players:</span>
          <span>
            {members.length}/{match.options.maxPlayers}
          </span>
        </div>
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">Options</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(options).map(([key, value]) => (
              <span
                key={`${match.id}-${key}`}
                className="bg-secondary px-2 py-0.5 rounded text-[1vh] capitalize"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
      </CardContent>

      {match.status === 'LOBBY' && (
        <CardFooter>
          <CardAction className="w-full flex items-center justify-between">
            {isOwner && <Button size="xs">Start</Button>}
            <div className="flex items-center gap-4">
              {isOwner && (
                <Button size="xs" variant="secondary">
                  Edit
                </Button>
              )}
              {!isMember ? (
                <JoinMatch {...match} />
              ) : (
                <Button onClick={leaveMatch} size="xs" variant="destructive">
                  Leave
                </Button>
              )}
            </div>
          </CardAction>
        </CardFooter>
      )}
    </Card>
  );
};

function RouteComponent() {
  const { data: matches } = useSuspenseQuery<Match[]>(
    serverQuery.matchmaking.getAll.queryOptions({ refetchInterval: 1000 }),
  );

  return (
    <div className="p-4 flex flex-col gap-4">
      <Link from="/hud/menu/matchmaking/" to="create" className="w-full">
        <Button className="w-full">Create</Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {matches.map((match) => (
          <MatchComponent {...match} key={match.id} />
        ))}
      </div>
    </div>
  );
}
