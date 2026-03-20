import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/hud/menu/weapons')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/hud/menu/weapons"!</div>
}
