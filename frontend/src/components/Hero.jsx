import { Link } from "react-router-dom"
import bg from '../assets/bg.png';
import pencil from '../assets/pencil.png';

const Hero = () => {
  return (
    <section className="max-padd-container py-20 xl:py-36">
      <div className="flexCenter gap-12 flex-col xl:flex-row">
        {/* left side */}
        <div className="flex flex-1 flex-col pt-12 xl:pt-32">
          <h1 className="h1 max-w-[46rem]">Khám phá
              <span className="inline-flex">
                <span className="inline-flex items-center justify-center p-5 h-16 w-16 bg-secondary text-white -rotate-[31deg] rounded-full">S</span>
                ách
                </span>
                <img src={pencil} alt="penceil" height={49} width={49} className="inline-flex relative bottom-2"/>
            Điều đó truyền cảm hứng cho thế giới của bạn</h1>
          <p>Khám phá thế giới của những câu chuyện, kiến thức và cảm hứng. Khám phá những cuốn sách khơi dậy trí tưởng tượng, mở rộng góc nhìn và làm phong phú thêm hành trình của bạn. Từ những tác phẩm kinh điển vượt thời gian đến những kiệt tác hiện đại, hãy tìm cuốn sách hoàn hảo cho mọi khoảnh khắc</p>
          <div className="mt-6">
            <Link to={'/shop'} className="btn-secondaryOne">Khám phá ngay</Link>
          </div>
        </div>
        {/* Right side */}
        <div className="flex flex-1 relative z-10 top-12">
          <div>
            <img src={bg} alt="bg"/>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
