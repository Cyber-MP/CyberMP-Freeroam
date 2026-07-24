import { AnimatePresence, motion } from 'framer-motion';
import { IoSkull } from 'react-icons/io5';
import { useGlitch } from 'react-powerglitch';
import { useSnapshot } from 'valtio';
import { killFeedState } from '@/store/killfeed';

export const KillFeed = () => {
  const { killFeed } = useSnapshot(killFeedState);
  const glitch = useGlitch({
    playMode: 'always',
    glitchTimeSpan: {
      start: 0.1,
    },
  });

  return (
    <div className="fixed left-0 bottom-76 w-full flex flex-col">
      <AnimatePresence mode="popLayout">
        {killFeed
          .slice()
          .reverse()
          .map((o) => (
            <motion.div
              layout
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              key={o.id}
              className="flex items-center gap-2.5 text-[18px] w-fit px-2.5 py-1.5 rounded-md text-white overflow-hidden whitespace-nowrap"
            >
              {o.killerName && (
                <span
                  ref={o.isKillerOnFire ? glitch.ref : undefined}
                  className={`px-2 py-1 rounded font-semibold text-base transition-colors duration-300 ${'text-[#ff1744]'}`}
                >
                  {o.killerName}
                </span>
              )}

              <span className="flex items-center justify-center">
                <IoSkull size={16} className="text-[#ffef00]" />
              </span>

              <span
                className={`px-2 py-1 rounded font-semibold text-base transition-colors duration-300 ${'text-[#ff1744]'}`}
              >
                {o.victimName}
              </span>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
};
