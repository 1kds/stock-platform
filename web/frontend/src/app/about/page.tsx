import { AboutSections } from "@/components/organisms/AboutSections";
import { AboutNav } from "@/components/organisms/AboutNav";

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-6xl gap-10">
      <AboutSections className="min-w-0 flex-1" />
      <AboutNav className="hidden lg:block" />
    </div>
  );
}
