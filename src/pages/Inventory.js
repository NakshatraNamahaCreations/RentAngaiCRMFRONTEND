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
import { Header } from "../components";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { ApiURL } from "../path";
import "@syncfusion/ej2-react-grids/styles/material-dark.css"; // Import dark theme CSS
import "@syncfusion/ej2-react-grids/styles/material.css"; // Import light theme CSS
import graphicon from "../assets/images/icons8-graph-30.png";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Legend,
  Category,
  StackingColumnSeries,
  Tooltip,
} from "@syncfusion/ej2-react-charts";

import { useStateContext } from "../contexts/ContextProvider";

function Inventory() {
  const gridRef = useRef(null);
  const [productData, setProductData] = useState([]);
  const [showBarChart, setShowBarChart] = useState(false);
  const { currentMode } = useStateContext();

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${ApiURL}/product/getProductsInventory`
      );
      if (response.status === 200) {
        setProductData(response.data.Product);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle toolbar actions
  const handleToolbarClick = async (args) => {
    if (args.item.id.includes("delete")) {
      const selectedRecords = gridRef.current.getSelectedRecords();
      if (selectedRecords.length > 0) {
        try {
          const deletePromises = selectedRecords.map((record) =>
            deleteProduct(record._id)
          );
          await Promise.all(deletePromises);
          gridRef.current.clearSelection();
          toast.success("Selected records deleted successfully.");
          fetchProducts(); // Refresh data after deletion
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
        src={`http://localhost:8500/product/${props.ProductIcon}`}
        alt="Product Icon"
        style={{ width: "60px", height: "60px" }}
      />
    </div>
  );

  // Stacked chart data
  const stackedChartData = [
    [
      { x: "18-06-24", y: 111.1 },
      { x: "19-06-24", y: 127.3 },
      { x: "20-06-24", y: 143.4 },
      { x: "21-06-24", y: 159.9 },
      { x: "22-06-24", y: 159.9 },
      { x: "23-06-24", y: 159.9 },
      { x: "24-06-24", y: 159.9 },
    ],
    [
      { x: "18-06-24", y: 111.1 },
      { x: "19-06-24", y: 127.3 },
      { x: "20-06-24", y: 143.4 },
      { x: "21-06-24", y: 159.9 },
      { x: "22-06-24", y: 159.9 },
      { x: "23-06-24", y: 159.9 },
      { x: "24-06-24", y: 159.9 },
    ],
  ];

  // Stacked custom series
  const stackedCustomSeries = [
    {
      dataSource: stackedChartData[0],
      xName: "x",
      yName: "y",
      name: "Sale",
      type: "StackingColumn",
      background: "blue",
    },

    {
      dataSource: stackedChartData[1],
      xName: "x",
      yName: "y",
      name: "Remaining",
      type: "StackingColumn",
      background: "red",
    },
  ];

  // Stacked primary x-axis
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

  // Stacked primary y-axis
  const stackedPrimaryYAxis = {
    lineStyle: { width: 0 },
    minimum: 100,
    maximum: 400,
    interval: 100,
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
    labelFormat: "{value}",
  };

  return (
    <div className="m-2 mt-6 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />

      <Header category="Product Management" title="Inventory" />

      {showBarChart && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white dark:bg-secondary-dark-bg p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setShowBarChart(false)}
              title="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Bar Charts</h2>
            <ChartComponent
              width="500px" // Adjust width and height
              height="400px"
              id="charts"
              primaryXAxis={stackedPrimaryXAxis}
              primaryYAxis={stackedPrimaryYAxis}
              chartArea={{ border: { width: 0 } }}
              tooltip={{ enable: true }}
              background={currentMode === "Dark" ? "#33373E" : "#fff"}
              legendSettings={{ background: "white" }}
            >
              {/* Inject required services */}
              <Inject
                services={[Legend, Category, StackingColumnSeries, Tooltip]}
              />
              <SeriesCollectionDirective>
                {/* Render each column data */}
                {stackedCustomSeries.map((item, i) => (
                  <SeriesDirective key={i} {...item} />
                ))}
              </SeriesCollectionDirective>
            </ChartComponent>
          </div>
        </div>
      )}

      <GridComponent
        dataSource={productData}
        allowPaging
        allowSorting
        toolbar={["Search", "Delete"]} // Add delete to toolbar options
        editSettings={{ allowDeleting: true, allowEditing: true }}
        width="auto"
        ref={gridRef}
        toolbarClick={handleToolbarClick}
        cssClass="e-dark" // Assuming you handle theme globally
      >
        <ColumnsDirective>
          <ColumnDirective
            field="ProductIcon"
            headerText="Product Icon"
            template={renderImageTemplate}
            width="100"
          />
          <ColumnDirective
            field="ProductName"
            headerText="Product Name"
            width="150"
          />
          <ColumnDirective
            field="ProductStock"
            headerText="Stock"
            width="100"
          />
          <ColumnDirective
            field="Dates"
            headerText="Today Sale"
            template={(data) => <div>{data?.Dates[0]?.qty || 0}</div>}
            width="100"
          />
          <ColumnDirective
            field="Dates"
            headerText="Remaining"
            template={(data) => <div>{data?.Dates[0]?.remaining || 0}</div>}
            width="100"
          />
          <ColumnDirective
            template={() => (
              <div onClick={() => setShowBarChart(true)}>
                <img
                  src={graphicon}
                  alt="Bar Chart Icon"
                  style={{ width: "40px", height: "40px", cursor: "pointer" }}
                />
              </div>
            )}
            width="100"
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Selection, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
}

export default Inventory;
