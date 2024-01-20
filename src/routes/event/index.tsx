import { $, component$, useSignal } from "@builder.io/qwik";
import { Form, routeAction$, zod$ } from "@builder.io/qwik-city";
import { prisma } from "~/prisma";

export const useCreateEvent = routeAction$(
  async ({ changes }) => {
    return prisma.$transaction(async (tx) => {
      const products = await Promise.all(
        changes.map(async ({ productName, quantity }) => {
          const product = await tx.product.upsert({
            where: {
              name: productName,
            },
            update: {},
            create: {
              name: productName,
            },
          });
          return { product, quantity };
        }),
      );

      const event = await tx.event.create({
        data: {
          changes: {
            create: products.map(({ product, quantity }) => ({
              quantity,
              productId: product.id,
            })),
          },
        },
      });
      return event;
    });
  },
  zod$((z) => ({
    changes: z.array(
      z.object({
        productName: z.string(),
        quantity: z.string().transform((x) => Number(x)),
      }),
    ),
  })),
);

export default component$(() => {
  const createEventAction = useCreateEvent();
  const changes = useSignal(1);
  const addChange = $(() => (changes.value += 1));

  return (
    <>
      <Form action={createEventAction} class="flex flex-col">
        {[...Array(changes.value).keys()].map((index) => {
          const productNameKey = `changes.${index}.productName`;
          const qualityKey = `changes.${index}.quantity`;
          return (
            <div key={index}>
              <label>
                Product name
                <input
                  name={productNameKey}
                  value={createEventAction.formData?.get(productNameKey)}
                />
              </label>
              <label>
                Quantity
                <input
                  name={qualityKey}
                  type="number"
                  value={createEventAction.formData?.get(qualityKey)}
                />
              </label>
            </div>
          );
        })}
        <button type="button" onClick$={addChange}>
          +
        </button>
        <button type="submit">Create</button>
      </Form>
      {createEventAction.value && !createEventAction.value.failed && (
        <div>
          <h2>User created successfully!</h2>
        </div>
      )}
    </>
  );
});
