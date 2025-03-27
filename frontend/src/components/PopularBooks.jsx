import { useContext, useEffect, useState } from "react"
import { ShopContext } from "../context/ShopContext"
import Title from "./Title";
import Item from "./Item";

const PopularBooks = () => {
  const { books } = useContext(ShopContext);
  const [popularBooks, setPopularBooks] = useState([]);

  useEffect(() => {
    if (books && books.length > 0) {
      const data = books.filter(item => item.popular);
      setPopularBooks(data.slice(0, 5));
    }
  }, [books]);

  return (
    <section className="max-padd-container py-16 bg-white">
      <Title title1={'Sách'} title2={"phổ biến"} titleStyles={'pb-10'} paraStyles={'!block'} />
      {/* container */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
        {popularBooks.map(book => (
          <div key={book._id}>
            <Item book={book} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default PopularBooks
