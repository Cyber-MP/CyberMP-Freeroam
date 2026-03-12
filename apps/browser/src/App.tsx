import { Button } from './components/ui/button';

export const App = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-background">
      <span className="text-2xl">hello world from browser</span>
      <Button variant={'secondary'}>Login</Button>
    </div>
  );
};
