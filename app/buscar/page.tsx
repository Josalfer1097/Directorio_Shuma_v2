import { redirect } from "next/navigation";

export default function BuscarPage() {
  // Redirect to directorio with search focus
  redirect("/directorio?focus=search");
}
