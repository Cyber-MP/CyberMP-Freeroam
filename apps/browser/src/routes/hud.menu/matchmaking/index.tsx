import type Form from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useMemo, useRef } from 'react';
import { JoinMatchForm } from './-components/form';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlayerId } from '@/hooks/use-player-id';
import { isMatchMember, type Match, type MatchStatus } from '@/lib/match';
import { serverQuery } from '@/rpc';
import { queryClient } from '@/tanstack-query';

export const Route = createFileRoute('/hud/menu/matchmaking/')({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  pendingMs: 500,
  pendingMinMs: 300,
  loader: async () => {
    await queryClient.ensureQueryData(
      serverQuery.matchmaking.getAll.queryOptions(),
    );
  },
});

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

  const formRef = useRef<Form<any, RJSFSchema, any>>(null);

  if (
    !Object.keys(match.joinSchema.properties as Record<string, string>).length
  ) {
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

  const onSubmit = (formData: Record<string, unknown>) => {
    joinMutation.mutate([{ id: match.id, options: formData }]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="xs" variant="secondary">
          Join
        </Button>
      </DialogTrigger>
      <DialogContent overlay className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Join {match.modeName}</DialogTitle>
        </DialogHeader>
        <JoinMatchForm
          ref={formRef}
          onSubmit={(e) => onSubmit(e.formData)}
          showErrorList={false}
          uiSchema={{
            'ui:submitButtonOptions': {
              norender: true,
            },
          }}
          schema={match.joinSchema as any}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => formRef.current?.submit()}
            size="sm"
            type="submit"
          >
            Join
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MatchComponent = (match: Match) => {
  const leaveMutation = useMutation(
    serverQuery.matchmaking.leave.triggerMutationOptions({}),
  );
  const startMutation = useMutation(
    serverQuery.matchmaking.start.triggerMutationOptions({}),
  );

  const navigate = useNavigate();

  const playerId = usePlayerId();

  const queryClient = useQueryClient();

  const leaveMatch = async () => {
    await leaveMutation.mutateAsync([]);

    queryClient.invalidateQueries(
      serverQuery.matchmaking.getAll.queryOptions(),
    );
  };

  const startMatch = async () => {
    await startMutation.mutateAsync([]);

    queryClient.invalidateQueries(
      serverQuery.matchmaking.getAll.queryOptions(),
    );

    navigate({ to: '/hud' });
  };

  const members = Object.keys(match.members);
  const { maxPlayers, ...matchOptions } = match.options;

  const options = {
    owner: match.owner.nickname,
    ...matchOptions,
  };

  const isMember = isMatchMember(match, playerId!);
  const isOwner = match.owner.id === playerId;

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
                {key}: {String(value)}
              </span>
            ))}
          </div>
        </div>
      </CardContent>

      {!!(match.status === 'LOBBY' || isMember) && (
        <CardFooter>
          <CardAction className="w-full flex items-center justify-between">
            {!!(isOwner && match.status === 'LOBBY') && (
              <Button onClick={startMatch} size="xs">
                Start
              </Button>
            )}
            {!isMember && match.status === 'LOBBY' ? (
              <JoinMatch {...match} />
            ) : (
              <Button onClick={leaveMatch} size="xs" variant="destructive">
                Leave
              </Button>
            )}
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

  const playerId = usePlayerId();

  const sortedMatches = useMemo(
    () =>
      [...matches].sort((a, b) => {
        const isPlayerInA = isMatchMember(a, playerId!);
        const isPlayerInB = isMatchMember(b, playerId!);

        if (isPlayerInA && !isPlayerInB) return -1;
        if (!isPlayerInA && isPlayerInB) return 1;
        return 0;
      }),
    [playerId, matches],
  );

  return (
    <div className="p-4 flex flex-col gap-4">
      <Link from="/hud/menu/matchmaking/" to="create" className="w-full">
        <Button className="w-full">Create</Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedMatches.map((match) => (
          <MatchComponent {...match} key={match.id} />
        ))}
      </div>
    </div>
  );
}
