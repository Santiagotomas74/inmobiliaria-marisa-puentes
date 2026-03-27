import Hero from "@/app/components/home/Hero";
import FeaturedProperties from "./components/home/FeaturedProperties";
import AboutUs from "./components/home/Abouts";
import ZonesSection from "./components/home/ZonesSection";
import PropertyValuationCTA from "./components/home/PropertyValuationCTA";
import ContactSection from "./components/home/ContactSection";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProperties/>
      <AboutUs/>
      <ZonesSection/>
      <PropertyValuationCTA/>
      <ContactSection/>
    </>
  );
}