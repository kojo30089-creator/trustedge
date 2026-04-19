import Chance from "@/components/RootComponents/Chance";
import CtaSection from "@/components/RootComponents/CtaSection";
import InvestInCrypto from "@/components/RootComponents/InvestInCrypto";
import Plans from "@/components/RootComponents/Plans";
import ServicesSection from "@/components/RootComponents/ServiceSection";

export default function Home() {
  return (
    <>
      <InvestInCrypto />
      <ServicesSection />
      <Plans />
      <Chance />
      <CtaSection/>
    </>
  );
}
