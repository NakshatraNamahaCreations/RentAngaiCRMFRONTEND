import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ApiURL } from "../path";
import moment from "moment/moment";
import jsPDF from "jspdf";

const ClientDetails = () => {
  const location = useLocation();
  const { id } = location.state || {}; // Retrieve `_id` from state

  const [orderData, setOrderData] = useState([]); // All orders
  const [clientOrders, setClientOrders] = useState([]); // Filtered orders for this client
  // console.log("clientOrders>>>", clientOrders);
  // Fetch all orders
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
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Filter client orders
  useEffect(() => {
    if (id && orderData.length > 0) {
      const filteredOrders = orderData.filter((order) => order.ClientId === id);
      setClientOrders(filteredOrders);
    }
  }, [id, orderData]);

  useEffect(() => {
    fetchOrders();
  }, []);
  // const { matchingOrders } = location.state;
  // console.log(matchingOrders, "clientOrders");


  const pdfRef = useRef(); 

  const handleDownloadPdf = () => {
    const doc = new jsPDF("p", "mm", "a4"); 
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
  
    doc.html(pdfRef.current, {
      callback: function (doc) {
        doc.save("download.pdf"); // Download the PDF
      },
      x: 10, // Add padding from the left
      y: 10, // Add padding from the top
      width: pdfWidth - 20, // Adjust width to fit within the page
      windowWidth: pdfWidth * 4, // Adjust window width for scaling
    });
  };
  

  return (
    <div className="min-h-screen bg-gray-100 py-2 px-1">

{
   clientOrders.length === 0 ? (<>   <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-800">
        No data available
      </h2>
      <p className="text-gray-600 mt-2">
        We couldn’t find any orders. Please check back later or contact support.
      </p>
    </div>
  </div>
  </>):(<>  
    <button
        onClick={handleDownloadPdf}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Download PDF
      </button>
   {clientOrders.map((ele) => {
        return (
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6"  ref={pdfRef} >
            <h5 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">
              Client Id : {ele?.ClientId}
            </h5>
  
            <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2
                  className="text-lg font-medium text-gray-700"
                  style={{ color: "black", fontWeight: "600 " }}
                >
                  Booking Date : <span style={{color:"red"}}>{moment(ele?.createdAt).format('DD/MM/YYYY  ')}</span>
                </h2>
              
              </div>
              <div className="flex justify-between items-center">
                <h2
                  className="text-lg font-medium text-gray-700"
                  style={{ color: "black", fontWeight: "600 " }}
                >
                  Name:
                </h2>
                <p className="text-gray-600">{ele?.clientName}</p>
              </div>

              <div className="flex justify-between items-center">
                <h2
                  className="text-lg font-medium text-gray-700"
                  style={{ color: "black", fontWeight: "600 " ,width:"50%"}}
                >
                  Address:
                </h2>
                <p className="text-gray-600 text-right" style={{width:"50%"}}>
                  {ele?.Address}
                </p>
              </div>

              

              <div className="flex justify-between items-center">
                <h2
                  className="text-lg font-medium text-gray-700"
                  style={{ color: "black", fontWeight: "600 " }}
                >
                  Order Status:
                </h2>
                <p
                  className={`font-semibold ${
                    ele.orderStatus === "Approved"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {ele.orderStatus}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <h2
                  className="text-lg font-medium text-gray-700"
                  style={{ color: "black", fontWeight: "600 " }}
                >
                  Payment Status:
                </h2>
                <p
                  className={`font-semibold ${
                    ele.paymentStatus === "Pending"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {ele.paymentStatus}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <h2
                  className="text-lg font-medium text-gray-700"
                  style={{ color: "black", fontWeight: "600 " }}
                >
                  Grand Total:
                </h2>
                <p className="text-gray-600">₹{ele.GrandTotal}</p>
              </div>

              <div className="flex justify-between items-center">
                <h2
                  className="text-lg font-medium text-gray-700"
                  style={{ color: "black", fontWeight: "600 " }}
                >
                  Advance Payment:
                </h2>
                <p className="text-gray-600">₹{ele.advpayment}</p>
              </div>

              <div className="flex justify-between items-center">
                <h2
                  className="text-lg font-medium text-gray-700"
                  style={{ color: "black", fontWeight: "600 " }}
                >
                  Start Date:
                </h2>
                <p className="text-gray-600">{ele.formattedStartDate}</p>
              </div>

              <div className="flex justify-between items-center">
                <h2
                  className="text-lg font-medium text-gray-700"
                  style={{ color: "black", fontWeight: "600 " }}
                >
                  End Date:
                </h2>
                <p className="text-gray-600">{ele.formattedEndDate}</p>
              </div>

              <div className="border-t pt-4">
                <h2
                  className="text-lg font-medium text-gray-700 mb-2"
                  style={{ color: "black", fontWeight: "600 " }}
                >
                  Products:
                </h2>
                <div className="border-t pt-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b-2 p-2">Product Name</th>
                        <th className="border-b-2 p-2">Quantity</th>
                        <th className="border-b-2 p-2">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ele.products.map((product, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-gray-100" : "bg-white"
                          }
                        >
                          <td className="border-b p-2">
                            {product.productName}
                          </td>
                          <td className="border-b p-2">{product.quantity}</td>
                          <td className="border-b p-2">₹{product.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })}
  
  </>)
}
      
     
    </div>
  );
};

export default ClientDetails;
