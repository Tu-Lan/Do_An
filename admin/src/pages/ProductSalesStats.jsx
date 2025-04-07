import { useEffect, useState } from "react";
import axios from "axios";
import { backend_url } from "../App";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const ProductSalesStats = ({ token }) => {
  const [data, setData] = useState([]);
  const [totalSold, setTotalSold] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductSalesStats = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/product/sales-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setData(response.data.stats);
          setTotalSold(response.data.totalProductsSold); 
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching product sales stats:", error);
        toast.error("Failed to fetch product sales statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductSalesStats();
  }, [token]);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Thống kê sản phẩm bán ra</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Tổng số sản phẩm đã bán: <span className="text-blue-600">{totalSold}</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-6 text-left">Sản phẩm</th>
                  <th className="py-3 px-6 text-left">Số lượng bán ra</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-100">
                    <td className="py-2 px-6 flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-2 px-6">{item.totalSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSalesStats;
