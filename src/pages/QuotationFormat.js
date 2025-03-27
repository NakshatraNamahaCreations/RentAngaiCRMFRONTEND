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
import { SelectPicker, VStack } from "rsuite";
import { FaEdit } from "react-icons/fa";

const QuotationFormat = () => {
  let { id } = useParams();
  console.log("id---", id);
  const [isOpen, setIsOpen] = useState(false);
   const [modalIsOpenupdate, setModalIsOpenupdate] = useState(false);
   const[editproduct,setEditproduct] = useState({})
//  console.log(editproduct,"editproduct")
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
  // console.log(quotationdata, "quotationsdata");
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
  // console.log(quotationDetails, "quotationDetails");

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
        placeaddress:quotationDetails?.placeaddress,
        adjustments:quotationDetails?.adjustments,
        products: quotationDetails?.slots
        ?.flatMap((slot) => slot.Products?.map((product) => ({
          productId: product.productId,
          productName: product.productName,
          quantity: product.quantity,
          total: product.total,
        }))) || [],
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
        "https://api.rentangadi.in/api/order/postaddorder",
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

  const [online, setOnline] = useState(false);
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
      // setIsVisible(false);
      setIsVisible(true);
    }
  };
  const [isVisible, setIsVisible] = useState(false); // State to control visibility

  const handleToggle = () => {
    setIsVisible(!isVisible); // Toggle visibility
  };

  const [advancedAmount, setadvancedAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("");

  const handlePayment = async () => {
    if (!quotationDetails?._id) {
      alert("Error: Quotation ID is missing.");
      return;
    }

    if (!quotationDetails?.GrandTotal || quotationDetails.GrandTotal <= 0) {
      alert("Error: Invalid Grand Total.");
      return;
    }

    if (!advancedAmount || isNaN(advancedAmount) || advancedAmount < 0) {
      alert("Error: Advanced amount must be a valid number and not negative.");
      return;
    }

    if (advancedAmount > quotationDetails.GrandTotal) {
      alert("Error: Advanced amount cannot be greater than Grand Total.");
      return;
    }

    if (!paymentMode) {
      alert("Error: Please select a payment mode.");
      return;
    }

    if (!selectMode.trim()) {
      alert("Error: Payment remarks cannot be empty.");
      return;
    }

    if (!coment.trim()) {
      alert("Error: Please add a comment.");
      return;
    }
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
        "https://api.rentangadi.in/api/payment/",
        orderDetails
      );

      if (response.status === 200) {
        // console.log("Payment created successfully:", response.data);
        handleGenerateOrder();
        alert("Payment created successfully!");
        setModalIsOpen1(false);
        setadvancedAmount("");
        window.location.reload();
        redirectToOrders();
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

  const handleOrderNotSHow = getpayment?.find(
    (item) => item?.quotationId?._id === id
  );
  console.log(handleOrderNotSHow, "handleOrderNotSHow");

  const allAdvancedAmount = paymentfilter.reduce(
    (accumulator, element) => accumulator + (element?.advancedAmount || 0),
    0
  );
  console.log(allAdvancedAmount, "accumulator");

  const getPayment = async () => {
    try {
      const response = await axios.get("https://api.rentangadi.in/api/payment/");
      if (response.status === 200) {
        setgetPayment(response.data);
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
  // console.log(selectMode,'selectMode')
  const [coment, setComent] = useState("");
  const handlePayment2 = async () => {
    if (!quotationDetails?._id) {
      alert("Error: Quotation ID is missing.");
      return;
    }

    if (!quotationDetails?.GrandTotal || quotationDetails.GrandTotal <= 0) {
      alert("Error: Invalid Grand Total.");
      return;
    }

    if (!advancedAmount || isNaN(advancedAmount) || advancedAmount < 0) {
      alert("Error: Advanced amount must be a valid number and not negative.");
      return;
    }
    const remainingAmount = quotationDetails.GrandTotal - allAdvancedAmount;
    if (advancedAmount > remainingAmount) {
      alert(
        `Error: Advanced amount cannot be greater than the remaining amount (₹${remainingAmount.toFixed(
          2
        )}).`
      );
      return;
    }

    // if (advancedAmount > quotationDetails.GrandTotal) {
    //   alert("Error: Advanced amount cannot be greater than Grand Total.");
    //   return;
    // }

    if (!paymentMode) {
      alert("Error: Please select a payment mode.");
      return;
    }

    if (!selectMode.trim()) {
      alert("Error: Payment remarks cannot be empty.");
      return;
    }

    if (!coment.trim()) {
      alert("Error: Please add a comment.");
      return;
    }
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
        "https://api.rentangadi.in/api/payment/",
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



  
   const [productinventory, setProductinventory] = useState([]);
       // console.log(productinventory, "productinventory");
       const fetchProductsWithInventory = async () => {
         try {
           const res = await axios.get(`${ApiURL}/product/products-with-inventory`);
           if (res.status === 200) {
             setProductinventory(res.data.data);
           }
         } catch (error) {
           console.error("Error fetching products:", error);
         }
       };
     
       useEffect(() => {
         fetchProductsWithInventory();
       }, []);
       const formattedProducts = productinventory.map((product) => ({
        label: product.ProductName,
        value: product._id,
      }));
       const [selectedProductDetails1, setSelectedProductDetails1] = useState({
         productId: null,
         productName: "",
         price: 0,
         StockAvailable: 0,
         quantity: 1,
         total: 0,
         availableQty: 0,
       });
  
  console.log(selectedProductDetails1,"selectedProductDetails1")
  
  const handleQuantityChange1 = (newQuantity) => {
    const validQuantity = Math.max(0, Math.min(newQuantity, selectedProductDetails1.StockAvailable));
    if (newQuantity > selectedProductDetails1.StockAvailable) {
      alert(`Only ${selectedProductDetails1.StockAvailable} items available.`);
      return;
    }
    setSelectedProductDetails1((prev) => ({
      ...prev,
      quantity: validQuantity,
      total: prev.price * newQuantity,
    }));
  };
  const handleProductSelection2 = (productId) => {
    console.log("productId", productId);

    // Find the product in the database using `_id`
    const selectedProduct = productinventory.find(
      (product) => product._id === productId
    );

    if (selectedProduct) {
      console.log("Selected Product:", selectedProduct);
      // Update state with the selected product's details
      setSelectedProductDetails1({
        productId: selectedProduct._id, // Use `_id` as `productId`
        productName: selectedProduct.ProductName, // Correct property
        price: Number(selectedProduct.ProductPrice) || 0, // Ensure price is a number
        StockAvailable: Number(selectedProduct.ProductStock) || 0,
        quantity: 1, // Default quantity
        total: (Number(selectedProduct.ProductPrice) || 0) * 1,
        availableQty: Number(selectedProduct.availableQty) || 0,
        // totalAvailableQty, // Use calculated `totalAvailableQty`
      });
    } else {
      console.error("Selected product not found in ProductData.");
    }
  };

  const [editquotations, setEditquotation] = useState({});

// console.log(editquotations,"editquotations")

  const addProductToSlot1 = async () => {
    const newProduct = selectedProductDetails1;
  
    if (!newProduct || !newProduct.productId) {
      alert("Please select a product.");
      return;
    }
  
    try {
      const productQuantity = Number(newProduct.quantity);
      const productPrice = Number(newProduct.price);
  
      if (isNaN(productQuantity) || isNaN(productPrice)) {
        alert("Invalid product data. Please check the quantity and price.");
        return;
      }
  
      // ✅ Automatically add to the last slot (or change to first or all based on your requirement)
      const updatedSlots = quotationDetails.slots.map((slot, index) => {
        // You can apply logic to pick one slot (e.g., the last slot)
        if (index === quotationDetails.slots.length - 1) {
          const existingProductIndex = slot.Products.findIndex(
            (product) => product.productId === newProduct.productId
          );
  
          if (existingProductIndex !== -1) {
            alert("This product is already added to the slot.");
            return slot;
          }
  
          const updatedProducts = [
            ...slot.Products,
            {
              productId: newProduct.productId,
              productName: newProduct.productName,
              quantity: productQuantity,
              price: productPrice,
              total: productQuantity * productPrice,
              StockAvailable: newProduct.StockAvailable,
            },
          ];
  
          return {
            ...slot,
            Products: updatedProducts,
            total: updatedProducts.reduce((sum, p) => sum + (Number(p.total) || 0), 0),
          };
        }
  
        return slot;
      });
  
      const payload = {
        id: quotationDetails?.quoteId,
        slots: updatedSlots,
      };
  
      const response = await axios.post(
        "https://api.rentangadi.in/api/quotations/addontherproductstoSlotsquotation",
        payload
      );
  
      if (response.status === 200) {
        alert("Product added successfully!");
        fetchquotations();
        setIsOpen(false);
        setSelectedProductDetails1({
          productId: null,
          productName: "",
          price: 0,
          StockAvailable: 0,
          quantity: 1,
          total: 0,
          availableQty: 0,
        });
      }
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to add product.");
    }
  };
  
  


  return (
    <div
    //  style={{ display: "flex", justifyContent: "space-between" }}
    >
      <div
        className="quotation-container"
        ref={quotationRef}
        style={{ maxWidth: "none" }}
      >
        {/* Top Fields */}
        {!hideButton && (
          <button
            className="download-button"
            onClick={downloadPDF}
            style={{
              textAlign: "end",
              float: "right",
              marginLeft: "30px",
              paddingLeft: "30px",
              marginBottom: "10px",
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
        <div
          className=""
          // style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div className="quotation-header  w-full">
          {/* <table style={{ borderCollapse: "collapse", width: "100%", border: "1px solid black" }}>
  <tbody>
    <tr>
      <td style={{ fontWeight: "bold", backgroundColor: "#dce6f1", border: "1px solid black", padding: "8px" }}>
        Company Name
      </td>
      <td style={{ border: "1px solid black", padding: "8px" }} colSpan={4}>{quotationDetails?.clientName}</td>
    </tr>
    <tr>
      <td style={{ fontWeight: "bold", backgroundColor: "#dce6f1", border: "1px solid black", padding: "8px" }}>
      Executive Name
      </td>
      <td style={{ border: "1px solid black", padding: "8px" }} colSpan={4}>{quotationDetails?.executivename}</td>
    </tr>
    <tr>
      <td style={{ fontWeight: "bold", backgroundColor: "#dce6f1", border: "1px solid black", padding: "8px" }}>
        Venue
      </td>
      <td style={{ border: "1px solid black", padding: "8px" }}>{quotationDetails?.address}</td>
      <td style={{ border: "1px solid black", padding: "8px" }}>{quotationDetails?.address}</td>
      <td style={{ border: "1px solid black", padding: "8px" }}>{quotationDetails?.address}</td>
    </tr>
    <tr>
      <td style={{ fontWeight: "bold", backgroundColor: "#dce6f1", border: "1px solid black", padding: "8px" }}>
        Occasion
      </td>
      <td style={{ border: "1px solid black", padding: "8px" }}>Sangeet</td>
      <td style={{ border: "1px solid black", padding: "8px" }}>Haldi</td>
      <td style={{ border: "1px solid black", padding: "8px" }}>Wedding</td>
    </tr>
   
    <tr>
      <td style={{ fontWeight: "bold", backgroundColor: "#dce6f1", border: "1px solid black", padding: "8px" }}>
        Delivery Date & Time
      </td>
     
 
      <td style={{ border: "1px solid black", padding: "8px" }}>1st March 7:00AM</td>
      <td style={{ border: "1px solid black", padding: "8px" }}>1st March 11:00PM</td>
      <td style={{ border: "1px solid black", padding: "8px" }}>2nd March 7:00AM</td>
    </tr>
    <tr>
      <td style={{ fontWeight: "bold", backgroundColor: "#dce6f1", border: "1px solid black", padding: "8px" }}>
        Dismantle Date & Time
      </td>
      <td style={{ border: "1px solid black", padding: "8px" }}>1st March 11:00PM</td>
      <td style={{ border: "1px solid black", padding: "8px" }}>2nd March 4:00PM</td>
      <td style={{ border: "1px solid black", padding: "8px" }}>2nd March 11:45PM</td>
    </tr>
    <tr>
      <td style={{ fontWeight: "bold", backgroundColor: "#dce6f1", border: "1px solid black", padding: "8px" }}>
        Manpower Support
      </td>
      <td style={{ border: "1px solid black", padding: "8px" }} colSpan={4}>No</td>
    </tr>
    <tr>
      <td style={{ fontWeight: "bold", backgroundColor: "#dce6f1", border: "1px solid black", padding: "8px" }}>
        Additional Logistics Support
      </td>
      <td style={{ border: "1px solid black", padding: "8px" }} colSpan={4}>No</td>
    </tr>
  </tbody>
</table> */}

             <table className="w-full border-collapse border">
              <tbody>
                <tr>
                  <td className="border px-4 py-2 font-semibold">
                    Company Name
                  </td>
                  <td className="border px-4 py-2 w-2/3">
                    {quotationDetails?.clientName || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold ">
                    Contact Number
                  </td>
                  <td className="border px-4 py-2">
                    {quotationDetails?.clientNo || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold ">
                    Executive Name
                  </td>
                  <td className="border px-4 py-2">
                    {quotationDetails?.executivename || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold ">Venue</td>
                  <td className="border px-4 py-2">
                    {quotationDetails?.address || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold ">
                    Delivery Date
                  </td>
                  <td className="border px-4 py-2">
                    {quotationDetails?.quoteDate || "N/A"}
                  </td>
                </tr>
                {/* <tr>
                  <td className="border px-4 py-2 font-semibold ">
                    Dismantel Date
                  </td>
                  <td className="border px-4 py-2">
                    {quotationDetails?.endDate || "N/A"}
                  </td>
                </tr> */}
                <tr>
                  <td className="border px-4 py-2 font-semibold ">
                    Manpower Support
                  </td>
                  <td className="border px-4 py-2">No</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold ">
                    Additional Logistics Support
                  </td>
                  <td className="border px-4 py-2">No</td>
                </tr>
              </tbody>
            </table> 
            {/* <div className="field">
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
              <label>Destimental Date :</label>{" "}
              <span>{quotationDetails?.endDate}</span>
            </div>
            <div className="field">
              <label>Manpower Support : No</label> <span></span>
            </div>
            <div className="field">
              <label>Additional Logistics Support : No</label> <span></span>
            </div>  */}
          </div>
        </div>

        {/* Table */}
        <div className="quotation-table-container">
          <table className="quotation-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Slot Date</th>
                <th>Elements</th>
                <th>No of units</th>
                <th>No of days</th>
                <th>Price per unit</th>
                <th>Amount</th>
              </tr>
            </thead>
            {/* <tbody>
           
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
            </tbody> */}
            <tbody>
              {quotationDetails?.slots?.reduce((acc, slot, slotIndex) => {
                slot?.Products?.forEach((product, productIndex) => {
                  acc.push(
                    <tr
                      key={`${slotIndex}-${productIndex}`}
                      className="hover:bg-gray-50"
                    >
                      {/* ✅ Serial Number (Auto Increment) */}
                      <td className="border px-4 py-2 text-gray-700 text-center">
                        {acc.length + 1}
                      </td>

                      {/* ✅ Only show slot date once (rowSpan) */}
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
                          {slot?.endDate}
                        </td>
                      )}

                      {/* ✅ Product Details */}
                      <td className="border px-4 py-2 text-gray-700 text-center">
                        {product.productName || "N/A"}
                      </td>

                      <td className="border px-4 py-2 text-gray-700 text-center">
                        {product.quantity || 0}
                      </td>
                      <td className="border px-4 py-2 text-gray-700 text-center">
                        1
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
                      {/* <td className="p-2 flex items-center space-x-2">
                                                  <button
                                                 
                                                    className="text-blue-500 hover:text-blue-700"
                                                  >
                                                    <FaEdit
                                                      size={18}
                                                      onClick={() => {
                                                        setModalIsOpenupdate(true);
                                                        setEditproduct(product);
                                                      }}
                                                   
                                                    />
                                                  </button> 
                                                  </td> */}
                    </tr>
                  );
                });

                return acc;
              }, [])}
            </tbody>
          </table>
        

          <div className="summary">
            <div>
              <span style={{ fontWeight: "bold" }}>Total:</span>
              <span style={{ fontWeight: "bold" }}>
                ₹
                {quotationDetails?.slots
                  ?.reduce((acc, slot) => {
                    return (
                      acc +
                      slot.Products.reduce(
                        (subtotal, product) =>
                          subtotal +
                          Number(product.price) * Number(product.quantity),
                        0
                      )
                    );
                  }, 0)
                  ?.toFixed(2) || "0.00"}
              </span>
            </div>
            
            <div>
              <span>Discount ({quotationDetails?.discount || 0}%):</span>
              <span>
                ₹
                {(
                  ((quotationDetails?.slots?.reduce((acc, slot) => {
                    return (
                      acc +
                      slot.Products.reduce(
                        (subtotal, product) =>
                          subtotal +
                          Number(product.price) * Number(product.quantity),
                        0
                      )
                    );
                  }, 0) || 0) *
                    (quotationDetails?.discount || 0)) /
                  100
                ).toFixed(2)}
              </span>
              {/* <span>{Number(quotationDetails?.discount)|| 0}%</span> */}
            </div>
            <div>
              
  {/* Total after Discount */}

  {/* <span style={{ fontWeight: "bold" }}>Subtotal:</span>
  <span style={{ fontWeight: "bold" }}>
    ₹
    {(
      (quotationDetails?.slots?.reduce((acc, slot) => {
        return (
          acc +
          slot.Products.reduce(
            (subtotal, product) =>
              subtotal + Number(product.price) * Number(product.quantity),
            0
          )
        );
      }, 0) || 0) -
      ((quotationDetails?.slots?.reduce((acc, slot) => {
        return (
          acc +
          slot.Products.reduce(
            (subtotal, product) =>
              subtotal + Number(product.price) * Number(product.quantity),
            0
          )
        );
      }, 0) || 0) *
        (quotationDetails?.discount || 0)) /
        100
    ).toFixed(2)}
  </span> */}

  
</div>

<div>
              <span>Transportation:</span>
              <span>₹{quotationDetails?.transportcharge?.toFixed(2)}</span>
            </div>
            <div>
              <span>Manpower Cost/Labour Charge:</span>
              <span>₹{quotationDetails?.labourecharge?.toFixed(2)}</span>
            </div>
            <div>
  <span style={{ fontWeight: "bold" }}>Subtotal:</span>
  <span style={{ fontWeight: "bold" }}>
    ₹
    {(() => {
      const baseTotal = quotationDetails?.slots?.reduce((acc, slot) => {
        return (
          acc +
          slot.Products.reduce((subtotal, product) => {
            return subtotal + Number(product.price) * Number(product.quantity);
          }, 0)
        );
      }, 0) || 0;

      const discountPercentage = Number(quotationDetails?.discount || 0);
      const discountAmount = (baseTotal * discountPercentage) / 100;

      const afterDiscount = baseTotal - discountAmount;

      const labour = Number(quotationDetails?.labourecharge || 0);
      const transport = Number(quotationDetails?.transportcharge || 0);

      const subtotal = afterDiscount + labour + transport;

      return subtotal.toFixed(2);
    })()}
  </span>
</div>

                <div>
                <span>RoundOff:</span>
                <span>₹{quotationDetails?.adjustments?.toFixed(2)}</span>
              </div>
         
            <div>
              <span>GST(18%):</span>
              <div>
                {/* <span>GST ({Number(quotationDetails?.GST) * 100 || 0}%):</span> */}
                {/* <span>
                  ₹
                  {(
                    ((quotationDetails?.slots?.reduce((acc, slot) => {
                      return (
                        acc +
                        slot.Products.reduce(
                          (subtotal, product) =>
                            subtotal +
                            Number(product.price) * Number(product.quantity),
                          0
                        )
                      );
                    }, 0) || 0) -
                      // Subtract discount before calculating GST
                      ((quotationDetails?.slots?.reduce((acc, slot) => {
                        return (
                          acc +
                          slot.Products.reduce(
                            (subtotal, product) =>
                              subtotal +
                              Number(product.price) * Number(product.quantity),
                            0
                          )
                        );
                      }, 0) || 0) *
                        (quotationDetails?.discount || 0)) /
                        100) *
                    (quotationDetails?.GST || 0)
                  ).toFixed(2)}
                </span> */}
                 <span>
    ₹
    {(() => {
      const baseTotal = quotationDetails?.slots?.reduce((acc, slot) => {
        return acc + slot.Products.reduce((sub, p) => sub + Number(p.price) * Number(p.quantity), 0);
      }, 0) || 0;

      const discount = (Number(quotationDetails?.discount) || 0);
      const labour = Number(quotationDetails?.labourecharge || 0);
      const transport = Number(quotationDetails?.transportcharge || 0);
      const gstRate = Number(quotationDetails?.GST || 0); // Expecting 0.18 for 18%

      const discountAmount = (baseTotal * discount) / 100;
      const subtotal = baseTotal - discountAmount + labour + transport;

      const gstAmount = subtotal * gstRate;

      return gstAmount.toFixed(2);
    })()}
  </span>
              </div>
              {/* <span>
      ₹
      {(
        (quotationDetails?.slots?.reduce((acc, slot) => {
          return (
            acc +
            slot.Products.reduce(
              (subtotal, product) =>
                subtotal + Number(product.price) * Number(product.quantity),
              0
            )
          );
        }, 0) || 0) * (quotationDetails?.GST || 0)
      ).toFixed(2)}
    </span> */}
              {/* <span>{Number(quotationDetails?.GST*100)|| 0}%</span> */}
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
        {handleOrderNotSHow?.status === "Completed" ? (
          <></>
        ) : (
          <>
            {!hideButton && (
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
              
              

            )}
             {!hideButton && (
              <button
              onClick={() => {
                setSelectedProductDetails1({ // Reset State when opening
                  productId: null,
                  productName: "",
                  price: 0,
                  StockAvailable: 0,
                  quantity: 1,
                  total: 0,
                  availableQty: 0,
                });
                setIsOpen(true);
                setEditquotation(quotationDatadetails)
              }}
                style={{
                  backgroundColor: "green",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "20px",
                  marginLeft:"20px"
                }}
              >
              Add Product
              </button>
              
            )}
          </>
        )}

        {/* {paymentfilter?.status == "Completed" ? (
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
                  // onClick={handleViewClick4}
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
        )} */}
      </div>

      <div className="overflow-x-auto p-4">
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
                  <td className="border px-4 py-2 text-gray-700">
                    {element?.paymentRemarks}
                  </td>
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
          {quotationDetails?.GrandTotal?.toFixed(2) -
            allAdvancedAmount?.toFixed(2) >
            0 && (
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
          )}
          {/* <div
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
          </div> */}
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
                onClick={() => {
                  closeModal();
                }}
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


      {/* add product */}
      {/* enventory data */}
        <div>
              <Modal
                isOpen={isOpen}
                onRequestClose={() => setIsOpen(false)}
                style={{
                  overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                  },
                  content: {
                    // width: "400px",
                    height: "300px",
                    margin: "auto",
                    padding: "20px",
                    borderRadius: "8px",
                  },
                }}
              >
                <h2 className="text-lg font-semibold mb-4">Product</h2>
               
                {/* inventory */}
                <div className="mt-5">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border">Product Name</th>
                        <th className="px-4 py-2 border">Left Stock</th>
                        <th className="px-4 py-2 border">Quantity</th>
                        <th className="px-4 py-2 border">Price</th>
                        <th className="px-4 py-2 border">Total Price</th>
                        <th className="px-4 py-2 border">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center">
                        <td>
                          <div>
                            <div>
                              <SelectPicker
                                data={formattedProducts} // Use the formatted data
                                searchable={true}
                                style={{ width: 224 }}
                                placeholder="Select product"
                                onChange={(value) => handleProductSelection2(value)}
                                multiple // Handle selection
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 border">
                          {selectedProductDetails1.availableQty ||
                            selectedProductDetails1.StockAvailable}
                        </td>
                        <td className="px-4 py-2 border">
                          <input
                            type="number"
                            value={selectedProductDetails1.quantity}
                            onChange={(e) =>
                              handleQuantityChange1(Number(e.target.value))
                            }
                            style={{ width: 150 }}
                            className="border border-gray-300 rounded-md px-2 py-1 w-full"
                          />
                        </td>
                        <td className="px-4 py-2 border">
                          ₹{selectedProductDetails1.price || 0}
                        </td>
                        <td className="px-4 py-2 border">
                          ₹{selectedProductDetails1.total || 0}
                        </td>
                        <td>
                          <div
                            style={{ margin: "10px" }}
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
                            // onClick={() =>
                            //   addProductToSlot1(
                            //     ontherSlots,
                            //     // Pr1,
                            //     selectedProductDetails1
                            //   )
                            // }
                            onClick={addProductToSlot1}
                          >
                            Add
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded-md mr-2"
                  >
                    Close
                  </button>
                  {/* <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    // onClick={handleSubmit}
                    // onClick={handleAddnewproduct}
                  >
                    Submit
                  </button> */}
                </div>
              </Modal>
            </div>

            {/* Update Quantity modal */}
             <Modal
                    isOpen={modalIsOpenupdate}
                    onRequestClose={() => setModalIsOpenupdate(false)}
                    contentLabel="Example Modal"
                    style={{
                      overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      content: {
                        width: "50%",
                        height: "auto",
                        maxWidth: "500px",
                        maxHeight: "30vh",
                        margin: "auto",
                        padding: "20px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
                      },
                    }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={editproduct?.productName}
                        // onChange={(e) => setProductName(e.target.value)}
                        className="w-full border bg-white border-gray-300 px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                      Available Stock
                      </label>
                      <input
                        type="number"
                        defaultValue={editproduct?.availableStock}
                        min="1"
                        // onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full border bg-white border-gray-300 px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        defaultValue={editproduct?.quantity}
                        min="1"
                        // onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full border bg-white border-gray-300 px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-500"
                      />
                    </div>
            
                    <button
                      onClick={() => setModalIsOpenupdate(false)}
                      style={{
                        padding: "10px 20px",
                        margin: "10px",
                        backgroundColor: "#ccc",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Close
                    </button>
            
                    {/* Update Button */}
                    <button
                      // onClick={() => handleUpdateQuantity()}
                      style={{
                        padding: "10px 20px",
                        margin: "10px",
                        backgroundColor: "#4CAF50", // Green color
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Update
                    </button>
                  </Modal>
    </div>
  );
};

export default QuotationFormat;
