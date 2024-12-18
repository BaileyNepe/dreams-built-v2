import { createLazyFileRoute } from '@tanstack/react-router';

function AboutComponent() {
  return (
    <div className="p-2">
      <h3>About</h3>
    </div>
  );
}

export const Route = createLazyFileRoute('/_landing/about')({
  component: AboutComponent
});
