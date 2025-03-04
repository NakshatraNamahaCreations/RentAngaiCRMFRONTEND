import React, { useState, useEffect, useRef } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  ContextMenu,
  Filter,
  Page,
  ExcelExport,
  Edit,
  Inject,
  Search,
} from "@syncfusion/ej2-react-grids";
import axios from "axios";
import moment from "moment";
import { Toaster, toast } from "react-hot-toast";
import { Header } from "../components"; 
import { ApiURL } from "../path";
import { FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";

const PaymentReport = () => {
  const [orderData, setOrderData] = useState([]);
  console.log(orderData,"orderData")
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const gridRef = useRef(null); // Ref to access the GridComponent

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${ApiURL}/payment/`);
      if (response.status === 200) {
        setOrderData(response.data);
        setFilteredData(response.data); // Default to show all data
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch payment reports.");
    }
  };

  const filterDataByDate = () => {
    if (fromDate && toDate) {
      const filtered = orderData.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);
      });
      setFilteredData(filtered);

      if (filtered.length === 0) {
        toast.error("No data found for the selected date range.");
      }
    } else {
      setFilteredData(orderData); // Reset to show all data
    }
  };

  // const exportToExcel = () => {
  //   if (gridRef.current) {
  //     console.log("Exporting data to Excel...", filteredData);
  //     gridRef.current.excelExport(); // Trigger Excel Export
  //   } else {
  //     console.error("Grid reference is not available.");
  //   }
  // };

  const exportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No data available to export.");
      return;
    }
  
    // Create a worksheet from the filtered data
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        "Payment Date": moment(item.createdAt).format("L"),
        "Payment Time": new Date(item.createdAt).toLocaleTimeString(),
        "Quotation ID": item.quotationId?.quoteId || "N/A",
        "Grand Total": item.totalAmount,
        "Advanced Amount": item.advancedAmount,
        "Payment Mode": item.paymentMode,
        "Status": "Confirm",
      }))
    );
  
    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payment Report");
  
    // Export the workbook as an Excel file
    XLSX.writeFile(workbook, "Payment_Report.xlsx");
  };
  

  const deletePayment = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this payment?");
    if (!confirm) return;

    try {
      const response = await axios.delete(`${ApiURL}/payment/${id}`);
      if (response.status === 200) {
        toast.success("Payment deleted successfully.");
        fetchOrders(); // Refresh the data after deletion
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment.");
    }
  };

  return (
    <div className="m-2 mt-6 md:mt-2 p-2 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      <div
        className="flex"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Header category="PaymentReport" title="PaymentReport" />
        <div className="flex items-center space-x-4 mb-4 gap-20">
          {/* From Date Filter */}
          <div>
            <label htmlFor="fromDate">From:</label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>

          {/* To Date Filter */}
          <div>
            <label htmlFor="toDate">To:</label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={filterDataByDate}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Filter
          </button>

          {/* Export to Excel Button */}
          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Export to Excel
          </button>
        </div>
      </div>

      <GridComponent
        id="gridcomp"
        dataSource={filteredData} // Filtered data for the grid
        allowPaging
        allowSorting
        toolbar={["Search"]} // Enable search
        ref={gridRef} // Attach the grid reference
        
      >
        <ColumnsDirective>
          {/* Payment Date Column */}
          <ColumnDirective
            field="createdAt"
            headerText="Payment Date"
            template={(data) => {
              const date = new Date(data?.createdAt);
              return (
                <div>
                  <div>{moment(data?.createdAt).format("L")}</div>
                  <div>{date.toLocaleTimeString()}</div>
                </div>
              );
            }}
          />

          {/* Quotation ID Column */}
          <ColumnDirective
  headerText="Quotation Id"
  template={(data) => {
    // Check if quotationId exists and is an object
    if (data?.quotationId && typeof data?.quotationId === "object") {
      return <div>{data?.quotationId?.quoteId || "N/A"}</div>;
    }
    return <div>N/A</div>;
  }}
/>


          {/* Grand Total Column */}
          <ColumnDirective field="totalAmount" headerText="Grand Total" />

          {/* Advanced Amount Column */}
          <ColumnDirective
            field="advancedAmount"
            headerText="Advanced Amount"
          />

          {/* Payment Mode Column */}
          <ColumnDirective field="paymentMode" headerText="Payment Mode" />

          {/* Payment Status Column */}
          <ColumnDirective
            field="paymentStatus"
            headerText="Status"
            template={() => <span>Confirm</span>}
          />

          {/* Delete Column */}
          <ColumnDirective
            headerText="Action"
            template={(data) => (
              <button
                onClick={() => deletePayment(data._id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash size={16} />
              </button>
            )}
          />
        </ColumnsDirective>

        <Inject
          services={[
            Sort,
            ContextMenu,
            Filter,
            Page,
            Edit,
            ExcelExport,
            Search,
          ]}
        />
      </GridComponent>
    </div>
  );
};

export default PaymentReport;
