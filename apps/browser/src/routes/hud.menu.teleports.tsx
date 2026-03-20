import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/hud/menu/teleports')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/hud/menu/teleports"!</div>
}
