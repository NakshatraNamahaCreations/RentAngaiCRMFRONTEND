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
        <Header title="Orders View" />
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


// import React, { useState, useEffect } from "react";
// import {
//   GridComponent,
//   ColumnsDirective,
//   ColumnDirective,
//   Sort,
//   ContextMenu,
//   Filter,
//   Page,
//   ExcelExport,
//   PdfExport,
//   Edit,
//   Inject,
// } from "@syncfusion/ej2-react-grids";
// import Calendar from "./Calendar";
// import axios from "axios";
// import { Header } from "../components"; // Adjust the import path as necessary
// import { ApiURL } from "../path"; // Adjust the import path as necessary
// import moment from "moment/moment";
// import { toast, Toaster } from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import Calendars from "./Calendar";
// import { AiOutlineSearch } from "react-icons/ai";




// const Orders = () => {


//   const navigate = useNavigate()

//   const [orderData, setOrderData] = useState([]);
//   console.log(orderData,"orderdata");
  
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredData, setFilteredData] = useState([]);
//   const [fromDate, setFromDate] = useState(""); // State for From date
//   const [toDate, setToDate] = useState("");
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const res = await axios.get(`${ApiURL}/order/getallorder`);
//       if (res.status === 200) {
//         const transformedData = res.data.orderData.map((order) => ({
//           ...order,
//           productsDisplay: order.products.map(
//             (p) => `${p.ProductName} @ ${p.qty} x ${p.Price}`
//           ),

//           addressDisplay: `${order.Address.address}, ${order.Address.other}`,
//           formattedStartDate: moment(order.startDate).format("DD-MM-YYYY"),
//           formattedEndDate: moment(order.endDate).format("DD-MM-YYYY"),
//         }));
//         setOrderData(transformedData);
//         setFilteredData(transformedData);
//       }
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     }
//   };
//   // console.log(orderData.flatMap((ele)=>ele.products),"orderdata");
//   // const extraProducts = orderData.flatMap((ele)=>ele.products)
//   // const filteredProducts = extraProducts.filter((product) => product.ProductId === "Product 1")

//   const updateStatus = async (data) => {
//     const confirm = window.confirm("Are you sure want to Approve this order?");

//     if (confirm) {
//       try {
//         const { _id, orderStatus } = data;
//         let status = ""; // Define status outside the if-else block

//         if (orderStatus === "Inprocess") {
//           status = "Approved";
//         } else {
//           status = orderStatus;
//         }

//         const response = await axios.put(
//           `${ApiURL}/order/updateStatus/${_id}`,
//           {
//             orderStatus: status,
//           }
//         );

//         if (response.status === 200) {
//           toast.success("Successfully Updated");
//           window.location.reload("");
//         } else {
//           toast.error("Failed to update order status");
//         }
//       } catch (error) {
//         console.error("Error updating the order status:", error);
//         toast.error("Error updating the order status");
//       }
//     }
//   };

//   const navigateToDetails = (_id) => {
//     // Navigate to the next page and pass the `_id` in state
//     navigate("/orders/details", { state: { id: _id } });
//   };

//   useEffect(() => {
//     filterDataByDate();
//   }, [fromDate, toDate]);

//   // Filter data by date range
//   const filterDataByDate = () => {
//     if (fromDate && toDate) {
//       const filtered = orderData.filter((order) => {
//         const orderDate = new Date(order.createdAt);
//         return orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);
//       });
//       setFilteredData(filtered);
//     } else {
//       setFilteredData(orderData); // Reset to show all data if no dates are selected
//     }
//   };



// const handleSearch = (e) => {
//   const value = e.target.value.toLowerCase();
//   setSearchTerm(value);

//   if (value === "") {
//     setFilteredData(orderData); // Reset to show all data
//   } else {
//     const filtered = orderData.filter(
//       (order) =>
//         order?.clientName?.toLowerCase().includes(value) ||
//         moment(order?.createdAt).format("L").includes(value) ||
//         order?.GrandTotal?.toString().includes(value) ||
//         order?.Address?.toLowerCase().includes(value) ||
//         order?.orderStatus?.toLowerCase().includes(value)
//     );
//     setFilteredData(filtered);
//   }
// };

//   const invoiceData = {
//     company: {
//       name: "Rent Angadi",
//       address:
//         "Sy No 258/6, Old Sy No 258/1 Battahalsur Jala, Hobli, Bettahalsur, Bangalore, Bengaluru, Urban Karnataka - 560001",
//       phone: "+91 9619868262",
//       gstin: "29ABJFR2437B1Z3",
//     },
//     invoice: {
//       number: "RA114",
//       date: "4th March 2025",
//       reverseCharge: "N",
//       state: "Karnataka",
//       code: "29",
//     },
//     billing: {
//       name: "M/s. Yellow Umbrella Production House (OPC) Pvt. LTD",
//       address:
//         "No,503, 8th main, weshwing, Amarjyothi Layout Domlur Extn, Bangalore",
//       gstin: "29AABCY6686L1ZE",
//       state: "Karnataka",
//       code: "29",
//     },
//     shipping: {
//       name: "N/A",
//       address: "N/A",
//       gstin: "N/A",
//       state: "N/A",
//       code: "N/A",
//     },
//     products: [
//       { description: "Pink Metal Chair", hsn: "9403", days: 1, qty: 15, rate: 300 },
//       { description: "Matrix Center Table", hsn: "9403", days: 1, qty: 2, rate: 750 },
//       { description: "Flamingo Side Table", hsn: "9403", days: 1, qty: 2, rate: 750 },
//       { description: "White Chester Drawer", hsn: "9403", days: 1, qty: 1, rate: 4000 },
//       { description: "Banquet Dining Table with Frill 6' * 2'", hsn: "9403", days: 1, qty: 10, rate: 300 },
//       { description: "Manpower", hsn: "9403", days: 1, qty: 6, rate: 1500 },
//       { description: "Transportation", hsn: "9403", days: 1, qty: 1, rate: 6500 },
//     ],
//     bankDetails: {
//       accountNo: "50200099507304",
//       ifsc: "HDFC0004051",
//       bankName: "HDFC, CMH Road",
//     },
//   };

//   const calculateTotals = () => {
//     let totalBeforeTax = 0;
//     let totalTax = 0;
//     let totalAfterTax = 0;

//     invoiceData.products.forEach((product) => {
//       let amount = product.qty * product.days * product.rate;
//       let gstAmount = (amount * 9) / 100; // Assuming 9% CGST + 9% SGST
//       let total = amount + 2 * gstAmount;

//       totalBeforeTax += amount;
//       totalTax += 2 * gstAmount;
//       totalAfterTax += total;
//     });

//     return { totalBeforeTax, totalTax, totalAfterTax };
//   };

//   const totals = calculateTotals();

//   return (
//     <div style={{ width: "900px", margin: "20px auto", border: "2px solid black", padding: "10px", fontFamily: "Arial" }}>
      
//       {/* Header Section */}
//       <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid black", }}>
//         <div style={{ width: "30%" }}>
//           <img src="../logorentangadi.png" alt="Company Logo" style={{ width: "120px" }} />
//         </div>
//         <div style={{ textAlign: "center", width: "70%", background: "#1f497d", color: "white", padding: "15px", borderRadius: "5px" }}>
//           <h2 style={{ margin: 0 }}>{invoiceData.company.name}</h2>
//           <p style={{ margin: "5px 0" }}>{invoiceData.company.address}</p>
//           <p style={{ margin: 0 }}>Tel: {invoiceData.company.phone} | GSTIN: {invoiceData.company.gstin}</p>
//         </div>
//       </div>

//       <h2 style={{ textAlign: "center", background: "#1f497d", color: "white", padding: "8px", margin: "15px 0", borderRadius: "5px" }}>Tax Invoice</h2>

//       {/* Invoice Details Table */}
//       <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginBottom: "15px", }}>
//         <tbody>
//           <tr style={{display:'grid'}}>
//             <td><b>Invoice No:</b> {invoiceData.invoice.number}</td>
//             <td><b>Invoice Date:</b> {invoiceData.invoice.date}</td>
//             <td><b>Reverse Charge (Y/N):</b> {invoiceData.invoice.reverseCharge}</td>
//             <td><b>State:</b> {invoiceData.invoice.state} | Code: {invoiceData.invoice.code}</td>
//           </tr>
//         </tbody>
//       </table>

//       {/* Billing & Shipping Details */}
//       <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginBottom: "15px", border: "1px solid black" }}>
//   <thead style={{ background: "#1f497d", color: "white" }}>
//     <tr>
//       <th style={{ border: "1px solid black", padding: "8px" }}>Bill to Party</th>
//       <th style={{ border: "1px solid black", padding: "8px" }}>Ship to Party</th>
//     </tr>
//   </thead>
//   <tbody>
//     <tr>
//       <td style={{ border: "1px solid black", padding: "8px", textAlign: "left" }}>
//         <b>Name:</b> {invoiceData.billing.name} <br />
//         <b>Address:</b> {invoiceData.billing.address} <br />
//         {/* <b>GSTIN:</b> {invoiceData.billing.gstin} <br /> */}
//         <b>State:</b> {invoiceData.billing.state} | Code: {invoiceData.billing.code}
//       </td>
//       <td style={{ border: "1px solid black", padding: "8px", textAlign: "right" }}>
//         <b>Name:</b> {invoiceData.shipping.name} <br />
//         <b>Address:</b> {invoiceData.shipping.address} <br />
//       </td>
//     </tr>
//   </tbody>
// </table>


//       {/* Product Table (Fixed Borders) */}
//       <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginBottom: "15px", textAlign: "center" }}>
//       <thead style={{ background: "#1f497d", color: "white" }}>
//     <tr>
//       <th style={{ border: "1px solid black", padding: "8px" }}>S.No.</th>
//       <th style={{ border: "1px solid black", padding: "8px" }}>Product Description</th>
//       <th style={{ border: "1px solid black", padding: "8px" }}>No of Days</th>
//       <th style={{ border: "1px solid black", padding: "8px" }}>Qty</th>
//       <th style={{ border: "1px solid black", padding: "8px" }}>Rate</th>
//       <th style={{ border: "1px solid black", padding: "8px" }}>Amount</th>
//     </tr>
//   </thead>
//   <tbody>
//     {invoiceData.products.map((product, index) => {
//       let amount = product.qty * product.days * product.rate;
//       return (
//         <tr key={index}>
//           <td style={{ border: "1px solid black", padding: "8px" }}>{index + 1}</td>
//           <td style={{ border: "1px solid black", padding: "8px" }}>{product.description}</td>
//           <td style={{ border: "1px solid black", padding: "8px" }}>{product.days}</td>
//           <td style={{ border: "1px solid black", padding: "8px" }}>{product.qty}</td>
//           <td style={{ border: "1px solid black", padding: "8px" }}>₹{product.rate}</td>
//           <td style={{ border: "1px solid black", padding: "8px" }}>₹{amount}</td>
//         </tr>
//       );
//     })}
//   </tbody>
//       </table>

//       {/* Total Section */}
//   {/* Total Section */}
// <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse", textAlign: "right", border: "1px solid black" }}>
//   <tbody>
//     {/* Blue Header - Total */}
//     <tr style={{ background: "#1f497d", color: "white", textAlign: "center" }}>
//       <td colSpan="2" style={{ border: "1px solid black", padding: "8px", fontSize: "16px", fontWeight: "bold" }}>Total</td>
//     </tr>

//     {/* Table Content */}
//     <tr>
//       <td style={{ border: "1px solid black", padding: "8px" }}><b>Total Amount Before Tax:</b></td>
//       <td style={{ border: "1px solid black", padding: "8px" }}>₹{totals.totalBeforeTax.toFixed(2)}</td>
//     </tr>
//     <tr>
//       <td style={{ border: "1px solid black", padding: "8px" }}><b>Add: CGST @ 9%:</b></td>
//       <td style={{ border: "1px solid black", padding: "8px" }}>₹{(totals.totalTax / 2).toFixed(2)}</td>
//     </tr>
//     <tr>
//       <td style={{ border: "1px solid black", padding: "8px" }}><b>Add: SGST @ 9%:</b></td>
//       <td style={{ border: "1px solid black", padding: "8px" }}>₹{(totals.totalTax / 2).toFixed(2)}</td>
//     </tr>
//     <tr>
//       <td style={{ border: "1px solid black", padding: "8px" }}><b>Total Tax Amount:</b></td>
//       <td style={{ border: "1px solid black", padding: "8px" }}>₹{totals.totalTax.toFixed(2)}</td>
//     </tr>

//     {/* Final Total - Blue Background */}
//     <tr style={{ background: "#1f497d", color: "white" }}>
//       <td style={{ border: "1px solid black", padding: "8px", fontWeight: "bold" }}>Total Amount After Tax:</td>
//       <td style={{ border: "1px solid black", padding: "8px", fontWeight: "bold" }}>₹{totals.totalAfterTax.toFixed(2)}</td>
//     </tr>

//     {/* Total Invoice Amount in Words */}
//     <tr>
//       <td colSpan="2" style={{ border: "1px solid black", padding: "8px", textAlign: "center", fontWeight: "bold" }}>
//         Total Invoice Amount in Words
//       </td>
//     </tr>
//     <tr>
//       <td colSpan="2" style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>
//         <i>Thirty Five Thousand Four Hundred Only</i>
//       </td>
//     </tr>
//   </tbody>
// </table>

// {/* Bank Details */}

//     </div>
//   );
// };

// export default Orders;

