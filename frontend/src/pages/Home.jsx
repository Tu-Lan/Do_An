import About from "../components/About"
import Features from "../components/Features"
import Footer from "../components/Footer"
import Hero from "../components/Hero"
import NewArrivals from "../components/NewArrivals"
import PopularBooks from "../components/PopularBooks"

const Home = () => {
  return (
    <>
      <Hero/>
      <NewArrivals/>
      <About/>
      <PopularBooks/>
      <Features/>
      <div className="max-padd-container bg-white">
        <Footer/>
      </div>
    </>
  )
}

export default Home
