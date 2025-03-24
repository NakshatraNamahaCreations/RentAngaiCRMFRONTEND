import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiURL } from "../path";
import moment from "moment/moment";
import Select from "react-select";
import { toWords } from "number-to-words";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const GerrateInvoice = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { id } = location.state || {};
  const [orderData, setOrderData] = useState([]);
  const [clientOrders, setClientOrders] = useState([]);
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
      const filteredOrders = orderData.filter((order) => order._id === id);
      setClientOrders(filteredOrders);
    }
  }, [id, orderData]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (data) => {
    const confirm = window.confirm(
      "Are you sure you want to approve this order?"
    );
    if (confirm) {
      try {
        const { _id, orderStatus } = data;

        if (!_id) {
          toast.error("Order ID is missing");
          console.error("Order ID is missing");
          return;
        }

        if (!orderStatus) {
          toast.error("Order status is missing");
          console.error("Order status is missing");
          return;
        }

        // Determine the new status
        const status = orderStatus === "Inprocess" ? "Approved" : orderStatus;

        // Log for debugging
        console.log("Order ID:", _id);
        console.log("New Status:", status);

        // API Call
        const response = await axios.put(
          `${ApiURL}/order/updateStatus/${_id}`, // Correctly pass the ID
          {
            orderStatus: status, // Correctly pass the status
          }
        );

        // Handle response
        if (response.status === 200) {
          toast.success("Successfully Updated");
          window.location.reload();
        } else {
          toast.error("Failed to update order status");
        }
      } catch (error) {
        console.error("Error updating the order status:", error);
        toast.error("Error updating the order status");
      }
    }
  };

  // Function to handle button click
  const handleUpdateClick = () => {
    if (!id) {
      toast.error("Order ID not found");
      return;
    }

    // Prepare data for the updateStatus function
    const data = {
      _id: id, // Pass the retrieved id
      orderStatus: "Inprocess", // Example initial order status
    };

    updateStatus(data); // Call updateStatus with the data
  };

  const [showAddRefurbishment, setShowAddRefurbishment] = useState(false);
  const [productData, setproductData] = useState([]);
  const fetchproduct = async () => {
    try {
      const res = await axios.get(`${ApiURL}/product/quoteproducts`);
      if (res.status === 200) {
        setproductData(res.data.QuoteProduct);
      }
    } catch (error) {
      console.error("Error fetching Refurbishment:", error);
      toast.error("Failed to fetch Refurbishment");
    }
  };
  useEffect(() => {
    fetchproduct();
  }, []);

  const [productrefurbishment, setproductrefurbishment] = useState("");
  const [damagerefurbishment, setdamagerefurbishment] = useState("");
  const [shippingaddressrefurbishment, setshippingaddressrefurbishment] =
    useState("");
  const [expense, setexpense] = useState("");
  const [floormanager, setfloormanager] = useState("");
  const handleUpdateOrders = async () => {
    try {
      const config = {
        url: `/order/refurbishment/${id}`,
        method: "put",
        baseURL: ApiURL,
        headers: { "Content-Type": "application/json" },
        data: {
          productrefurbishment: selectedOptions,
          damagerefurbishment,
          shippingaddressrefurbishment,
          expense,
          floormanager,
        },
      };
      const response = await axios(config);

      if (response.status === 200) {
        alert("Refurbishment details updated successfully.");
        setShowAddRefurbishment(false);
        window.location.reload();
      } else {
        console.error("Unexpected response:", response);
        alert("Failed to update refurbishment details.");
      }
    } catch (error) {
      console.error("Error updating orders:", error);
      alert("An error occurred while updating refurbishment details.");
    }
  };
  const [selectedOptions, setSelectedOptions] = useState([]);
  const transformedOptions = productData.map((item) => ({
    value: item._id,
    label: item.ProductName,
  }));

  const handleChange = (selected) => {
    setSelectedOptions(selected || []);
  };

  const invoiceData = {
    company: {
      name: "Rent Angadi",
      address:
        "Sy No 258/6, Old Sy No 258/1 Battahalsur Jala, Hobli, Bettahalsur, Bangalore, Bengaluru, Urban Karnataka - 560001",
      phone: "+91 9619868262",
      gstin: "29ABJFR2437B1Z3",
    },
    invoice: {
      number: "RA114",
      date: "4th March 2025",
      reverseCharge: "N",
      state: "Karnataka",
      code: "29",
    },
    billing: {
      name: "M/s. Yellow Umbrella Production House (OPC) Pvt. LTD",
      address:
        "No,503, 8th main, weshwing, Amarjyothi Layout Domlur Extn, Bangalore",
      gstin: "29AABCY6686L1ZE",
      state: "Karnataka",
      code: "29",
    },
    shipping: {
      name: "N/A",
      address: "N/A",
      gstin: "N/A",
      state: "N/A",
      code: "N/A",
    },
    products: [
      {
        description: "Pink Metal Chair",
        hsn: "9403",
        days: 1,
        qty: 15,
        rate: 300,
      },
      {
        description: "Matrix Center Table",
        hsn: "9403",
        days: 1,
        qty: 2,
        rate: 750,
      },
      {
        description: "Flamingo Side Table",
        hsn: "9403",
        days: 1,
        qty: 2,
        rate: 750,
      },
      {
        description: "White Chester Drawer",
        hsn: "9403",
        days: 1,
        qty: 1,
        rate: 4000,
      },
      {
        description: "Banquet Dining Table with Frill 6' * 2'",
        hsn: "9403",
        days: 1,
        qty: 10,
        rate: 300,
      },
      { description: "Manpower", hsn: "9403", days: 1, qty: 6, rate: 1500 },
      {
        description: "Transportation",
        hsn: "9403",
        days: 1,
        qty: 1,
        rate: 6500,
      },
    ],
    bankDetails: {
      accountNo: "50200099507304",
      ifsc: "HDFC0004051",
      bankName: "HDFC, CMH Road",
    },
  };

  const calculateTotals = () => {
    let totalBeforeTax = 0;
    let totalTax = 0;
    let totalAfterTax = 0;

    invoiceData.products.forEach((product) => {
      let amount = product.qty * product.days * product.rate;
      let gstAmount = (amount * 9) / 100; // Assuming 9% CGST + 9% SGST
      let total = amount + 2 * gstAmount;

      totalBeforeTax += amount;
      totalTax += 2 * gstAmount;
      totalAfterTax += total;
    });

    return { totalBeforeTax, totalTax, totalAfterTax };
  };

  const totals = calculateTotals();

  const downloadPDF = () => {
    const invoiceElement = document.getElementById("invoiceContent");
    html2canvas(invoiceElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("invoice.pdf");
    });
  };

  return (
    <>
      <button
        onClick={downloadPDF}
        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
        style={{
          marginBottom: "15px",
          display: "block",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          marginLeft: "10px",
        }}
      >
        Download Invoice
      </button>

      <>
        {clientOrders?.map((ele) => {
          return (
            <div
              id="invoiceContent"
              style={{
                width: "900px",
                margin: "20px auto",
                border: "2px solid black",
                padding: "10px",
                fontFamily: "Arial",
              }}
            >
              {/* Header Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "2px solid black",
                }}
              >
                <div style={{ width: "30%" }}>
                  <img
                    src="../logorentangadi.png"
                    alt="Company Logo"
                    style={{ width: "120px" }}
                  />
                </div>
                <div
                  style={{
                    textAlign: "center",
                    width: "70%",
                    background: "#1f497d",
                    color: "white",
                    padding: "15px",
                    borderRadius: "5px",
                  }}
                >
                  <h2 style={{ margin: 0 ,fontSize:"30px",fontWeight:"bold"}}>{invoiceData.company.name}</h2>
                  <p style={{ margin: "5px 0" }}>
                    {invoiceData.company.address}
                  </p>
                  <p style={{ margin: 0 }}>
                    Tel: {invoiceData.company.phone} | GSTIN:{" "}
                    {invoiceData.company.gstin}
                  </p>
                </div>
              </div>

              <h2
                style={{
                  textAlign: "center",
                  background: "#1f497d",
                  color: "white",
                  padding: "8px",
                  margin: "15px 0",
                  borderRadius: "5px",
                  fontSize:"20px",fontWeight:"bold"
                }}
              >
                Tax Invoice
              </h2>

              {/* Invoice Details Table */}
              <table
                width="100%"
                border="1"
                cellPadding="8"
                style={{ borderCollapse: "collapse", marginBottom: "15px" }}
              >
                <tbody>
                  <tr style={{ display: "grid" }}>
                    <td>
                      <b>Invoice No:</b> RA{ele?.ClientId?.slice(20, 23)}
                    </td>
                    <td>
                      <b>Invoice Date:</b>
                      {moment(ele?.createdAt).format("DD/MM/YYYY  ")}
                    </td>
                    <td>
                      <b>Reverse Charge (Y/N):</b>{" "}
                      {invoiceData.invoice.reverseCharge}
                    </td>
                    <td>
                      <b>State:</b> {invoiceData.invoice.state}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Billing & Shipping Details */}
              {/* <table
                width="100%"
                border="1"
                cellPadding="8"
                style={{
                  borderCollapse: "collapse",
                  marginBottom: "15px",
                  border: "1px solid black",
                }}
              >
                <thead style={{ background: "#1f497d", color: "white" }}>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      Bill to Party
                    </th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      Ship to Party
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <b>Name:</b> {ele?.clientName} <br />
                      <b>Address:</b> {ele?.Address} <br />
                      <b>State:</b> {invoiceData.billing.state}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "right",
                      }}
                    >

                     <div><b>Name:</b> {ele?.executivename}</div> 
                     <div>  <b>Address:</b> {ele?.placeaddress} <br /></div>
                    
                    </td>
                  </tr>
                </tbody>
              </table> */}
              <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid black",
    tableLayout: "fixed",
  }}
>
  <thead style={{ background: "#1f497d", color: "white" }}>
    <tr>
      <th style={{ border: "1px solid black", padding: "8px" }}>Bill to Party</th>
      <th style={{ border: "1px solid black", padding: "8px" }}>Ship to Party</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      {/* Billing Details (Left Side) */}
      <td
        style={{
          border: "1px solid black",
          // padding: "8px",
          textAlign: "left",
          verticalAlign: "top",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tr>
            <td style={{ padding: "4px", borderBottom: "1px solid black" }}>Name:</td>
            <td style={{ padding: "4px", borderBottom: "1px solid black" }}>{ele?.clientName}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px", borderBottom: "1px solid black" }}>Address:</td>
            <td style={{ padding: "4px", borderBottom: "1px solid black" }}>{ele?.Address}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px" }}>State:</td>
            <td style={{ padding: "4px" }}>{invoiceData.billing.state}</td>
          </tr>
        </table>
      </td>

      {/* Shipping Details (Right Side) */}
      <td
        style={{
          border: "1px solid black",
          // padding: "8px",
          textAlign: "left",
          verticalAlign: "top",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tr>
            <td style={{ padding: "4px", borderBottom: "1px solid black" }}>Name:</td>
            <td style={{ padding: "4px", borderBottom: "1px solid black" }}>{ele?.executivename}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px", borderBottom: "1px solid black" }}>Address:</td>
            <td style={{ padding: "4px", borderBottom: "1px solid black" }}>{ele?.placeaddress}</td>
          </tr>
        </table>
      </td>
    </tr>
  </tbody>
</table>

              <div className="border-t pt-4">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                  {/* Table Header */}
                  <thead className="bg-gray-200">
                    <tr>
                      {/* <th className="border px-4 py-2 text-gray-700 font-semibold text-center">S.No</th> */}
                      <th className="border px-4 py-2 text-gray-700 font-semibold text-center">
                        Product Name
                      </th>
                      <th className="border px-4 py-2 text-gray-700 font-semibold text-center">
                        Quantity
                      </th>
                      <th className="border px-4 py-2 text-gray-700 font-semibold text-center">
                        Rate
                      </th>
                      <th className="border px-4 py-2 text-gray-700 font-semibold text-center">
                        No of Days
                      </th>
                      <th className="border px-4 py-2 text-gray-700 font-semibold text-center">
                        Total
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {ele?.slots?.flatMap((slot, slotIndex) =>
                      slot?.products?.map((product, productIndex) => (
                        <tr
                          key={`${slotIndex}-${productIndex}`}
                          className="hover:bg-gray-50"
                        >
                          {/* ✅ Serial Number (Continuous across slots) */}
                          {/* <td className="border px-4 py-2 text-gray-700 text-center">
            {slotIndex + productIndex + 1}
          </td> */}

                          {/* ✅ Product Name */}
                          <td className="border px-4 py-2 text-gray-700 text-center">
                            {product.productName || "N/A"}
                          </td>

                          {/* ✅ Quantity */}
                          <td className="border px-4 py-2 text-gray-700 text-center">
                            {product.quantity || 0}
                          </td>

                          {/* ✅ Price per Unit (Corrected Calculation) */}
                          <td className="border px-4 py-2 text-gray-700 text-center">
                            ₹
                            {product.quantity > 0
                              ? (product.total / product.quantity).toFixed(2)
                              : "0.00"}
                          </td>

                          {/* ✅ No. of Days */}
                          <td className="border px-4 py-2 text-gray-700 text-center">
                            1
                          </td>

                          {/* ✅ Total Price */}
                          <td className="border px-4 py-2 text-gray-700 text-center">
                            ₹{(product?.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Product Table (Fixed Borders) */}
              {/* <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginBottom: "15px", textAlign: "center" }}>
                <thead style={{ background: "#1f497d", color: "white" }}>
              <tr>
                <th style={{ border: "1px solid black", padding: "8px" }}>S.No.</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Product Description</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>No of Days</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Qty</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Rate</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.products.map((product, index) => {
                let amount = product.qty * product.days * product.rate;
                return (
                  <tr key={index}>
                    <td style={{ border: "1px solid black", padding: "8px" }}>{index + 1}</td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>{product.description}</td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>{product.days}</td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>{product.qty}</td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>₹{product.rate}</td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>₹{amount}</td>
                  </tr>
                );
              })}
            </tbody>
                </table> */}

              {/* Total Section */}
              {/* Total Section */}
              <table
                width="100%"
                border="1"
                cellPadding="8"
                style={{
                  borderCollapse: "collapse",
                  textAlign: "right",
                  border: "1px solid black",
                }}
              >
                <tbody>
                  {/* Blue Header - Total */}
                  {/* <tr style={{ background: "#1f497d", color: "white", textAlign: "center" }}>
                <td colSpan="2" style={{ border: "1px solid black", padding: "8px", fontSize: "16px", fontWeight: "bold" }}>Total</td>
              </tr> */}

                  {/* Table Content */}
                  <tr>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <b>Total Amount Before Tax</b>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      ₹
                      {ele?.slots
                        ?.reduce((acc, slot) => {
                          return (
                            acc +
                            slot.products.reduce(
                              (subtotal, product) =>
                                subtotal + Number(product.total),
                              0
                            )
                          );
                        }, 0)
                        ?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <b>Discount ({ele?.discount}%) </b>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      ₹
                      {(
                        ((ele?.slots?.reduce((acc, slot) => {
                          return (
                            acc +
                            slot.products.reduce(
                              (subtotal, product) =>
                                subtotal + Number(product.total),
                              0
                            )
                          );
                        }, 0) || 0) *
                          (ele?.discount || 0)) /
                        100
                      ).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <b>Manpower Cost/Labour Charge:</b>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <span>₹{ele?.labourecharge?.toFixed(2)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <b>Transportation:</b>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                    ₹{ele?.transportcharge?.toFixed(2)}
                    </td>
                  </tr>
                    <tr>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <b>RoundOff:</b>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                    ₹{ele?.adjustments?.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <b>Add:GST(18%):</b>
                    </td>
                    {/* <td style={{ border: "1px solid black", padding: "8px" }}>
                      <span>
                        ₹
                        {(
                          ((ele?.slots?.reduce((acc, slot) => {
                            return (
                              acc +
                              slot.products.reduce(
                                (subtotal, product) =>
                                  subtotal + Number(product.total),
                                0
                              )
                            );
                          }, 0) || 0) -
                            // Subtract discount before calculating GST
                            ((ele?.slots?.reduce((acc, slot) => {
                              return (
                                acc +
                                slot.products.reduce(
                                  (subtotal, product) =>
                                    subtotal + Number(product.total),
                                  0
                                )
                              );
                            }, 0) || 0) *
                              (ele?.discount || 0)) /
                              100) *
                          (ele?.GST || 0)
                        ).toFixed(2)}
                      </span>

                      
                    </td> */}
                    <td style={{ border: "1px solid black", padding: "8px" }}>
  <span>
    ₹
    {(() => {
      const baseTotal = ele?.slots?.reduce((acc, slot) => {
        return acc + slot.products.reduce((sub, product) => sub + Number(product.total), 0);
      }, 0) || 0;

      const discountAmount = (baseTotal * (ele?.discount || 0)) / 100;
      const discountedTotal = baseTotal - discountAmount;

      const labour = Number(ele?.labourecharge || 0);
      const transport = Number(ele?.transportcharge || 0);

      const subtotalBeforeGST = discountedTotal + labour + transport;

      const gstAmount = subtotalBeforeGST * (ele?.GST || 0);

      return gstAmount.toFixed(2);
    })()}
  </span>
</td>

                  </tr>
                 
                  {/* <tr>
                <td style={{ border: "1px solid black", padding: "8px" }}><b>Total Tax Amount:</b></td>
                <td style={{ border: "1px solid black", padding: "8px" }}>₹{totals.totalTax.toFixed(2)}</td>
              </tr> */}

                  {/* Final Total - Blue Background */}
                  <tr style={{ background: "#1f497d", color: "white" }}>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      GrandTotal Amount:
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      ₹{ele?.GrandTotal.toFixed(2)}
                    </td>
                  </tr>

                  {/* Total Invoice Amount in Words */}
                  <tr>
                    <td
                      colSpan="2"
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      Total Invoice Amount in Words
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan="2"
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <i>
                        {toWords(ele?.GrandTotal)
                          .replace(/,/g, "")
                          .toUpperCase()}{" "}
                        Only{" "}
                      </i>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Bank Details */}
            </div>
          );
        })}
      </>
    </>
  );
};

export default GerrateInvoice;
