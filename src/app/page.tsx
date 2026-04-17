import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Rituals from "@/components/Rituals";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { CommunityPopup } from "@/components/CommunityPopup";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <Rituals />
        <Contact />
      </main>
      <Footer />
      <CommunityPopup />
    </>
  );
}
