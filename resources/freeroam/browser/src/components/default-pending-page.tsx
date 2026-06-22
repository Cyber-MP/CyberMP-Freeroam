import { Spinner } from './ui/spinner';

export const DefaultPendingPage = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Spinner />
    </div>
  );
};
