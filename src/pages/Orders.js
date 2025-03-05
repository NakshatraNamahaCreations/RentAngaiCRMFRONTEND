import React, { useState, useEffect } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  ContextMenu,
  Filter,
  Page,
  ExcelExport,
  PdfExport,
  Edit,
  Inject,
} from "@syncfusion/ej2-react-grids";
import Calendar from "./Calendar";
import axios from "axios";
import { Header } from "../components"; // Adjust the import path as necessary
import { ApiURL } from "../path"; // Adjust the import path as necessary
import moment from "moment/moment";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Calendars from "./Calendar";
import { AiOutlineSearch } from "react-icons/ai";


const Orders = () => {

const navigate = useNavigate()

  const [toggle, setToggle] = useState(false);
  const [orderData, setOrderData] = useState([]);
  console.log(orderData,"orderdata");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState(""); // State for From date
  const [toDate, setToDate] = useState("");
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${ApiURL}/order/getallorder`);
      if (res.status === 200) {
        const transformedData = res.data.orderData.map((order) => ({
          ...order,
          productsDisplay: order.products.map(
            (p) => `${p.ProductName} @ ${p.qty} x ${p.Price}`
          ),

          addressDisplay: `${order.Address.address}, ${order.Address.other}`,
          formattedStartDate: moment(order.startDate).format("DD-MM-YYYY"),
          formattedEndDate: moment(order.endDate).format("DD-MM-YYYY"),
        }));
        setOrderData(transformedData);
        setFilteredData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  // console.log(orderData.flatMap((ele)=>ele.products),"orderdata");
  // const extraProducts = orderData.flatMap((ele)=>ele.products)
  // const filteredProducts = extraProducts.filter((product) => product.ProductId === "Product 1")

  const updateStatus = async (data) => {
    const confirm = window.confirm("Are you sure want to Approve this order?");

    if (confirm) {
      try {
        const { _id, orderStatus } = data;
        let status = ""; // Define status outside the if-else block

        if (orderStatus === "Inprocess") {
          status = "Approved";
        } else {
          status = orderStatus;
        }

        const response = await axios.put(
          `${ApiURL}/order/updateStatus/${_id}`,
          {
            orderStatus: status,
          }
        );

        if (response.status === 200) {
          toast.success("Successfully Updated");
          window.location.reload("");
        } else {
          toast.error("Failed to update order status");
        }
      } catch (error) {
        console.error("Error updating the order status:", error);
        toast.error("Error updating the order status");
      }
    }
  };

  const navigateToDetails = (_id) => {
    // Navigate to the next page and pass the `_id` in state
    navigate("/orders/details", { state: { id: _id } });
  };

  useEffect(() => {
    filterDataByDate();
  }, [fromDate, toDate]);

  // Filter data by date range
  const filterDataByDate = () => {
    if (fromDate && toDate) {
      const filtered = orderData.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(orderData); // Reset to show all data if no dates are selected
    }
  };



const handleSearch = (e) => {
  const value = e.target.value.toLowerCase();
  setSearchTerm(value);

  if (value === "") {
    setFilteredData(orderData); // Reset to show all data
  } else {
    const filtered = orderData.filter(
      (order) =>
        order?.clientName?.toLowerCase().includes(value) ||
        moment(order?.createdAt).format("L").includes(value) ||
        order?.GrandTotal?.toString().includes(value) ||
        order?.Address?.toLowerCase().includes(value) ||
        order?.orderStatus?.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  }
};

  // const filterDataByDate = () => {
  //   if (fromDate && toDate) {
  //     const filtered = orderData.filter((order) => {
  //       const orderDate = new Date(order.createdAt);
  //       return orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);
  //     });
  //     setFilteredData(filtered);
  //   } else {
  //     setFilteredData(orderData); // Reset to show all data if no dates are selected
  //   }
  // };
  
  return (
    <div className="m-2 mt-6 md:mt-2 p-2 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      <div className="flex">
        <Header category="Client" title="List View" />
      </div>
      <div className="" style={{display:"flex",justifyContent:"space-between"}}>
      <label className="inline-flex items-center cursor-pointer mb-3">
        <span className="ms-3 mx-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          List View
        </span>
        <input
          type="checkbox"
          className="sr-only peer"
          onChange={(e) => setToggle(e.target.checked)}
        />
        <div className="relative mx-4 w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ms-3 mx-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Calendar View
        </span>
      </label>
      {/* <div className="flex items-center space-x-4 mb-4 gap-20" >
        <div>
          <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">
            From:
          </label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            style={{border:"1px solid black",borderRadius:"5px",padding:"10px 30px"}}
          />
        </div>
        <div>
          <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">
            To:
          </label>
          <input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            style={{border:"1px solid black",borderRadius:"5px",padding:"10px 30px"}}
          />
        </div>
        <button
          onClick={filterDataByDate}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Filter
        </button>
      </div> */}
        <div className="flex items-center space-x-4 mb-4 gap-20">
          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">
              From:
            </label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              style={{ border: "1px solid black", borderRadius: "5px", padding: "10px 30px" }}
            />
          </div>
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">
              To:
            </label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              style={{ border: "1px solid black", borderRadius: "5px", padding: "10px 30px" }}
            />
          </div>
        </div>
      </div>
    
      <div className="relative mb-4">
  <input
    type="text"
    placeholder="Search by Client Name, Date, Amount, Address, Status..."
    value={searchTerm}
    onChange={handleSearch}
    className="w-96 border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-500"
  />
  <AiOutlineSearch className="absolute left-3 top-3 text-gray-500 text-lg" />
</div>

      {toggle ? (
        <Calendars />
      ) : (
      
        <GridComponent
          id="gridcomp"
          dataSource={filteredData}
          allowPaging
          allowSorting
        >
          <ColumnsDirective>
            <ColumnDirective
              field="createAt"
              headerText="Book Date/Time"
              template={(data) => {
                
                const date = new Date(data?.createdAt);
                const time = date.toLocaleTimeString(); // Get local time string
                return (
                  <div>
                    <div>{moment(data?.createdAt).format("L")}</div>
                    <div>{time} </div>
                    {/* <div>{moment(data).format("h:mm:ss a")}</div> */}
                  </div>
                );
              }}
            />
            <ColumnDirective field="clientName" headerText="Client Name" />
            {/* <ColumnDirective
              field="productsDisplay"
              headerText="Items"
              template={(data) => (
                <div>
                  {data.productsDisplay.map((item, index) => (
                    <div key={index}>{item}</div>
                  ))}
                </div>
              )}
            /> */}

            <ColumnDirective field="GrandTotal" headerText="Grand Total" />
            <ColumnDirective
              field="formattedStartDate"
              headerText="Start Date"
            />
            {/* <ColumnDirective field="formattedEndDate" headerText="End Date" /> */}
            <ColumnDirective
              field="Address"
              headerText="Address"
              template={(data) => (
                <div className="address-display">
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {data.Address}
                  </div>
                </div>
              )}
            />
            {/* <ColumnDirective
              field="paymentStatus"
              headerText="Payment Status"
            /> */}

           

           <ColumnDirective
              field="orderStatus"
              headerText="ACTION"
              template={(data) => (
         
                <div
                onClick={() => navigateToDetails(data._id)}
                  style={{
                    cursor: "pointer",
                    color: "white",
                    borderRadius: "5px",
                    background:
                      data.orderStatus === "Approved" ? "green" : "orange",
                    padding: 5,
                    width: "120px",
                    textAlign: "center",
                  }}
                >
                  
               View more details
                </div>
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
              PdfExport,
            ]}
          />
        </GridComponent>
      )}
    </div>
  );
};

export default Orders;
