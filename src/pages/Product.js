import React, { useState, useEffect, useRef } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Selection,
  Inject,
  Toolbar,
  Sort,
  Filter,
  Edit,
} from "@syncfusion/ej2-react-grids";
import { Line } from "react-chartjs-2";
import { Header } from "../components";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { ApiURL } from "../path";
import AddProduct from "./AddProduct";
import "@syncfusion/ej2-react-grids/styles/material-dark.css"; // Import dark theme CSS
import "@syncfusion/ej2-react-grids/styles/material.css"; // Import light theme CSS
import { Link, useNavigate } from "react-router-dom";
import editimage from "../assets/images/icons8-edit-50.png";
import graphicon from "../assets/images/icons8-graph-30.png";
import Modal from "react-modal";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Legend,
  Category,
  StackingColumnSeries,
  LineSeries,
  DateTime,
  Tooltip,
} from "@syncfusion/ej2-react-charts";
import { useStateContext } from "../contexts/ContextProvider";
import Calendar from "rsuite/Calendar";
// Import styles
import "rsuite/Calendar/styles/index.css";

function Product() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const gridRef = useRef(null);
  const [productData, setProductData] = useState([]);
  const [isAddProductVisible, setIsAddProductVisible] = useState(false);
  const [showBarChart, setShowBarChart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // State to hold selected product for chart
  const { currentMode } = useStateContext();
  console.log(selectedProduct?._id, "selectedProduct");
  const [showLineGraph, setShowLineGraph] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  // const { currentMode } = useStateContext();

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${ApiURL}/product/getinventoryproducts`
      );
      if (response.status === 200) {
        setProductData(response.data.ProductsData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product by ID
  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        const response = await axios.post(
          `${ApiURL}/product/deleteProducts/${id}`
        );
        if (response.status === 200) {
          toast.success("Successfully Deleted");
          fetchProducts(); // Refresh data after deletion
        }
      } catch (error) {
        toast.error("Product Not Deleted");
        console.error("Error deleting the product:", error);
      }
    }
  };

  // Handle toolbar actions
  const handleToolbarClick = async (args) => {
    if (args.item.id.includes("delete")) {
      const selectedRecords = gridRef.current.getSelectedRecords();
      if (selectedRecords.length) {
        try {
          const deletePromises = selectedRecords.map((record) =>
            deleteProduct(record._id)
          );
          await Promise.all(deletePromises);
          gridRef.current.clearSelection();
          toast.success("Selected records deleted successfully.");
        } catch (error) {
          toast.error("Error deleting selected records.");
        }
      } else {
        alert("Please select at least one record to delete.");
      }
    }
  };

  // Image template for product icon
  const renderImageTemplate = (props) => (
    <div>
      <img
        src={`http://localhost:8000/product/${props.ProductIcon}`}
        alt="Product Icon"
        style={{ width: "100px", height: "100px" }}
      />
    </div>
  );

  // Navigate to edit page
  const navigateToEdit = (props) => {
    const queryString = new URLSearchParams({
      rowData: JSON.stringify(props),
    }).toString();
    window.open(`/EditProduct?${queryString}`, "_blank");
  };

  // Render edit button and graph icon
  const renderEditButtonTemplate = (props) => {
    const productId = props?._id;

    return productId ? (
      <div className="flex">
        <button
          type="button"
          className="text-white py-1 px-2 capitalize rounded-1xl text-md"
          onClick={() => navigateToEdit(props)}
        >
          <img src={editimage} style={{ width: "25px", height: "25px" }} />
        </button>
        <div
          onClick={() => {
            setSelectedProduct(props);
            setModalIsOpen(true);
            // setShowBarChart(true);
          }}
        >
          <img
            src={graphicon}
            alt="Bar Chart Icon"
            style={{
              width: "25px",
              height: "25px",
              cursor: "pointer",
              marginTop: "6px",
            }}
          />
        </div>
      </div>
    ) : null;
  };

  // Generate dynamic chart data based on selected product
  const generateChartData = (product) => {
    if (!product || !product.inventory)
      return { inventoryData: [], salesData: [] };

    // Split the data into inventory and sales data
    const inventoryData = product.inventory.map((item) => ({
      x: item.startDate.split("T")[0], // Extract date part
      y: item.remainingQty, // Remaining quantity
    }));

    const salesData = product.inventory.map((item) => ({
      x: item.startDate.split("T")[0], // Extract date part
      y: item.qty, // Sales quantity
    }));

    return { inventoryData, salesData };
  };

  // Chart series based on selected product
  const { inventoryData, salesData } = generateChartData(selectedProduct);

  // Chart series based on selected product
  const stackedCustomSeries = [
    {
      dataSource: inventoryData,
      xName: "x",
      yName: "y",
      name: "Remaining Quantity",
      type: "StackingColumn",
      background: "blue",
    },
    {
      dataSource: salesData,
      xName: "x",
      yName: "y",
      name: "Sales Quantity",
      type: "StackingColumn",
      background: "green",
    },
  ];

  // Chart primary axes configuration
  const stackedPrimaryXAxis = {
    majorGridLines: { width: 0 },
    minorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    minorTickLines: { width: 0 },
    interval: 1,
    lineStyle: { width: 0 },
    labelIntersectAction: "Rotate45",
    valueType: "Category",
  };

  const stackedPrimaryYAxis = {
    lineStyle: { width: 0 },
    minimum: 0,
    maximum:
      selectedProduct && selectedProduct.inventory
        ? Math.max(
            ...selectedProduct.inventory.map((item) => item.ProductStock)
          ) || 200
        : 200, // Set maximum dynamically or fallback to 400
    interval: 100,
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
    labelFormat: "{value}",
  };

  useEffect(() => {
    if (selectedDateRange.startDate && selectedDateRange.endDate) {
      fetchMonthlyData();
    }
  }, [selectedDateRange]);

  // Line graph configuration
  const linePrimaryXAxis = {
    valueType: "DateTime",
    labelFormat: "dd/MM/yyyy",
    intervalType: "Days",
    edgeLabelPlacement: "Shift",
    majorGridLines: { width: 0 },
  };

  const linePrimaryYAxis = {
    labelFormat: "{value}",
    rangePadding: "None",
    minimum: 0,
    maximum: 100, // Adjust dynamically if needed
    interval: 10,
    majorTickLines: { width: 0 },
    lineStyle: { width: 0 },
  };

  const lineCustomSeries = [
    {
      dataSource: monthlyData,
      xName: "date",
      yName: "sales",
      name: "Monthly Sales",
      type: "Line",
      marker: { visible: true },
    },
    {
      dataSource: yearlyData,
      xName: "date",
      yName: "sales",
      name: "Yearly Sales",
      type: "Line",
      marker: { visible: true },
    },
  ];

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

  const productData1 = [
    { date: "2025-01-01", quantity: 10 },
    { date: "2025-01-02", quantity: 5 },
    { date: "2025-01-03", quantity: 15 },
    { date: "2025-01-04", quantity: 15 },
    { date: "2025-01-05", quantity: 15 },
    { date: "2025-01-06", quantity: 15 },
    { date: "2025-01-07", quantity: 15 },
    { date: "2025-01-08", quantity: 15 },
    { date: "2025-01-09", quantity: 15 },
    { date: "2025-01-010", quantity: 15 },
  ];

  // Function to get quantity for a specific date
  const getQuantityForDate = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    const product = productData1.find((item) => item.date === formattedDate);
    return product ? product.quantity : null;
  };

  return (
    <div className="m-2 mt-6 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      {!isAddProductVisible ? (
        <div>
          <Header category="Product Management" title="Products" />
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => setIsAddProductVisible(true)}
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Add Product
              </span>
            </button>
          </div>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            contentLabel="Example Modal"
            style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              },
              content: {
                width: "50%",
                margin: "auto",
                padding: "20px",
                borderRadius: "10px",
                textAlign: "center",
              },
            }}
          >
            <Calendar
              renderCell={(date) => {
                const quantity = getQuantityForDate(date);

                return quantity ? (
                  <div style={{ textAlign: "center", color: "green" }}>
                    {quantity} items
                  </div>
                ) : null;
              }}
            />
            <button
              onClick={() => setModalIsOpen(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ff4d4f",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#d9363e")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#ff4d4f")}
            >
              Close Modal
            </button>
          </Modal>
          {showBarChart && (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
              <div className="bg-white dark:bg-secondary-dark-bg p-6 rounded-lg shadow-lg relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => {
                    setShowBarChart(false);
                  }}
                  title="Close"
                >
                  &times;
                </button>
                {/* <h2 className="text-lg font-semibold mb-4">Bar Charts</h2>
                <ChartComponent
                  width="500px"
                  height="400px"
                  id="charts"
                  primaryXAxis={stackedPrimaryXAxis}
                  primaryYAxis={stackedPrimaryYAxis}
                  chartArea={{ border: { width: 0 } }}
                  tooltip={{ enable: true }}
                  background={currentMode === "Dark" ? "#33373E" : "#fff"}
                  legendSettings={{ background: "white" }}
                >
               
                  <Inject
                    services={[Legend, Category, StackingColumnSeries, Tooltip]}
                  />
                  <SeriesCollectionDirective>
                
                    {stackedCustomSeries.map((item, i) => (
                      <SeriesDirective key={i} {...item} />
                    ))}
                  </SeriesCollectionDirective>
                </ChartComponent> */}
                {/* <div
                  className="chart-container"
                  style={{ width: "100%", height: "300px" }}
                > */}

                {/* <Line data={data} options={options} /> */}
                {/* </div> */}
                {/* <ChartComponent
                  id="line-chart"
                  width="500px"
                  primaryXAxis={linePrimaryXAxis}
                  primaryYAxis={linePrimaryYAxis}
                  chartArea={{ border: { width: 0 } }}
                  tooltip={{ enable: true }}
                  background={currentMode === "Dark" ? "#33373E" : "#fff"}
                  legendSettings={{ background: "white" }}
                >
                  <Inject services={[LineSeries, Legend, Tooltip, DateTime]} />
                  <SeriesCollectionDirective>
                    {lineCustomSeries.map((item, i) => (
                      <SeriesDirective key={i} {...item} />
                    ))}
                  </SeriesCollectionDirective>
                </ChartComponent> */}
              </div>
            </div>
          )}

          <GridComponent
            dataSource={productData}
            allowPaging
            allowSorting
            toolbar={["Delete", "Search"]} // Add "Search" option here
            editSettings={{ allowDeleting: true, allowEditing: true }}
            width="auto"
            ref={gridRef}
            toolbarClick={handleToolbarClick}
          >
            <ColumnsDirective>
              <ColumnDirective
                field="ProductIcon"
                headerText="Product Icon"
                template={renderImageTemplate}
              />
              <ColumnDirective field="ProductName" headerText="Product Name" />
              <ColumnDirective field="ProductStock" headerText="Stock" />
              <ColumnDirective field="ProductPrice" headerText="Pricing" />
              <ColumnDirective field="seater" headerText="Seater" />
              <ColumnDirective field="Material" headerText="Material" />
              <ColumnDirective field="ProductSize" headerText="Size" />

              {/* <ColumnDirective field="offerPrice" headerText="Offer Price" />// */}
              <ColumnDirective field="ProductDesc" headerText="Description" />
              <ColumnDirective
                headerText="Edit"
                width="150"
                template={renderEditButtonTemplate}
                textAlign="Center"
              />
            </ColumnsDirective>
            <Inject services={[Page, Selection, Toolbar, Sort, Filter, Edit]} />
          </GridComponent>
        </div>
      ) : (
        <AddProduct />
      )}

      {/* <Calendar /> */}
    </div>
  );
}

export default Product;
