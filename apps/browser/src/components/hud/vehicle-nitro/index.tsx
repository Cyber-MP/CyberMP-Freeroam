import { useImplement } from '@cybermp/rpc-router-react';
import { motion } from 'framer-motion';
import { memo, useState } from 'react';
import { type VehicleNitroUpdate, vehicleNitroContract } from './contract';

export const VehicleNitro = memo(() => {
  const [state, setState] = useState<VehicleNitroUpdate>({
    capacity: 100,
    isAvailable: false,
    isPenalty: false,
  });

  useImplement(vehicleNitroContract.update, ({ data }) => {
    setState(data);
  });

  if (!state?.isAvailable) {
    return null;
  }

  const { capacity, isPenalty } = state;
  const colorClass = isPenalty ? 'red' : capacity < 30 ? 'yellow' : 'cyan';

  const color = isPenalty
    ? '#ff4466'
    : colorClass === 'yellow'
      ? '#ffe600'
      : '#00d3f2';

  return (
    <div className="absolute left-24 bottom-12 w-52 perspective-near -skew-x-2 -rotate-3 transition-opacity duration-150">
      <div
        className="relative bg-black/85 p-1 border"
        style={{
          clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)',
          borderColor: color,
          opacity: state.isAvailable ? 1 : 0,
        }}
      >
        {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
          <div
            key={pos}
            className="absolute w-1.5 h-1.5 opacity-85"
            style={{
              top: pos.includes('t') ? 0 : undefined,
              bottom: pos.includes('b') ? 0 : undefined,
              left: pos.includes('l') ? 0 : undefined,
              right: pos.includes('r') ? 0 : undefined,
              borderStyle: 'solid',
              borderWidth: `${pos.includes('t') ? '1.5px' : 0} ${pos.includes('r') ? '1.5px' : 0} ${pos.includes('b') ? '1.5px' : 0} ${pos.includes('l') ? '1.5px' : 0}`,
              borderColor: color,
            }}
          />
        ))}

        <div className="flex items-center gap-1 px-1 py-0.5 border-b border-white/5">
          <motion.div
            className="w-1 h-1 rounded-full"
            animate={{ opacity: [1, 0.2, 1] }}
            style={{
              backgroundColor: color,
            }}
            transition={{
              duration: isPenalty ? 0.3 : colorClass === 'yellow' ? 0.5 : 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <span
            className="font-mono text-[10px] tracking-widest uppercase opacity-50"
            style={{ color }}
          >
            nitro sys
          </span>
          <motion.span
            className="font-mono text-sm tracking-widest ml-auto opacity-70"
            style={{ color }}
            animate={isPenalty ? { opacity: [1, 0.2, 1] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            {isPenalty
              ? 'PENALTY'
              : colorClass === 'yellow'
                ? 'L0W'
                : 'CH4RGED'}
          </motion.span>
        </div>

        <div className="relative h-[15px] bg-black/60 overflow-hidden">
          <motion.div
            className="h-full"
            style={{
              background: isPenalty
                ? 'linear-gradient(90deg, rgba(200,0,30,0.9), #ff4466)'
                : colorClass === 'yellow'
                  ? 'linear-gradient(90deg, rgba(200,180,0,0.9), #ffe600)'
                  : 'linear-gradient(90deg, rgba(0,200,200,0.9), cyan)',
            }}
            animate={{
              width: `${capacity}%`,
              opacity: [1, 0.7, 0.85, 1],
              boxShadow: [
                `0 0 3px 1px ${color}`,
                `0 0 8px 2px ${color}`,
                `0 0 3px 1px ${color}`,
              ],
            }}
            transition={{
              width: { duration: 0.5, ease: 'linear' },
              opacity: { duration: isPenalty ? 1.5 : 3, repeat: Infinity },
              boxShadow: { duration: isPenalty ? 0.8 : 2, repeat: Infinity },
            }}
          />

          <motion.div
            className="absolute top-0 left-0 right-0 h-1/4 pointer-events-none"
            style={{
              background:
                'linear-gradient(transparent, rgba(255,255,255,0.04), transparent)',
            }}
            animate={{ y: ['-100%', '400%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />

          <div className="absolute inset-0 flex pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i as number}
                className="flex-1 border-r border-black/40 last:border-r-0"
              />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
            <span
              className="font-mono text-[10px] tracking-widest opacity-60"
              style={{ color }}
            >
              NITRO
            </span>
            <span
              className="font-mono text-[10px] font-bold tracking-wider"
              style={{ textShadow: `0 0 5px ${color}`, color }}
            >
              {capacity.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex gap-1 px-1 py-0.5 border-t border-white/5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i as number}
              className="h-0.5 flex-1 rounded-xs"
              style={{
                backgroundColor:
                  i < Math.round(capacity / 10) ? color : '#ffffff20',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
