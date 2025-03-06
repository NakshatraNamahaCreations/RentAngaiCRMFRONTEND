import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const SalesLinegraph = ({ selectedProduct }) => {
  const [salesdatas, setSalesdatas] = useState([]);
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");

  // Helper function to generate all months between startDate and endDate
  const getAllMonthsInRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = [];

    while (startDate <= endDate) {
      months.push(new Date(startDate).toISOString().slice(0, 7)); // Format: YYYY-MM
      startDate.setMonth(startDate.getMonth() + 1);
    }

    return months;
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/order/products/sales/individual/${selectedProduct?._id}`,
          {
            params: { startDate, endDate }, // Send date range if required
          }
        );

        if (response.data.success) {
          console.log("API Response:", response.data.data);
          setSalesdatas(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    if (selectedProduct?._id) {
      fetchSalesData();
    }
  }, [selectedProduct?._id, startDate, endDate]);

  // Process sales data to include all months
  const months = getAllMonthsInRange(startDate, endDate);
  const processedData = months.map((month) => {
    const found = salesdatas.find((data) => data.date.startsWith(month));
    return {
      date: month,
      totalSales: found ? found.totalSales : 0,
    };
  });

  // Prepare data for Chart.js
  const labels = processedData.map((item) => item.date); // X-axis labels
  const datasetValues = processedData.map((item) => item.totalSales); // Y-axis values

  const data = {
    labels: labels, // X-axis labels
    datasets: [
      {
        label: `Sales for ${selectedProduct?.name || "Product"}`,
        data: datasetValues, // Y-axis data
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        pointBackgroundColor: "rgb(75, 192, 192)",
        pointBorderWidth: 1,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Sales",
        },
        beginAtZero: true, // Start Y-axis from zero
      },
    },
  };

  return (
    <div>
      <h2>Sales Line Graph for {selectedProduct?.name || "Product"}</h2>
      <div>
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div style={{ width: "100%", height: "400px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SalesLinegraph;
