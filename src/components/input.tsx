import { component$ } from "@builder.io/qwik";

interface InputProps {
  name: string;
  value: any;
  label: string;
  type?: string;
}

export const Input = component$<InputProps>(({ name, value, label }) => {
  return (
    <label class="flex flex-col">
      <span>{label}</span>
      <input name={name} value={value} class="border" />
    </label>
  );
});
