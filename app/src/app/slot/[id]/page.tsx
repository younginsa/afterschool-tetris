import { notFound } from "next/navigation";
import academies from "@data/academies.json";
import type { Academy } from "@/lib/types";
import { SlotClient } from "./SlotClient";

const data = academies as Academy[];

export function generateStaticParams() {
  return data.map((a) => ({ id: a.id }));
}

export default async function SlotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const academy = data.find((a) => a.id === id);
  if (!academy) notFound();
  return <SlotClient academy={academy} />;
}
