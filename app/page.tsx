import Header from "../components/Layouts/Header";
import HeroSlider from "../components/HeroSlider";
import ActivitiesSection from "../components/ActivitiesSection";
import Footer from "../components/Layouts/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <ActivitiesSection />
      </main>
      <Footer />
    </>
  );
}
