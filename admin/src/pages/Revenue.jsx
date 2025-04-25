import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { backend_url } from "../App";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Revenue = ({ token }) => {
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/order/revenue`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setStats(response.data.stats);
        } else {
          console.error("Error fetching stats:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-container p-6">
      <h2 className="text-2xl font-bold mb-4">Doanh Thu Thống Kê</h2>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Doanh Thu</h3>
          <p className="text-xl">{stats.totalRevenue.toLocaleString()}₫</p>
        </div>
        <div className="bg-green-100 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Lợi Nhuận</h3>
          <p className="text-xl">{stats.totalProfit.toLocaleString()}₫</p>
        </div>
        <div className="bg-red-100 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Chi Phí</h3>
          <p className="text-xl">{stats.totalCost.toLocaleString()}₫</p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4">Doanh Thu Theo Thời Gian</h3>
        <Line
          data={{
            labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"], // Gần đây hoặc tuần theo dữ liệu của bạn
            datasets: [
              {
                label: "Doanh Thu",
                data: [stats.totalRevenue, stats.totalRevenue * 1.1, stats.totalRevenue * 1.2, stats.totalRevenue * 1.3], // Ví dụ, thay bằng dữ liệu thực tế
                fill: false,
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "Biểu đồ Doanh Thu",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Revenue;
