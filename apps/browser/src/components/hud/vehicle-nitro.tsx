import { useQuery } from '@tanstack/react-query';
import ms from 'ms';
import { memo } from 'react';
import { clientQuery } from '@/rpc';

const VehicleNitro = memo(() => {
  const info = useQuery(
    clientQuery.vehicleNitro.info.queryOptions({
      refetchInterval: ms('0.5s'),
    }),
  );

  if (!info.data?.isAvailable) return null;

  const { capacity, isPenalty } = info.data;

  const colorClass = isPenalty
    ? 'red'
    : capacity < 25
      ? 'yellow'
      : capacity < 50
        ? 'yellow'
        : 'cyan';

  const filledPips = Math.round(capacity / 10);

  return (
    <div className="absolute left-24 bottom-24 w-64 perspective-[400px] -skew-x-2 -rotate-3">
      <style>{`
        @keyframes nx-scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes nx-flicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.7; }
          98% { opacity: 0.85; }
        }
        @keyframes nx-pulse-cyan { 0%, 100% { box-shadow: 0 0 4px 1px cyan; } 50% { box-shadow: 0 0 10px 3px cyan; } }
        @keyframes nx-pulse-yellow { 0%, 100% { box-shadow: 0 0 4px 1px #ffe600; } 50% { box-shadow: 0 0 10px 3px #ffe600; } }
        @keyframes nx-pulse-red { 0%, 100% { box-shadow: 0 0 4px 1px #ff4466; } 50% { box-shadow: 0 0 12px 4px #ff4466; } }
        @keyframes nx-tick { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        .nx-dot { animation: nx-tick var(--dot-speed, 1s) infinite; }
        .nx-bar-cyan { background: linear-gradient(90deg, rgba(0,200,200,0.9), cyan); animation: nx-flicker 3s infinite, nx-pulse-cyan 2s infinite; }
        .nx-bar-yellow { background: linear-gradient(90deg, rgba(200,180,0,0.9), #ffe600); animation: nx-flicker 3s infinite, nx-pulse-yellow 2s infinite; }
        .nx-bar-red { background: linear-gradient(90deg, rgba(200,0,30,0.9), #ff4466); animation: nx-flicker 1.5s infinite, nx-pulse-red 0.8s infinite; }
        .nx-scanline { animation: nx-scanline 2.5s linear infinite; }
        .nx-penalty { animation: nx-tick 0.3s infinite; }
      `}</style>

      <div
        className="relative border bg-black/85 p-1.5"
        style={{
          borderColor: isPenalty
            ? 'rgba(255,68,102,0.4)'
            : colorClass === 'yellow'
              ? 'rgba(255,230,0,0.25)'
              : 'rgba(0,255,255,0.25)',
          clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
        }}
      >
        {['tl', 'tr', 'bl', 'br'].map((pos) => (
          <div
            key={pos}
            className="absolute w-1.5 h-1.5"
            style={{
              top: pos.includes('t') ? 0 : undefined,
              bottom: pos.includes('b') ? 0 : undefined,
              left: pos.includes('l') ? 0 : undefined,
              right: pos.includes('r') ? 0 : undefined,
              borderStyle: 'solid',
              borderWidth: `${pos.includes('t') ? '1.5px' : 0} ${pos.includes('r') ? '1.5px' : 0} ${pos.includes('b') ? '1.5px' : 0} ${pos.includes('l') ? '1.5px' : 0}`,
              borderColor: isPenalty
                ? '#ff4466'
                : colorClass === 'yellow'
                  ? '#ffe600'
                  : 'cyan',
              opacity: 0.85,
            }}
          />
        ))}

        <div className="flex items-center gap-1 px-1.5 py-0.5 border-b border-white/5">
          <div
            className="nx-dot w-1 h-1 rounded-full"
            style={{
              background: isPenalty
                ? '#ff4466'
                : colorClass === 'yellow'
                  ? '#ffe600'
                  : 'cyan',
              ['--dot-speed' as string]: isPenalty
                ? '0.3s'
                : colorClass === 'yellow'
                  ? '0.5s'
                  : '1s',
            }}
          />
          <span
            className="font-mono text-xs tracking-1 uppercase opacity-50"
            style={{
              color: isPenalty
                ? '#ff4466'
                : colorClass === 'yellow'
                  ? '#ffe600'
                  : 'cyan',
            }}
          >
            nitro sys
          </span>
          <span
            className={`font-mono text-[8px] tracking-widest ml-auto opacity-70 ${isPenalty ? 'nx-penalty' : ''}`}
            style={{
              color: isPenalty
                ? '#ff4466'
                : colorClass === 'yellow'
                  ? '#ffe600'
                  : 'rgba(0,255,255,0.4)',
            }}
          >
            {isPenalty ? 'PENALTY' : colorClass === 'yellow' ? 'LOW' : 'NX-7'}
          </span>
        </div>

        <div className="relative h-[18px] bg-black/60 overflow-hidden">
          <div
            className={`h-full nx-bar-${colorClass}`}
            style={{
              width: `${capacity}%`,
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            }}
          />

          <div
            className="nx-scanline absolute top-0 left-0 right-0 h-1/4 pointer-events-none"
            style={{
              background:
                'linear-gradient(transparent, rgba(255,255,255,0.04), transparent)',
            }}
          />

          <div className="absolute inset-0 flex pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i as number}
                className="flex-1 border-r border-black/40 last:border-r-0"
              />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
            <span
              className="font-mono text-xs tracking-[2px] opacity-60"
              style={{
                color: isPenalty
                  ? '#ff4466'
                  : colorClass === 'yellow'
                    ? '#ffe600'
                    : 'cyan',
              }}
            >
              NITRO
            </span>
            <span
              className="font-mono text-xs font-bold tracking-[1px]"
              style={{
                color: isPenalty
                  ? '#ff4466'
                  : colorClass === 'yellow'
                    ? '#ffe600'
                    : '#00ffff',
                textShadow: `0 0 6px ${isPenalty ? '#ff4466' : colorClass === 'yellow' ? '#ffe600' : 'cyan'}`,
              }}
            >
              {capacity}%
            </span>
          </div>
        </div>

        <div className="flex gap-[3px] px-1.5 py-0.5 border-t border-white/5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i as number}
              className="h-[3px] flex-1 rounded-[1px]"
              style={{
                background:
                  i < filledPips
                    ? isPenalty
                      ? '#ff4466'
                      : colorClass === 'yellow'
                        ? '#ffe600'
                        : 'cyan'
                    : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

VehicleNitro.displayName = 'VehicleNitro';
export { VehicleNitro };
