import { RiForbidLine } from '@remixicon/react';
import type React from 'react';
import type {
  ServerAbilityAction,
  ServerAbilitySubject,
} from '@/hooks/use-ability-rules';
import { useTypedAbility } from '@/hooks/use-typed-ability';

interface AbilityOverlayProps {
  action: ServerAbilityAction;
  subject: ServerAbilitySubject;
  children: React.ReactNode;
  fallbackMessage?: string;
}

export const AbilityOverlay = ({
  action,
  subject,
  children,
  fallbackMessage = 'Locked',
}: AbilityOverlayProps) => {
  const ability = useTypedAbility();
  const hasPermission = ability.can(action, subject);

  if (!hasPermission) {
    return children;
  }

  return (
    <div className="relative group/overlay w-full h-full overflow-hidden">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-[0.5px] rounded-md transition-all duration-200">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 border border-border text-secondary-foreground">
          <RiForbidLine className="size-5 text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            {fallbackMessage}
          </span>
        </div>
      </div>
    </div>
  );
};
