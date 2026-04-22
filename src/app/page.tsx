import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Rituals from "@/components/Rituals";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { CommunityPopup } from "@/components/CommunityPopup";

export default function Home() {
  return (
    <>
      <Header />
      <Marquee />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <About />
        <Rituals />
        <Contact />
      </main>
      <Footer />
      <CommunityPopup />
    </>
  );
}
