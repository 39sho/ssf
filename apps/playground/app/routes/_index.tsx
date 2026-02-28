import { redirect } from "react-router";

export function clientLoader() {
  throw redirect("/basic");
}

export default function Index() {
  return null;
}
