import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { backend_url } from "../App";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Revenue = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(""); // State cho tuần được chọn
  const [availableWeeks, setAvailableWeeks] = useState([]); // Danh sách tuần khả dụng

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/order/revenue`, {
          headers: { Authorization: `Bearer ${token}` },
          params: selectedWeek ? { week: selectedWeek } : {}, // Gửi tham số week nếu có
        });
        console.log("API response:", response.data);
        if (response.data.success) {
          setStats(response.data.stats);
          // Lấy danh sách tuần từ dữ liệu nếu không có tuần được chọn
          if (!selectedWeek && response.data.stats.weeklyData) {
            setAvailableWeeks(
              response.data.stats.weeklyData.map((weekData) => weekData.week)
            );
          }
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
  }, [token, selectedWeek]); // Thêm selectedWeek vào dependency để gọi lại API khi tuần thay đổi

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Không có dữ liệu để hiển thị.</div>;

  // Chuẩn bị dữ liệu cho biểu đồ
  console.log("weeklyData:", stats.weeklyData);
  const chartLabels = stats.weeklyData?.map((weekData) => {
    const weekNumber = weekData.week?.split("-")[1];
    return weekNumber ? `Tuần ${weekNumber}` : "Tuần không xác định";
  }) || ["Không có dữ liệu"];
  const chartRevenueData = stats.weeklyData?.map((weekData) => Number(weekData.revenue) || 0) || [0];
  console.log("chartLabels:", chartLabels);
  console.log("chartRevenueData:", chartRevenueData);

  return (
    <div className="dashboard-container p-6">
      <h2 className="text-2xl font-bold mb-4">Doanh Thu Thống Kê</h2>

      {/* Dropdown chọn tuần */}
      <div className="mb-4">
        <label htmlFor="weekSelect" className="mr-2">Chọn tuần:</label>
        <select
          id="weekSelect"
          value={selectedWeek}
          onChange={handleWeekChange}
          className="border rounded p-2"
        >
          <option value="">Tất cả tuần</option>
          {availableWeeks.map((week) => (
            <option key={week} value={week}>
              Tuần {week.split("-")[1]} ({week.split("-")[0]})
            </option>
          ))}
        </select>
      </div>

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
      <div className="chart-container" style={{ width: "100%", height: "400px" }}>
        <h3 className="text-lg font-semibold mb-4">Doanh Thu Theo Thời Gian</h3>
        <Line
          data={{
            labels: chartLabels,
            datasets: [
              {
                label: "Doanh Thu",
                data: chartRevenueData,
                fill: false,
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.1,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: selectedWeek
                  ? `Doanh Thu Tuần ${selectedWeek.split("-")[1]}`
                  : "Biểu đồ Doanh Thu Theo Tuần",
              },
              legend: {
                display: true,
                position: "top",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Doanh Thu (VND)",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Tuần",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Revenue;