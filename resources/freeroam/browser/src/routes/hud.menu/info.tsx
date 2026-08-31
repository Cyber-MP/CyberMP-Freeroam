import { useAbility } from '@casl/react';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { chatState, getCommandArguments } from '@/store/chat';

export const Route = createFileRoute('/hud/menu/info')({
  component: RouteComponent,
});

function RouteComponent() {
  const { clientCommands, serverCommands } = useSnapshot(chatState);
  const ability = useAbility();

  const allCommands = useMemo(() => {
    return [...serverCommands, ...clientCommands].filter((command) =>
      command.can ? ability.can(...command.can) : true,
    );
  }, [serverCommands, clientCommands, ability]);

  return (
    <div className="flex flex-col w-full h-full p-6 overflow-y-auto bg-background text-foreground">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Chat Commands
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          A list of all available commands you can use in the chat.
        </p>
      </div>

      {allCommands.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No commands available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {allCommands.map((cmd, index) => {
            const args = getCommandArguments(cmd);

            return (
              <Card
                key={`${cmd.name}-${index}`}
                className="bg-card text-card-foreground border-border shadow-sm flex flex-col"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-mono text-primary flex items-center gap-2">
                    /{cmd.name}
                  </CardTitle>
                  {cmd.description && (
                    <CardDescription className="text-muted-foreground text-sm leading-snug mt-1">
                      {cmd.description}
                    </CardDescription>
                  )}
                </CardHeader>

                {args.length > 0 && (
                  <CardContent className="mt-auto pt-0">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {args.map((arg: any, i) => {
                        const argType = arg.type || 'string';
                        const argName =
                          arg.title || arg.description || `arg${i + 1}`;

                        return (
                          <div
                            key={i}
                            className="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground font-mono"
                          >
                            {argName}: {argType}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
