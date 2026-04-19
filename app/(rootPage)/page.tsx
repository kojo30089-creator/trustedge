"use client";
import Chance from "@/components/RootComponents/Chance";
import ChooseUS from "@/components/RootComponents/ChooseUS";
import Description from "@/components/RootComponents/Description";
import HeroSection from "@/components/RootComponents/HeroSection";
import HowWeWork from "@/components/RootComponents/HowWeWork";
import InvestInCrypto from "@/components/RootComponents/InvestInCrypto";
import Onboarding from "@/components/RootComponents/Onboarding";
import Plans from "@/components/RootComponents/Plans";
import Control from "@/components/RootComponents/Control";
import CtaSection from "@/components/RootComponents/CtaSection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <Description />
      <ChooseUS />
      <InvestInCrypto />
      <Control />
      <HowWeWork />
      <Plans />
      <Chance />
      <Onboarding />
      <CtaSection />
    </>
  );
}
