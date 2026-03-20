import { createRootRoute, Outlet } from '@tanstack/react-router';

const RootLayout = () => {
  // const [devtools, setDevtools] = useState(false);

  // useHotkeys('f7', () => {
  //   setDevtools((prev) => !prev);
  // });

  // useFocus(devtools, [devtools]);

  return (
    <>
      <Outlet />
      {/*{devtools && <TanStackRouterDevtools initialIsOpen={true} />}*/}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
