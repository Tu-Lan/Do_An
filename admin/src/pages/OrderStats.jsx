/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { backend_url } from '../App';
import { toast } from 'react-toastify';
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
  Filler
} from 'chart.js';
import { ClipLoader } from 'react-spinners';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const formatDateVietnam = (date) => {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  };
  return new Intl.DateTimeFormat('en-CA', options).format(date);
};

const OrderStats = ({ token }) => {
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [chartType, setChartType] = useState('line'); 

  const [startDate, setStartDate] = useState(() => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return formatDateVietnam(lastWeek);
  });
  const [endDate, setEndDate] = useState(() => formatDateVietnam(new Date()));
  const [paymentType, setPaymentType] = useState('all'); 

  useEffect(() => {
    const controller = new AbortController(); 

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${backend_url}/api/order/stats`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
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
          console.log('Request canceled', error.message);
        } else {
          toast.error('Failed to fetch order statistics.');
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
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date.');
    }
  }, [startDate, endDate]);

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

  const filteredData = useMemo(() => {
    return data.filter(order => {
      const orderDate = formatDateVietnam(new Date(order.date));
      const dateMatch = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
      const paymentMatch = paymentType === 'all' || order.paymentMethod === paymentType;
      return dateMatch && paymentMatch;
    });
  }, [data, startDate, endDate, paymentType]);

  const aggregateData = useMemo(() => {
    const aggregation = {};

    filteredData.forEach(order => {
      const date = formatDateVietnam(new Date(order.date));
      if (!aggregation[order.paymentMethod]) {
        aggregation[order.paymentMethod] = {};
      }
      if (!aggregation[order.paymentMethod][date]) {
        aggregation[order.paymentMethod][date] = 0;
      }
      aggregation[order.paymentMethod][date] += order.amount;
    });

    return aggregation;
  }, [filteredData]);

  const chartData = useMemo(() => {
    return {
      labels: dateRange.map(date => {
        const [year, month, day] = date.split('-');
        return new Date(year, month - 1, day).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }),
      datasets: ['COD', 'Stripe']
        .filter(method => paymentType === 'all' || method === paymentType)
        .map(method => ({
          label: `${method} Orders`,
          data: dateRange.map(date => (aggregateData[method] && aggregateData[method][date]) || 0),
          borderColor: method === 'COD' ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
          backgroundColor: method === 'COD' ? 'rgba(54, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)',
          fill: true,
        })),
    };
  }, [dateRange, aggregateData, paymentType]);

  const pieChartData = useMemo(() => {
    const methodTotals = filteredData.reduce((acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.amount;
      return acc;
    }, {});

    return {
      labels: Object.keys(methodTotals),
      datasets: [
        {
          data: Object.values(methodTotals),
          backgroundColor: Object.keys(methodTotals).map(method =>
            method === 'COD' ? 'rgba(54, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)'
          ),
          borderColor: Object.keys(methodTotals).map(method =>
            method === 'COD' ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)'
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [filteredData]);

  const commonOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Order Statistics' },
    },
  }), []);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Thống kê hóa đơn</h2>

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
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="p-2 border rounded-md shadow-sm"
        >
          <option value="all">Tất cả hình thức thanh toán</option>
          <option value="COD">Tiền mặt</option>
          <option value="Stripe">Thẻ tín dụng</option>
        </select>
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
        <div className="chart-container" style={{ position: 'relative', height: '400px' }}>
          {chartType === 'line' && <Line data={chartData} options={commonOptions} />}
          {chartType === 'bar' && <Bar data={chartData} options={commonOptions} />}
          {chartType === 'pie' && <Pie data={pieChartData} options={commonOptions} />}
        </div>
      )}
    </div>
  );
};

export default OrderStats;
