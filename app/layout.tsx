import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Wigy",
  description: "Project Istiqamah widget text manager"
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
