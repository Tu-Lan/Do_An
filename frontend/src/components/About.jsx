import { TbTruckReturn } from "react-icons/tb"
import Title from "./Title"
import about from '../assets/book_1.png';

const About = () => {
  return (
    <section className="max-padd-container py-12 xl:py-24">
      {/* container */}
      <div className="flexCenter flex-col gap-16 xl:gap-8 xl:flex-row">
        {/* left side */}
        <div className="flex-1">
          <Title title1={"Hé lộ các"} title2={"tính năng chính của chúng tôi!"} titleStyles={'pb-10'} paraStyles={'!block'}/>
          <div className="flex flex-col items-start gap-y-4">
            <div className="flexCenter gap-x-4">
              <div className="h-16 min-w-16 bg-secondaryOne flexCenter rounded-md">
                <TbTruckReturn className="text-2xl"/>
              </div>
              <div>
                <h4 className="medium-18">Quy trình trả hàng dễ dàng</h4>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis quam iusto itaque perspiciatis</p>
              </div>
            </div>
            <div className="flexCenter gap-x-4">
              <div className="h-16 min-w-16 bg-secondaryOne flexCenter rounded-md">
                <TbTruckReturn className="text-2xl"/>
              </div>
              <div>
                <h4 className="medium-18">Thanh toán an toàn</h4>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis quam iusto itaque perspiciatis</p>
              </div>
            </div>
            <div className="flexCenter gap-x-4">
              <div className="h-16 min-w-16 bg-secondaryOne flexCenter rounded-md">
                <TbTruckReturn className="text-2xl"/>
              </div>
              <div>
                <h4 className="medium-18">Hỗ trợ khách hàng</h4>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis quam iusto itaque perspiciatis</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flexCenter">
          <div className="bg-secondaryOne flexCenter p-24 max-h-[33rem] max-w-[33rem] rounded-3xl">
            <img src={about} alt="aboutImg" height={244} width={244} className="shadow-2xl shadow-slate-900/50 rounded-lg"/>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
