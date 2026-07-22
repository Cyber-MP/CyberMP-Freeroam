import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import ms from 'ms';
import { serverQuery } from '@/rpc';

export const Route = createFileRoute('/hud/menu/players')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: players = [] } = useQuery(
    serverQuery.playerList.getAll.queryOptions({
      refetchInterval: ms('5s'),
      initialData: [],
    }),
  );

  return (
    <div className="h-full w-full">
      <div className="overflow-hidden text-card-foreground">
        <table className="w-full text-left">
          <thead className="uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Nickname</th>
              <th className="px-4 py-3 font-semibold">Activity</th>
              <th className="px-4 py-3 font-semibold">Ping</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {players.map((player) => (
              <tr key={player.id}>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {player.id}
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">
                  {player.nickname}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground capitalize border border-border/50">
                    {player.activity}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  {player.ping} ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
