import { Slot, component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

interface ButtonProps {
  href?: string;
  type?: string;
  onClick$?: () => void;
}

export const Button = component$<ButtonProps>(({ href }) => {
  const props = {
    href,
    class: "cursor-pointer select-none bg-blue-600 px-4 py-2 text-white",
  };

  return (
    <>
      {href ? (
        <Link {...props}>
          <Slot />
        </Link>
      ) : (
        <button {...props}>
          <Slot />
        </button>
      )}
    </>
  );
});
