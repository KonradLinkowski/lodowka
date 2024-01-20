import { $, component$, useSignal } from "@builder.io/qwik";
import { Form, routeAction$, useNavigate, zod$ } from "@builder.io/qwik-city";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
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
  const nav = useNavigate();

  return (
    <>
      <Form
        action={createEventAction}
        onSubmitCompleted$={() => nav("/")}
        class="flex flex-col gap-y-2"
      >
        {[...Array(changes.value).keys()].map((index) => {
          const productNameKey = `changes.${index}.productName`;
          const quantityKey = `changes.${index}.quantity`;
          return (
            <div key={index}>
              <Input
                label="Product name"
                value={createEventAction.formData?.get(productNameKey)}
                name={productNameKey}
              />
              <Input
                label="Quantity"
                value={createEventAction.formData?.get(quantityKey)}
                name={quantityKey}
                type="number"
              />
            </div>
          );
        })}
        <Button type="button" onClick$={addChange}>
          +
        </Button>
        <Button type="submit">Create</Button>
      </Form>
      {createEventAction.value && !createEventAction.value.failed && (
        <div>
          <h2>User created successfully!</h2>
        </div>
      )}
    </>
  );
});
