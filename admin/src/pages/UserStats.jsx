import { useEffect, useState, useMemo } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import axios from "axios";
import { backend_url } from "../App";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { ClipLoader } from "react-spinners";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const formatDateVietnam = (date) => {
  const options = { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Ho_Chi_Minh" };
  return new Intl.DateTimeFormat("en-CA", options).format(date);
};

const UserStats = ({ token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line");
  const [userList, setUserList] = useState([]);

  const [startDate, setStartDate] = useState(() => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return formatDateVietnam(lastWeek);
  });
  const [endDate, setEndDate] = useState(() => formatDateVietnam(new Date()));

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${backend_url}/api/user/stats`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate, endDate },
          signal: controller.signal,
        });

        if (response.data.success) {
          setData(response.data.stats);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled", error.message);
        } else {
          toast.error("Failed to fetch user statistics.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [token, startDate, endDate]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUserList = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/user/registered-users`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate, endDate },
          signal: controller.signal,
        });

        if (response.data.success) {
          setUserList(response.data.users);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          toast.error("Failed to fetch registered users.");
        }
      }
    };

    fetchUserList();

    return () => {
      controller.abort();
    };
  }, [token, startDate, endDate]);

  const generateDateRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    const lastDate = new Date(end);

    while (currentDate <= lastDate) {
      dates.push(formatDateVietnam(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const dateRange = useMemo(() => generateDateRange(startDate, endDate), [startDate, endDate]);

  const chartData = useMemo(() => {
    return {
      labels: dateRange.map((date) => {
        const [year, month, day] = date.split("-");
        return new Date(year, month - 1, day).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }),
      datasets: [
        {
          label: "New Users",
          data: dateRange.map((date) => {
            const stat = data.find((item) => formatDateVietnam(new Date(item.date)) === date);
            return stat ? stat.count : 0;
          }),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          fill: true,
        },
      ],
    };
  }, [dateRange, data]);

  const commonOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "User Registration Statistics" },
    },
  }), []);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Thống kê người dùng đăng ký mới</h2>

      <div className="filters flex flex-wrap gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded-md shadow-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded-md shadow-sm"
        />
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="p-2 border rounded-md shadow-sm"
        >
          <option value="line">Biểu đồ đường</option>
          <option value="bar">Biểu đồ cột</option>
          <option value="pie">Biểu đồ tròn</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
        </div>
      ) : (
        <div className="chart-container" style={{ position: "relative", height: "400px" }}>
          {chartType === "line" && <Line data={chartData} options={commonOptions} />}
          {chartType === "bar" && <Bar data={chartData} options={commonOptions} />}
          {chartType === "pie" && <Pie data={chartData} options={commonOptions} />}
        </div>
      )}

      {!loading && (
        <div className="user-list mt-6">
          <h3 className="text-lg font-semibold mb-2">Danh sách người dùng đăng ký:</h3>
          <ul className="list-disc pl-5">
            {userList.map((user) => (
              <li key={user._id}>
                {user.name} - {user.email} - {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserStats;
