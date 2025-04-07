import { RiSearch2Line } from "react-icons/ri";
import { LuSettings2 } from "react-icons/lu";
import Title from "../components/Title";
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Item from "../components/Item";
import Footer from "../components/Footer";

const Shop = () => {
  const { books, backend_url } = useContext(ShopContext);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${backend_url}/api/category/list`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        console.error("Failed to fetch categories:", data.message);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const toggleFilter = (value, setState) => {
    setState((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const applyFilter = () => {
    let filtered = [...books];
    if (search) {
      filtered = filtered.filter((book) => {
        const lowerCaseSearch = search.toLowerCase();
        return (
          book.name.toLowerCase().includes(lowerCaseSearch) || 
          (book.author && book.author.toLowerCase().includes(lowerCaseSearch)) ||  
          (book.publisher && book.publisher.toLowerCase().includes(lowerCaseSearch)) 
        );
      });
    }
    if (category.length) {
      filtered = filtered.filter((book) => category.includes(book.category));
    }
    return filtered;
  };


  // Sắp xếp sách
  const applySorting = (booksList) => {
    switch (sortType) {
      case "low":
        return booksList.sort((a, b) => a.price - b.price);
      case "high":
        return booksList.sort((a, b) => b.price - a.price);
      default:
        return booksList;
    }
  };

  useEffect(() => {
    fetchCategories(); 
  }, []);

  useEffect(() => {
    let filtered = applyFilter();
    let sorted = applySorting(filtered);
    setFilteredBooks(sorted);
    setCurrentPage(1);
  }, [category, sortType, books, search]);

  // useEffect(() => {
  //   getProductsData(); // Gọi API lấy danh sách sản phẩm mà không cần kiểm tra token
  // }, []);

  const getPaginatedBooks = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBooks.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  return (
    <section className="max-padd-container bg-white">
      <div className="pt-28">
        <div className="w-full max-w-2xl flexCenter">
          <div className="inline-flex items-center justify-center bg-primary overflow-hidden w-full rounded-full p-4 px-5">
            <div className="text-lg cursor-pointer">
              <RiSearch2Line />
            </div>
            <input
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              type="text"
              placeholder="Search here..."
              className="border-none outline-none w-full text-sm pl-4 bg-primary"
            />
            <div className="flexCenter cursor-pointer text-lg border-l pl-2">
              <LuSettings2 />
            </div>
          </div>
        </div>
        <div className="mt-12 mb-16">
          <div className="flex justify-between items-center mb-4">
            <h4 className="h4 hidden sm:flex">Thể loại:</h4>
            <button
              onClick={() => setCategory([])}
              className="btn-primary px-4 py-2 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all text-sm"
            >
              Clear Filter
            </button>
          </div>
          <div className="flexCenter sm:flexStart flex-wrap gap-x-12 gap-y-4">
            {categories.map((cat) => (
              <label key={cat._id} className="cursor-pointer">
                <input
                  name="category"
                  value={cat.name}
                  onChange={(e) => {
                    setCategory((prev) =>
                      prev.includes(e.target.value) ? prev.filter((item) => item !== e.target.value) : [...prev, e.target.value]
                    );
                  }}
                  type="checkbox"
                  checked={category.includes(cat.name)}
                  className="hidden peer"
                />
                <div className="flexCenter flex-col gap-2 peer-checked:bg-secondaryOne peer-checked:text-white transition-all">
                  <div className="bg-primary h-20 w-20 flexCenter rounded-full peer-checked:bg-secondaryOne">
                    <img src={cat.image} alt={cat.name} className="object-cover h-10 w-10" />
                  </div>
                  <span className="medium-14 peer-checked:text-white">{cat.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="flexBetween !items-start gap-7 flex-wrap pb-16 max-sm:flexCenter text-center">
            <Title
              title1={"Các cuốn sách"}
              title2={"của chúng tôi"}
              titleStyles={"pb-0 text-start"}
              paraStyles={"!block"}
            />
            <div>
              <span className="hidden sm:flex medium-16">Lọc:</span>
              <select
                onChange={(e) => setSortType(e.target.value)}
                className="text-sm p-2.5 outline-none bg-primary to-gray-30 rounded"
              >
                <option value="relevant">Relevant</option>
                <option value="low">Giá thấp</option>
                <option value="high">Giá cao</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {getPaginatedBooks().length > 0 ? (
              getPaginatedBooks().map((book) => <Item book={book} key={book._id} />)
            ) : (
              <p>Không tìm thấy sách phù hợp</p>
            )}
          </div>
        </div>
        <div className="flexCenter mt-14 mb-10 gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={`btn-secondary !py-1 !px-3 ${currentPage === 1 && "opacity-50 cursor-not-allowed"
              }`}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`btn-light !py-1 !px-3 ${currentPage === index + 1 && "!bg-secondaryOne"
                }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={`btn-secondary !py-1 !px-3 ${currentPage === totalPages && "opacity-50 cursor-not-allowed"
              }`}
          >
            Next
          </button>
        </div>
        <Footer />
      </div>
    </section>
  );
};

export default Shop;
