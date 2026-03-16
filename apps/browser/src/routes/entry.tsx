import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { GlitchText } from '@/components/ui/glitch-text';
import { Logo } from '@/components/ui/logo';
import { client } from '@/rpc';

export const Route = createFileRoute('/entry')({
  component: RouteComponent,
});

function RouteComponent() {
  const onClick = () => {
    client.session.enter.trigger();
  };

  useEffect(() => {
    client.cef.setFocus.trigger(true);

    return () => {
      client.cef.setFocus.trigger(false);
    };
  }, []);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-black/20 fixed inset-0 w-full h-full flex flex-col gap-[0.7407vh] items-center justify-center"
    >
      <div className="flex items-center gap-[0.3704vh]">
        <Logo className="size-[4vh]" />
        <h2
          className="
                  h-full
                  flex items-center
                  font-black
                  italic
                  tracking-tighter
                  leading-none
                  text-[2.8vh]
                "
        >
          FREEROAM
        </h2>
      </div>
      <div className="max-w-[62.2222vh] text-center space-y-[0.5556vh] animate-in fade-in zoom-in duration-700">
        <h1 className="text-[4vh] font-bold tracking-tight">
          WELCOME TO THE{' '}
          <GlitchText>
            <span className="text-primary">UNBOUND</span>
          </GlitchText>
        </h1>

        <p className="text-muted-foreground text-[1.7vh] md:text-[1.8vh] leading-relaxed">
          You are entering a 100% open-source chaos playground. No rules, just
          physics. Right now, you can{' '}
          <span className="text-white font-medium">
            spawn high-fidelity vehicles
          </span>
          ,
          <span className="text-white font-medium">
            {' '}
            engage in sandbox combat
          </span>
          , and
          <span className="text-white font-medium">
            {' '}
            modify the world in real-time
          </span>{' '}
          with other players.
        </p>

        <div className="pt-[0.7vh] text-[1.7vh] text-primary">
          Click anywhere to continue
        </div>

        <p className="text-[1.2vh] text-gray-600 uppercase tracking-[0.5em] pt-[1vh]">
          {'Experimental Build v0.4.2 // Open Source License'}
        </p>
      </div>
    </div>
  );
}
