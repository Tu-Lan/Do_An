import Title from "./Title"
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import {Autoplay, Pagination} from 'swiper/modules'
import { useEffect, useState } from "react";
import Item from "./Item";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const NewArrivals = () => {
  const { books } = useContext(ShopContext);
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    if (books && books.length > 0) {
      const data = books.slice(0, 7);
      setNewArrivals(data.reverse());
    }
  }, [books]);

  return (
    <section className="max-padd-container py-16 bg-white">
      <Title title1={"Hàng"} title2={'mới về'} titleStyles={'pb-10'} paraStyles={'!block'}/>
      <Swiper
        autoplay={{
          delay: 3500,
          disableOnInteraction: false
        }}
        pagination={{
          clickable: true
        }}
        breakpoints={{
          400: {
            slidesPerView: 2,
            spaceBetween: 10
          },
          700: {
            slidesPerView: 3,
            spaceBetween: 10
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 10
          },
          1200: {
            slidesPerView: 5,
            spaceBetween: 10
          },
        }}
        modules={[Pagination, Autoplay]}
        className="h-[455px] sm:h-[488px] xl:h-[499px] mt-5"
      >
        {
          newArrivals.map((book) => (
            <SwiperSlide key={book._id}>
              <Item book={book}/>
            </SwiperSlide>
          ))
        }
      </Swiper>
    </section>
  )
}

export default NewArrivals
