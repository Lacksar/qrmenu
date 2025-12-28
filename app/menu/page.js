import MenuDisplayPage from "./MenuDisplayPage";
import SeoHead from "@/components/SeoHead";

// app/menu/page.js
export const metadata = {
  title: "Menu",
  description: "Explore our delicious menu items.",
  openGraph: {
    title: "Menu | Pancetta",
    description: "Explore our delicious menu items.",

    type: "website",
  },
};

export default function MenuPage() {
  return (
    <>
      <MenuDisplayPage />
    </>
  );
}
