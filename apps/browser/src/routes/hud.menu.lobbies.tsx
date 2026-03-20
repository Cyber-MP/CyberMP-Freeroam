import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/hud/menu/lobbies')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/hud/menu/lobbies"!</div>
}
