import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead, Link } from "@builder.io/qwik-city";
import { prisma } from "~/prisma";

export const useGetEvents = routeLoader$(async () => {
  const events = await prisma.event.findMany({
    include: {
      changes: {
        include: {
          product: true,
        },
      },
    },
  });
  return events;
});

export default component$(() => {
  const events = useGetEvents();
  return (
    <>
      <h1>Events</h1>
      <Link href="/event">Add event</Link>
      <ol class="ml-8 list-decimal">
        {events.value.map((event) => (
          <li key={event.id}>
            Event id {event.id}
            <ul class="ml-8 list-disc">
              {event.changes.map((change) => (
                <li key={change.id}>
                  <dl class="grid w-72 grid-cols-2">
                    <dt>Product name</dt>
                    <dd>{change.product.name}</dd>
                    <dt>Quantity</dt>
                    <dd>{change.quantity}</dd>
                  </dl>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
