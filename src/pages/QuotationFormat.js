// export default QuotationFormat;
import React, { useEffect, useRef, useState } from "react";
import "./QuotationTable.css"; // Importing the CSS file
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ApiURL } from "../path";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import moment from "moment";
import Modal from "react-modal";

const QuotationFormat = () => {
  let { id } = useParams();
  console.log("id---", id);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpen1, setModalIsOpen1] = useState(false);
  const [modalIsOpen2, setModalIsOpen2] = useState(false);
  const [modalIsOpen4, setModalIsOpen4] = useState(false);
  // Handle "View" button click
  const handleViewClick = () => {
    setModalIsOpen(true);
  };
  const handleViewClick4 = () => {
    setModalIsOpen4(true);
  };
  const closeModal4 = () => {
    setModalIsOpen4(false);
  };

  // Close the modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  // Handle "View" button click
  const handleViewClick1 = () => {
    setModalIsOpen1(true);
    setModalIsOpen(false);
  };
  const handleViewClick2 = () => {
    setModalIsOpen2(true);
  };

  // Close the modal
  const closeModal1 = () => {
    setModalIsOpen1(false);
  };
  const closeModal2 = () => {
    setModalIsOpen2(false);
  };

  const [hideButton, setHideButton] = useState(false);
  const [quotationdata, setQuotationData] = useState([]);
  console.log(quotationdata, "quotationsdata");
  const fetchquotations = async () => {
    try {
      const res = await axios.get(`${ApiURL}/quotations/getallquotations`);
      if (res.status === 200) {
        setQuotationData(res.data.quoteData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  useEffect(() => {
    fetchquotations();
    getPayment();
  }, []);

  const quotationDatadetails = quotationdata?.find((ele) => ele?._id === id);
  // console.log(quotationdata, "quotationdata");
  console.log(quotationDatadetails, "quotationDatadetails");

  const quotationDetails = quotationDatadetails;
  console.log(quotationDetails, "quotationDetails");

  const quotationRef = useRef(); // Reference for the component to capture

  // Function to download the quotation as a PDF
  const downloadPDF = async () => {
    setHideButton(true); // Hide the button

    setTimeout(async () => {
      const element = quotationRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Quotation_${quotationDetails?.quoteId || "N/A"}.pdf`);

      setHideButton(false);
    }, 0);
  };

  const navigate = useNavigate();
  const redirectToOrders = () => {
    navigate("/orders");
  };
  // Orders confirms
  // console.log(quotationDetails, "88888");
  const handleGenerateOrder = async () => {
    try {
      const orderDetails = {
        ClientId: quotationDetails?.clientId,
        clientNo: quotationDetails?.clientNo,
        products: quotationDetails?.Products,
        GrandTotal: quotationDetails?.GrandTotal,
        paymentStatus: quotationDetails?.paymentStatus,
        clientName: quotationDetails?.clientName,
        executivename: quotationDetails?.executivename,
        Address: quotationDetails?.address,
        labourecharge: quotationDetails?.labourecharge,
        transportcharge: quotationDetails?.transportcharge,
        GST: quotationDetails?.GST,
        discount: quotationDetails?.discount,
        slots:
          quotationDetails?.slots?.map((slot) => ({
            slotName: slot.slotName,
            quoteDate: slot.quoteDate,
            endDate: slot.endDate,
            products: slot.Products?.map((product) => ({
              productId: product.productId,
              productName: product.productName,
              quantity: product.quantity,
              total: product.total,
            })),
          })) || [],
      };

      const response = await axios.post(
        "http://localhost:8000/api/order/postaddorder",
        orderDetails
      );
      if (response.status === 201) {
        console.log("Order created successfully:", response.data);
        redirectToOrders();
      } else {
        console.error("Unexpected response:", response.data);
        alert("Failed to generate order. Please try again.");
      }
    } catch (error) {
      console.error("Error generating order:", error);
    }
  };

  const [online, setOnline] = useState(false); // Track "Online" checkbox state
  const [offline, setOffline] = useState(false);
  const handleCheckboxChange = (type) => {
    if (type === "offline") {
      setPaymentMode("Offline");
      setOffline(true);
      setOnline(false);
      setIsVisible(true); // Show fields specific to "Offline"
    } else if (type === "online") {
      setPaymentMode("Online");
      setOnline(true);
      setOffline(false);
      setIsVisible(false); // Hide fields specific to "Online"
    }
  };
  const [isVisible, setIsVisible] = useState(false); // State to control visibility

  const handleToggle = () => {
    setIsVisible(!isVisible); // Toggle visibility
  };

  const [advancedAmount, setadvancedAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("");

  const handlePayment = async () => {
    try {
      const orderDetails = {
        quotationId: quotationDetails?._id,
        totalAmount: quotationDetails?.GrandTotal,
        advancedAmount: advancedAmount,
        paymentMode: paymentMode, // Send selected payment mode
        paymentRemarks: selectMode,
        comment: coment,
        status: "Completed",
      };

      const response = await axios.post(
        "http://localhost:8000/api/payment/",
        orderDetails
      );

      if (response.status === 200) {
        console.log("Payment created successfully:", response.data);
        handleGenerateOrder();
        alert("Payment created successfully!");
        setModalIsOpen1(false);
        setadvancedAmount("");
      } else {
        console.error("Unexpected response:", res.data);
        alert("Failed to generate payment. Please try again.");
      }
    } catch (error) {
      console.error("Error generating payment:", error);
      alert("Error creating payment.");
    }
  };
  const [getpayment, setgetPayment] = useState([]);
  console.log(getpayment, "getpayment");
  const paymentfilter = getpayment?.filter(
    (item) => item?.quotationId?._id === id
  );

  const allAdvancedAmount = getpayment.reduce(
    (accumulator, element) => accumulator + (element?.advancedAmount || 0),
    0
  );
  console.log(allAdvancedAmount, "accumulator");

  const getPayment = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/payment/");
      if (response.status === 200) {
        setgetPayment(response.data); // Update state with fetched payment data
        // console.log("Fetched payment:", response.data);
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
    }
  };

  // Fetch payment data when component mounts or `id` changes
  useEffect(() => {
    getPayment();
  }, []);

  const [selectMode, setSelectMode] = useState("");
  console.log(selectMode,'selectMode')
  const [coment, setComent] = useState("");
  const handlePayment2 = async () => {
    try {
      const orderDetails = {
        quotationId: quotationDetails?._id,
        totalAmount: quotationDetails?.GrandTotal,
        advancedAmount: advancedAmount,
        paymentMode: paymentMode,
        paymentRemarks: selectMode,
        comment: coment,
        status: "Completed",
      };

      const response = await axios.post(
        "http://localhost:8000/api/payment/",
        orderDetails
      );

      if (response.status === 200) {
        console.log("Payment created successfully:", response.data);
        alert("Payment created successfully!");
        setModalIsOpen4(false);
        setadvancedAmount("");
        window.location.reload(true);
      } else {
        console.error("Unexpected response:", res.data);
        alert("Failed to generate payment. Please try again.");
      }
    } catch (error) {
      console.error("Error generating payment:", error);
      alert("Error creating payment.");
    }
  };

  const [adjustment, setAdjustment] = useState(
    quotationDetails?.adjustment || 0
  );
  const [labourCharge, setLabourCharge] = useState(
    quotationDetails?.labourecharge || 0
  );
  const [transportCharge, setTransportCharge] = useState(
    quotationDetails?.transportcharge || 0
  );
  const [grandTotal, setGrandTotal] = useState(
    Number(quotationDetails?.GrandTotal) || 0
  );

  useEffect(() => {
    // Ensure all values are valid numbers
    const baseGrandTotal = Number(quotationDetails?.GrandTotal) || 0;
    const labor = Number(labourCharge) || 0;
    const transport = Number(transportCharge) || 0;
    const adjust = Number(adjustment) || 0;

    // Calculate the adjusted total
    let adjustedTotal = baseGrandTotal + labor + transport - adjust;

    // Ensure the grand total is non-negative
    adjustedTotal = Math.max(0, adjustedTotal);

    // Update the grand total
    setGrandTotal(adjustedTotal);
  }, [labourCharge, transportCharge, adjustment, quotationDetails?.GrandTotal]);

  const handleupdateQuotations = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        quoteId: quotationDetails?.quoteId,
        labourecharge: labourCharge,
        transportcharge: transportCharge,
        adjustments: adjustment,
        GrandTotal: grandTotal,
      };

      console.log("Payload being sent:", payload);

      const config = {
        url: "/quotations/updateQuotationquantity",
        method: "put",
        baseURL: ApiURL,
        headers: { "content-type": "application/json" },
        data: payload,
      };

      await axios(config).then((response) => {
        if (response.status === 200) {
          console.log("API Response:", response.data);
          window.location.reload();
        }
      });
    } catch (error) {
      console.error("Error during update:", error);

      if (error.response) {
        alert(error.response.data.error);
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div
        className="quotation-container"
        ref={quotationRef}
        style={{ maxWidth: "none" }}
      >
        {/* Top Fields */}

        <div
          className=""
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div className="quotation-header">
            <div className="field">
              <label>Company Name : </label>{" "}
              <span>{quotationDetails?.clientName}</span>
            </div>
            <div className="field">
              <label>Contact Number : </label>{" "}
              <span> {quotationDetails?.clientNo}</span>
            </div>
            <div className="field">
              <label>Executive Name : </label>{" "}
              <span>{quotationDetails?.executivename}</span>
            </div>
            <div className="field">
              <label>Venue :</label> <span>{quotationDetails?.address}</span>
            </div>
            <div className="field">
              <label>Delivery Date :</label>{" "}
              <span>{quotationDetails?.quoteDate}</span>
            </div>
            <div className="field">
              <label>Manpower Support :</label> <span></span>
            </div>
            <div className="field">
              <label>Additional Logistics Support :</label> <span></span>
            </div>
          </div>
          {!hideButton && (
            <button
              className="download-button"
              onClick={downloadPDF}
              style={{
                marginLeft: "30px",
                paddingLeft: "30px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                height: "fit-content",
              }}
            >
              Download Quotation as PDF
            </button>
          )}
        </div>

        {/* Table */}
        <div className="quotation-table-container">
          <h2 style={{ fontWeight: "600" }}>Quotation</h2>
          <table className="quotation-table">
            <thead>
              <tr>
                <th>Slot Date</th>
                <th>Elements</th>
                <th>No of Units</th>
                <th>Price per Unit</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {quotationDetails?.slots?.map((slot, slotIndex) => (
                <React.Fragment key={slotIndex}>
                  {slot?.Products?.map((product, productIndex) => (
                    <tr key={productIndex} className="hover:bg-gray-50">
                      {productIndex === 0 && (
                        <td
                          className="border px-4 py-2 text-gray-700 font-bold text-center bg-gray-200"
                          rowSpan={slot.Products.length}
                          style={{
                            borderBottom: "1px solid #8080803b",
                            textAlign: "center",
                          }}
                        >
                          {slot?.slotName?.slice(0, 16)}, <br />
                          {slot?.quoteDate}, <br />
                          {slot?.slotName?.slice(16)}, <br />
                          {slot?.endDate},
                        </td>
                      )}
                      {/* Product Details */}
                      <td className="border px-4 py-2 text-gray-700 text-center">
                        {product.productName || "N/A"}
                      </td>

                      <td className="border px-4 py-2 text-gray-700 text-center">
                        {product.quantity || 0}
                      </td>
                      <td className="border px-4 py-2 text-gray-700 text-center">
                        ₹{product.price || 0}
                      </td>
                      <td className="border px-4 py-2 text-gray-700 text-center">
                        ₹
                        {(
                          Number(product.price) * Number(product.quantity)
                        ).toFixed(2) || 0}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="summary">
            <div>
              <span>Transportation:</span>
              <span>₹{quotationDetails?.transportcharge?.toFixed(2)}</span>
            </div>
            <div>
              <span>Manpower Cost:</span>
              <span>₹{quotationDetails?.labourecharge?.toFixed(2)}</span>
            </div>
            {/* <div>
            <span>Discount</span>
            <span>₹{discount?.toFixed(2)}</span>
          </div> */}
            <div>
              <span>GST:</span>
              <span>{Number(quotationDetails?.GST)?.toFixed(2) || 0}%</span>
            </div>
            {/* <div>
            <span>Round Off</span>
            <span>₹{quotationDetails?.adjustments?.toFixed(2)}</span>
          </div> */}
            <div className="grand-total">
              <span>Grand Total:</span>
              {/* <span>₹{quotationDetails?.GrandTotal}</span> */}
              <span>₹{quotationDetails?.GrandTotal?.toFixed(2)}</span>
            </div>
          </div>

          <div className="notes">
            <h3>Notes:</h3>
            <p>
              1) Additional elements would be charged on actuals, transportation
              would be additional.
            </p>
            <p>2) 100% Payment for confirmation of event.</p>
            <p>
              3) Costing is merely for estimation purposes. Requirements are
              blocked post payment is received in full.
            </p>
            <p>
              4) If the inventory is not reserved with payments as indicated
              above, we are not committed to keep it.
            </p>
            <p>
              5) The nature of the rental industry that our furniture is
              frequently moved and transported, which can lead to scratches on
              glass, minor chipping of the paintwork & minor stains etc.
            </p>
          </div>
        </div>

        {paymentfilter?.status == "Completed" ? (
          <></>
        ) : (
          <>
            {!hideButton && (
              <>
                <button
                  onClick={handleViewClick2}
                  style={{
                    backgroundColor: "blue",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "20px",
                    marginRight: "20px",
                  }}
                >
                  Update Quotation
                </button>
                <button
                  onClick={handleViewClick}
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "20px",
                  }}
                >
                  Generate Order
                </button>
              </>
            )}
          </>
        )}
      </div>

      <div className="overflow-x-auto p-4" style={{ width: "33%" }}>
        <h4 style={{ fontSize: "17px", fontWeight: "bold" }}>
          Payment Details
        </h4>
        <table className="min-w-full border-collapse border border-gray-300">
          {/* Table Header */}

          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                Date
              </th>
              <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                Payment Amount
              </th>
              <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
               Status
              </th>
              <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
               Payment Mode
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {paymentfilter.map((element) => {
              return (
                <tr className="hover:bg-gray-50">
                  <td className="border px-4 py-2 text-gray-700">
                    {moment(element?.createdAt).format("DD-MM-YYYY")}
                    {/* {paymentfilter[0].date} */}
                  </td>
                  <td className="border px-4 py-2 text-gray-700">
                    ₹{element?.advancedAmount}
                  </td>
                  <td className="border px-4 py-2 text-gray-700">
                    {element?.paymentMode}
                  </td>
                  <td className="border px-4 py-2 text-gray-700">{element?.paymentRemarks}</td>
                </tr>
              );
            })}
            <div style={{ padding: "10px" }}>
              Total Amount : ₹{quotationDetails?.GrandTotal?.toFixed(2)}
            </div>
            <div style={{ padding: "10px" }}>
              Remaning Amount : ₹{" "}
              {quotationDetails?.GrandTotal?.toFixed(2) -
                allAdvancedAmount?.toFixed(2)}
            </div>
          </tbody>
        </table>
        <div>
          <div
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              textAlign: "center",
              display: "inline-block",
              marginTop: "10px",
            }}
            onClick={handleViewClick4}
          >
            Add Payment
          </div>
        </div>
      </div>

      {/* weweop */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "30px",
            borderRadius: "12px",
            width: "500px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9fafb",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        }}
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
            Payment
          </h2>
          <div className="space-y-2">
            <td
              className="px-4 py-2 text-gray-700 text-center"
              style={{ display: "flex", gap: "20px" }}
            >
              {/* Add Advanced Payment Method Button */}
              <button
                onClick={() => handleViewClick1()}
                className="px-6 py-2 text-white rounded-lg shadow focus:outline-none focus:ring-2 
           bg-green-500 hover:bg-green-600 focus:ring-green-400"
              >
                Add Advanced Payment
              </button>

              {/* Skip Button */}
              <button
                onClick={() => closeModal()}
                className="px-6 py-2 text-white rounded-lg shadow focus:outline-none focus:ring-2 bg-red-500 hover:bg-red-600 focus:ring-red-400"
              >
                Skip
              </button>
            </td>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={modalIsOpen1}
        onRequestClose={closeModal1}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "30px",
            borderRadius: "12px",
            width: "500px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9fafb",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        }}
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
            Payment Methods
          </h2>
          <div className="space-y-2">
            <td
              className="px-4 py-2 text-gray-700 text-center"
              style={{ display: "flex", gap: "33px", alignItems: "center" }}
            >
              <label className="inline-flex items-center space-x-2 ml-4">
                <input
                  type="checkbox"
                  checked={offline}
                  onChange={() => handleCheckboxChange("offline")}
                  className="form-checkbox border-gray-300 rounded"
                />
                <span style={{ fontSize: "16px", fontWeight: "600" }}>
                  Offline
                </span>
              </label>
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={online}
                  onChange={() => handleCheckboxChange("online")}
                  className="form-checkbox border-gray-300 rounded"
                />
                <span style={{ fontSize: "16px", fontWeight: "600" }}>
                  Online
                </span>
              </label>
            </td>
            {isVisible && (
              <div className="">
                <div
                  className="mt-3 mb-3"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  Grand Total Amount : {quotationDetails?.GrandTotal}
                </div>
                <label
                  className="items-center space-x-2 ml-4"
                  style={{
                    fontSize: "16px",
                    paddingBottom: "10px",
                    fontWeight: "600",
                  }}
                >
                  Advanced Amount
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "baseline",
                  }}
                >
                  ₹{" "}
                  <input
                    type="Number"
                    placeholder="In Amount"
                    className="form-checkbox border-gray-300 rounded p-2"
                    style={{ fontSize: "16px" }}
                    value={advancedAmount}
                    onChange={(e) => setadvancedAmount(e.target.value)}
                  />
                  {/* %
                  <input
                    type="Number"
                    placeholder="In Percentage"
                    className="form-checkbox border-gray-300 rounded p-2"
                    style={{ fontSize: "16px" }}
                  /> */}
                  
                </div>
                {(offline || online) && (
            <div>
              <label
                className="items-center space-x-2 ml-4"
                style={{
                  fontSize: "16px",
                  paddingBottom: "10px",
                  fontWeight: "600",
                }}
              >
                Payment Mode
              </label>
              <select
                className="form-select border-gray-300 rounded p-2"
                style={{ fontSize: "16px", width: "100%" }}
                value={selectMode}
                 onChange={(e) => setSelectMode(e.target.value)}
              >
                <option>Select Payment Mode</option>
                {offline && <option value="Cash">Cash</option>}
                {online && (
                  <>
                    <option value="Googlepay">Google Pay</option>
                    <option value="Phonepay">PhonePay</option>
                    <option value="Paytm">Paytm</option>
                  </>
                )}
              </select>
              <label
                className="items-center space-x-2 ml-4"
                style={{
                  fontSize: "16px",
                  paddingBottom: "10px",
                  fontWeight: "600",
                }}
              >
                Comments
              </label>
              <textarea
                type="text"
                placeholder="Add any comments or remarks"
                className="border border-gray-300 rounded p-2 w-full"
                style={{ fontSize: "16px", marginTop: "10px" }}
                value={coment}
                onChange={(e) => setComent(e.target.value)}
              />
            </div>
          )}
              </div>
            )}
          </div>
          <div className="mt-6">
            <button
              onClick={handlePayment}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Payment
            </button>
          </div>
        </div>
      </Modal>

      {/* update Quotations */}
      <Modal
        isOpen={modalIsOpen2}
        onRequestClose={closeModal2}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "30px",
            borderRadius: "12px",
            width: "1100px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9fafb",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        }}
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
            Update Quotations
          </h2>
          <div
            className="border rounded-lg p-6 shadow-lg bg-white"
            style={{ margin: "20px" }}
          >
            {/* <table
              border="1"
              cellPadding="10"
              style={{
                width: "100%",
                textAlign: "left",
                borderCollapse: "collapse",
                marginBottom: "20px",
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Slot Date
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Elements
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    No of Units
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Price per Unit
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotationDetails?.slots?.map((slot, slotIndex) => (
                  <React.Fragment key={slotIndex}>
                    {slot?.Products?.map((product, productIndex) => (
                      <tr key={productIndex} className="hover:bg-gray-50">
                       
                        {productIndex === 0 && (
                          <td
                            className="border px-4 py-2 text-gray-700 font-bold text-center bg-gray-200"
                            rowSpan={slot.Products.length} 
                            style={{
                              borderBottom: "1px solid #8080803b",
                            }}
                          >
                            <div>{slot.slotName || "N/A"}</div>
                            <div>{slot.quoteDate || "N/A"}</div>
                            <div>{slot.endDate || "N/A"}</div>
                          </td>
                        )}

                        
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {product.productName || "N/A"}
                        </td>

                       
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          <input
                            type="number"
                            defaultValue={product.quantity || 0}
                            onChange={(e) =>{
                              handleQuantityChange(
                                slotIndex,
                                productIndex,
                                e.target.value
                              ); console.log("  e.target.value",  e.target.value);
                               
}
                            }
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              width: "60px",
                              padding: "4px",
                              textAlign: "center",
                            }}
                          />
                        </td>

                      
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          ₹{product.price || 0}
                        </td>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          ₹ {product.total ||  0}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table> */}
            <div style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "10px" }}>
                <label
                  style={{
                    fontWeight: "bold",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Transportation: ₹
                </label>
                <input
                  type="number"
                  placeholder={quotationDetails?.transportcharge}
                  value={transportCharge || ""}
                  onChange={(e) =>
                    setTransportCharge(Number(e.target.value) || 0)
                  }
                  style={{
                    width: "150px",
                    marginLeft: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label
                  style={{
                    fontWeight: "bold",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Manpower Cost: ₹
                </label>
                <input
                  type="number"
                  placeholder={quotationDetails?.labourecharge}
                  value={labourCharge || ""}
                  onChange={(e) => setLabourCharge(Number(e.target.value) || 0)}
                  style={{
                    width: "150px",
                    marginLeft: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label
                  style={{
                    fontWeight: "bold",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Round Off: ₹
                </label>
                <input
                  type="number"
                  placeholder={quotationDetails?.adjustment || 0}
                  value={adjustment || ""}
                  onChange={(e) => setAdjustment(Number(e.target.value) || 0)}
                  style={{
                    width: "150px",
                    marginLeft: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <h2
                style={{
                  marginTop: "20px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Grand Total: ₹ {grandTotal ? grandTotal.toFixed(2) : "0.00"}
              </h2>

              <button
                onClick={handleupdateQuotations}
                style={{
                  marginTop: "20px",
                  padding: "12px 24px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Update Quotation
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add payment */}
      <Modal
        isOpen={modalIsOpen4}
        onRequestClose={closeModal4}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "30px",
            borderRadius: "12px",
            width: "500px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9fafb",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        }}
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
            Payment
          </h2>
          <td
            className="px-4 py-2 text-gray-700 text-center"
            style={{ display: "flex", gap: "33px", alignItems: "center" }}
          >
            <label className="inline-flex items-center space-x-2 ml-4">
              <input
                type="checkbox"
                checked={offline}
                onChange={() => handleCheckboxChange("offline")}
                className="form-checkbox border-gray-300 rounded"
              />
              <span style={{ fontSize: "16px", fontWeight: "600" }}>
                Offline
              </span>
            </label>
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={online}
                onChange={() => handleCheckboxChange("online")}
                className="form-checkbox border-gray-300 rounded"
              />
              <span style={{ fontSize: "16px", fontWeight: "600" }}>
                Online
              </span>
            </label>
          </td>

          {/* Amount Input */}
          <label
            className="items-center space-x-2 ml-4"
            style={{
              fontSize: "16px",
              paddingBottom: "10px",
              fontWeight: "600",
            }}
          >
            Amount
          </label>
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "baseline",
            }}
          >
            ₹{" "}
            <input
              type="Number"
              placeholder="In Amount"
              className="form-checkbox border-gray-300 rounded p-2"
              style={{ fontSize: "16px" }}
              value={advancedAmount}
              onChange={(e) => setadvancedAmount(e.target.value)}
            />
          </div>

          {/* Dropdown for Payment Method */}
          {(offline || online) && (
            <div>
              <label
                className="items-center space-x-2 ml-4"
                style={{
                  fontSize: "16px",
                  paddingBottom: "10px",
                  fontWeight: "600",
                }}
              >
                Payment Mode
              </label>
              <select
                className="form-select border-gray-300 rounded p-2"
                style={{ fontSize: "16px", width: "100%" }}
                value={selectMode}
                 onChange={(e) => setSelectMode(e.target.value)}
              >
                <option>Select Payment Mode</option>
                {offline && <option value="Cash">Cash</option>}
                {online && (
                  <>
                    <option value="Googlepay">Google Pay</option>
                    <option value="Phonepe">PhonePay</option>
                  </>
                )}
              </select>
              <label
                className="items-center space-x-2 ml-4"
                style={{
                  fontSize: "16px",
                  paddingBottom: "10px",
                  fontWeight: "600",
                }}
              >
                Comments
              </label>
              <textarea
                type="text"
                placeholder="Add any comments or remarks"
                className="border border-gray-300 rounded p-2 w-full"
                style={{ fontSize: "16px", marginTop: "10px" }}
                value={coment}
                onChange={(e) => setComent(e.target.value)}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <td
              className="px-4 py-2 text-gray-700 text-center"
              style={{ display: "flex", gap: "20px" }}
            >
              <button
                onClick={() => handlePayment2()}
                className="px-6 py-2 text-white rounded-lg shadow focus:outline-none focus:ring-2 
           bg-green-500 hover:bg-green-600 focus:ring-green-400"
              >
                Add
              </button>
              <button
                onClick={() => closeModal4()}
                className="px-6 py-2 text-white rounded-lg shadow focus:outline-none focus:ring-2 bg-red-500 hover:bg-red-600 focus:ring-red-400"
              >
                Skip
              </button>
            </td>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuotationFormat;
