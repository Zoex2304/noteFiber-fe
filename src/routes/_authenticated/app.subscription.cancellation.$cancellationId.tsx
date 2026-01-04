import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/app/subscription/cancellation/$cancellationId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_authenticated/app/subscription/cancellation/$cancellationId"!
    </div>
  )
}
