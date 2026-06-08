import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KAI Asset — Denah Stasiun" },
      {
        name: "description",
        content:
          "Sistem manajemen denah stasiun KAI — kelola area komersial, pelayanan, dan operasional di seluruh Daop & Divre.",
      },
      { property: "og:title", content: "KAI Asset — Denah Stasiun" },
      {
        property: "og:description",
        content: "Kelola denah & area aset stasiun KAI dengan mudah.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/kai.html"
      title="KAI Asset Denah Stasiun"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
        background: "#eef3fb",
      }}
    />
  );
}
