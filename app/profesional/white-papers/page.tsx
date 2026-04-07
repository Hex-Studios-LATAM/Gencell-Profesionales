import { redirect } from "next/navigation";

export default function WhitePapersRedirect() {
  redirect("/profesional/publicaciones?filtro=white-papers");
}
