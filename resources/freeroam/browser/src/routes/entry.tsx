import { createFileRoute } from '@tanstack/react-router';
import { GlitchText } from '@/components/ui/glitch-text';
import { Logo } from '@/components/ui/logo';
import { useFocus } from '@/hooks/use-focus';
import { client } from '@/rpc';

export const Route = createFileRoute('/entry')({
  component: RouteComponent,
});

function RouteComponent() {
  const onClick = () => {
    client.session.enter.trigger();
  };

  useFocus();

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-black/20 fixed inset-0 w-full h-full flex flex-col gap-[0.7407vh] items-center justify-center"
    >
      <div
        className="

              flex items-center
              font-black
              italic
              tracking-tighter
              leading-none
              gap-[0.3704vh]
              text-[2.8vh]
            "
      >
        <Logo className="size-[4vh]" />
        <GlitchText>
          <span className="text-foreground">FREEROAM</span>
        </GlitchText>
      </div>
      <div className="max-w-[62.2222vh] text-center space-y-[0.5556vh] animate-in fade-in zoom-in duration-700">
        {/*<h1 className="text-[4vh] font-bold tracking-tight">
          WELCOME TO THE{' '}
          <GlitchText>
            <span className="text-primary">UNBOUND</span>
          </GlitchText>
        </h1>*/}

        <p className="text-muted-foreground text-[1.7vh] md:text-[1.8vh] leading-relaxed">
          Welcome to a physics-driven sandbox where anything goes.{' '}
          <span className="text-white font-medium">
            Spawn detailed vehicles
          </span>
          ,{' '}
          <span className="text-white font-medium">
            reshape the world in real-time
          </span>{' '}
          with other players, or press{' '}
          <span className="text-white font-medium">F2 &rarr; Matchmaking</span>{' '}
          to host and join custom races, PvP battles, and game modes.
        </p>

        <div className="pt-[0.7vh] text-[1.7vh] text-primary">
          Click anywhere to continue
        </div>

        {/*<p className="text-[1.2vh] text-gray-600 uppercase tracking-[0.5em] pt-[1vh]">
          {'Experimental Build v0.4.2 // Open Source License'}
        </p>*/}
      </div>
    </div>
  );
}
