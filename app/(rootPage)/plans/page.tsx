import Chance from "@/components/RootComponents/Chance";
import CtaSection from "@/components/RootComponents/CtaSection"; 
import Onboarding from "@/components/RootComponents/Onboarding";
import Plans from "@/components/RootComponents/Plans";

export default function Home() {
  return (
    <> 
      <Plans />
      <Chance />
      <Onboarding />
      <CtaSection/>
    </>
  );
}
