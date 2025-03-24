import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { ApiURL } from "../path";
import { Header } from "../components";
import { MultiSelectComponent } from "@syncfusion/ej2-react-dropdowns";
import moment from "moment/moment";
import deleteicon from "../assets/images/delete.png";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import "rsuite/dist/rsuite.min.css";
import { SelectPicker, VStack } from "rsuite";
import Modal from "react-modal";
import { AiOutlineSearch } from "react-icons/ai";

function Quotations() {
  const [showAddCreateQuotation, setShowAddCreateQuotation] = useState(false);
  const [ClientData, setClientData] = useState([]);
  const [ProductData, setProductData] = useState([]);
  const [subcategory, serSubcategory] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editquotations, setEditquotation] = useState({});
  const [termsConditionData, setTermsConditionData] = useState([]);
  const [selectedTermsConditions, setSelectedTermsConditions] = useState([]);
  const [QuotationData, setQuotationData] = useState([]);
  const [ClientName, setClientName] = useState("");
  const [ClientId, setClientId] = useState("");
  const [filteredQuotations, setFilteredQuotations] = useState([]); // ✅ Store filtered data
  const [searchTerm, setSearchTerm] = useState(""); 

  const [Products, setProducts] = useState([]);
  const [adjustment, setAdjustment] = useState(0);
  const [grandTotal, setGrandTotal] = useState(
    Number(editquotations?.GrandTotal || 0)
  );
  // console.log(grandTotal, "grandTotals");
  const [labourecharge, setlabourecharge] = useState("");
  const [transportcharge, settransportcharge] = useState("");
  const [GST, setGST] = useState(0);
  console.log(GST,"GST")
  const [discount, setDiscount] = useState(0);
  // console.log(discount,"discount");
  // console.log(GST,"GST");
  const [ClientNo, setClientNo] = useState();
  const [Address, setAddress] = useState();
  const [category, setCategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [Pr, setPr] = useState({});
  const [Pr1, setPr1] = useState({});
 
  const fetchSubcategory = async () => {
    try {
      const res = await axios.get(`${ApiURL}/subcategory/getappsubcat`);
      if (res.status === 200) {
        serSubcategory(res.data.subcategory);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchSubcategory();
  }, []);
  // console.log(selectedCategory,"selectedCategory")
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value); // Update selected category
  };
  useEffect(() => {
    getCategory();
  }, []);

  const getCategory = async () => {
    try {
      const res = await axios.get(`${ApiURL}/category/getcategory`);
      if (res.status === 200) {
        setCategoryData(res.data?.category);
      }
    } catch (error) {
      console.error("Error fetching categories:", error.message || error);
    }
  };

  const handleClientSelection = (event) => {
    const selectedClientName = event.target.value;
    const selectedClient = ClientData.find(
      (client) => client.clientName === selectedClientName
    );

    if (selectedClient) {
      setClientName(selectedClientName);
      setClientId(selectedClient._id);
      setClientNo(selectedClient.phoneNumber);
      setAddress(selectedClient.address);
    } else {
      setClientName("");
      setClientId("");
    }
  };

  useEffect(() => {
    fetchClients();
    fetchProducts();
    fetchTermsAndConditions();
    fetchquotations();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${ApiURL}/client/getallClientsNames`);
      if (res.status === 200) {
        setClientData(res.data.ClientNames);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${ApiURL}/product/quoteproducts`);
      if (res.status === 200) {
        setProductData(res.data.QuoteProduct);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  // Product api with inventory management
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
  const fetchquotations = async () => {
    try {
      const res = await axios.get(`${ApiURL}/quotations/getallquotations`);
      if (res.status === 200) {
        console.log("res.data.quoteData)", res.data.quoteData);
        setQuotationData(res.data.quoteData);
        setFilteredQuotations(res.data.quoteData)
        
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchTermsAndConditions = async () => {
    try {
      const res = await axios.get(
        `${ApiURL}/termscondition/allTermsandCondition`
      );
      if (res.status === 200) {
        setTermsConditionData(res.data.TermsandConditionData);
      }
    } catch (error) {
      console.error("Error fetching terms and conditions:", error);
    }
  };

 
  const handleProductSelection = (selectedValues) => {
    // Map over selected product IDs to create or reuse product objects
    const newSelections = selectedValues.map((productId) => {
      const existingProduct = Products.find(
        (prod) => prod.productId === productId
      );

      if (existingProduct) {
        return existingProduct; // Reuse existing product if already selected
      }

      const productDetails = ProductData.find((prod) => prod._id === productId);

      return {
        productId,
        productName: productDetails.ProductName,
        price: productDetails.ProductPrice || 0,
        quantity: 1,
        total: productDetails.ProductPrice || 0,
        StockAvailable: productDetails?.StockAvailable || 0,
      };
    });

    // Merge new selections with existing products, avoiding duplicates
    const updatedProducts = [
      ...Products.filter(
        (existingProduct) =>
          !newSelections.some(
            (newProduct) => newProduct.productId === existingProduct.productId
          )
      ),
      ...newSelections,
    ];

    setProducts(updatedProducts);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const updatedProducts = Products.map((product) => {
      if (product.productId === productId) {
        const newTotal = product.price * newQuantity;
        return { ...product, quantity: newQuantity, total: newTotal };
      }
      return product;
    });

    setProducts(updatedProducts);
  };

 

 
  useEffect(() => {
    let baseTotal = Number(editquotations?.GrandTotal || 0);
    // Calculate discount amount from percentage
    let discountAmount = (baseTotal * Number(discount)) / 100;
    let discountedTotal = baseTotal - discountAmount; 
    // Calculate GST amount from percentage
    let GSTPercentage = Number(GST) || 0;
    let GSTAmount = discountedTotal * GSTPercentage; 
    let finalTotal =
      discountedTotal + 
      GSTAmount + // GST added
      Number(labourecharge) +  // Labour charge
      Number(transportcharge) -  // Transport charge
      Number(adjustment);  // Adjustment/Round-off

    // Ensure GrandTotal is never negative
    finalTotal = Math.max(0, finalTotal);

    // Update state
    setGrandTotal(finalTotal);
}, [discount, GST, labourecharge, transportcharge, adjustment, editquotations?.GrandTotal]);


// 24-03-2025 new
useEffect(() => {
  const baseTotal = Number(editquotations?.GrandTotal || 0);
  const discountPercentage = Number(discount) || 0;
  const labour = Number(labourecharge) || 0;
  const transport = Number(transportcharge) || 0;
  const adjustmentAmount = Number(adjustment) || 0;
  const GSTPercentage = Number(GST) || 0;
  // Step 1: Apply discount
  const discountAmount = (baseTotal * discountPercentage) / 100;
  const discountedTotal = baseTotal - discountAmount;
  // Step 2: Add labour and transport
  const totalBeforeGST = discountedTotal + labour + transport;
  // Step 3: Add GST
  const GSTAmount = totalBeforeGST * GSTPercentage;
  // Step 4: Add/Subtract adjustment
  let finalTotal = totalBeforeGST + GSTAmount - adjustmentAmount;
  // Step 5: Ensure it's not negative
  finalTotal = Math.max(0, finalTotal);

  // Set Grand Total
  setGrandTotal(finalTotal);
}, [discount, GST, labourecharge, transportcharge, adjustment, editquotations?.GrandTotal]);


  
  
  const handleTermsConditionChange = (termId) => {
    const alreadySelected = selectedTermsConditions.some(
      (term) => term === termId
    );

    if (alreadySelected) {
      setSelectedTermsConditions((prev) =>
        prev.filter((term) => term !== termId)
      );
    } else {
      setSelectedTermsConditions((prev) => [...prev, termId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ClientName || !Products || !selectedTermsConditions) {
      alert("Please enter all fields");
    } else {
      try {
        const config = {
          url: "/quotations/createQuotation",
          method: "post",
          baseURL: ApiURL,
          headers: { "content-type": "application/json" },
          data: {
            clientName: ClientName,
            clientId: ClientId,
            Products: Products,
            adjustments: adjustment,
            GrandTotal: grandTotal,
            GST: GST,
            clientNo: ClientNo,
            address: Address,
            quoteDate: moment().format("DD-MM-YYYY"),
            endDate: moment().format("DD-MM-YYYY"),
            quoteTime: moment().format("LT"),
            termsandCondition: selectedTermsConditions,
          },
        };
        await axios(config).then(function (response) {
          if (response.status === 200) {
            toast.success("Quotation Created Successfully ");
            window.location.reload();
          }
        });
      } catch (error) {
        console.error(error);

        if (error.response) {
          alert(error.response.data.error); // Display error message from the API response
        } else {
          alert("An error occurred. Please try again later.");
        }
      }
    }
  };


  const handleupdateQuotations = async (e) => {
    e.preventDefault();

    try {
      const config = {
        url: "/quotations/updateQuotation",
        method: "put",
        baseURL: ApiURL,
        headers: { "content-type": "application/json" },
        data: {
          quoteId: editquotations?.quoteId,
          labourecharge: labourecharge,
          transportcharge: transportcharge,
          adjustments: adjustment,
          GST: GST,  
          discount: discount,
          GrandTotal: grandTotal,
          status: "send",
        },
      };
      await axios(config).then(function (response) {
        if (response.status === 200) {
          toast.success("Quotation Created Successfully ");
          window.location.reload();
        }
      });
    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.error); // Display error message from the API response
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  };

  const deleteQuotation = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        const response = await axios.post(
          `${ApiURL}/quotations/deletequotation/${id}`
        );
        if (response.status === 200) {
          toast.success("Successfully Deleted");
          setQuotationData();
          window.location.reload(true);
        }
      } catch (error) {
        toast.error("Quotation Not Deleted");
        window.location.reload();
        console.error("Error deleting the Quotation:", error);
      }
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelection = (e) => {
    const subcategory = e.target.value;
    setSelectedSubcategory(subcategory);

    // console.log("ProductData---", ProductData);
    // Filter products based on the selected subcategory
    const filtered = ProductData?.filter(
      (product) => product.ProductSubcategory === subcategory.trim()
    );

    console.log("filtered produts", filtered);
    setFilteredProducts(filtered);
  };

  // alternate product
  const [showTable, setShowTable] = useState(false);
  const [showTable1, setShowTable1] = useState(false);
  // Add Another slots
  const [selectslots, setSelectslots] = useState("");
  // const addOntherSlots = async () => {

  //   try {
  //     const response = await axios.post("https://api.rentangadi.in/api/quotations/add-products", {
  //       id: editquotations?.quoteId,
  //       slots:[
  //         {
  //           slotName:selectslots,
  //           Products:Products,
  //         }
  //       ],
  //     });

  //     if (response.status === 200) {
  //       console.log("Products added successfully:", response.data);
  //       alert("Products added successfully!");
  //     }
  //   } catch (error) {
  //     console.error("Error adding products to slots:", error.response?.data || error.message);
  //     alert(error.response?.data?.error || "Failed to add products to slots.");
  //   }
  // };
  const [updatedgrandtotal, setUpdatedgrandtotal] = useState(null);
  const [enquiryDate, setEnquiryDate] = useState();
  const [endDate, setEndDate] = useState();
  const addOntherSlots = async () => {
    if (!selectslots || Products.length === 0) {
      alert("Please select a slot and add products.");
      return;
    }
    const slotAlreadyExists = editquotations?.slots?.some(
      (slot) => slot.slotName === selectslots
    );
  
    if (slotAlreadyExists) {
      alert("This slot is already added. You cannot add the same slot again.");
      return;
    }

    // Calculate total for the new slot
    const newSlotTotal = Products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );

    // Calculate the updated GrandTotal
    const updatedGrandTotal =
      Number(editquotations?.GrandTotal || 0) + newSlotTotal;

    try {
      // Prepare payload with updated GrandTotal
      const payload = {
        id: editquotations?.quoteId,
        slots: [
          {
            slotName: selectslots,
            Products: Products,
            quoteDate: moment(enquiryDate).format("DD-MM-YYYY"),
            endDate: moment(endDate).format("DD-MM-YYYY"),
          },
        ],
        GrandTotal: updatedGrandTotal, // Correctly calculated GrandTotal
      };

      console.log("Payload Sent to Backend:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        "https://api.rentangadi.in/api/quotations/add-products",
        payload
      );

      if (response.status === 200) {
        console.log("Products added successfully:", response.data);

        // Update slots in local state
        const updatedSlots = [
          ...editquotations?.slots,
          { slotName: selectslots, Products },
        ];

        setEditquotation((prev) => ({
          ...prev,
          slots: updatedSlots,
          GrandTotal: updatedGrandTotal,
        }));

        setUpdatedgrandtotal(updatedGrandTotal); // Update local state with new GrandTotal

        // Reset inputs
        setSelectslots("");
        setProducts([]);
        toast.success("Products added successfully!");
        window.location.reload()
        setModalIsOpen(false);
       
      }
    } catch (error) {
      console.error(
        "Error adding products to slots:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.error || "Failed to add products to slots.");
    }
  };

  //add onther prodcut in same slots +++++++
  // select in  data
  const formattedProducts = productinventory.map((product) => ({
    label: product.ProductName,
    value: product._id,
  }));

  const [ontherSlots, setOnterSlots] = useState({});
  const [particulaProductId, setParticulaProductId] = useState({});
  console.log(particulaProductId, "particulaProductId");
  console.log(ontherSlots, "ontherSlots");
  const [selectedProductDetails, setSelectedProductDetails] = useState({
    productId: null,
    productName: "",
    price: 0,
    StockAvailable: 0,
    quantity: 1,
    total: 0,
    availableQty: 0,
  });

  console.log("selectedProductDetails??", selectedProductDetails);

  const handleProductSelection1 = (productId) => {
    // Find the product in the database using `_id`
    const selectedProduct = productinventory.find(
      (product) => product._id === productId
    );

    if (selectedProduct) {
      // Update state with the selected product's details
      setSelectedProductDetails({
        productId: selectedProduct._id, // Use `_id` as `productId`
        productName: selectedProduct.ProductName, // Correct property
        price: Number(selectedProduct.ProductPrice), // Ensure price is a number
        StockAvailable: Number(
          selectedProduct.ProductStock || selectedProduct.StockAvailable
        ), // Use `ProductStock` or `StockAvailable`
        quantity: 1, // Default quantity
        total: Number(selectedProduct.ProductPrice) * 1, // Calculate total
        availableQty:Number(selectedProduct.availableQty),
      });
    } else {
      console.error("Selected product not found in ProductData.");
    }
  };

  const handleQuantityChange1 = (newQuantity) => {
    setSelectedProductDetails((prev) => ({
      ...prev,
      quantity: newQuantity,
      total: prev.price * newQuantity,
    }));
  };
  // console.log("selectedProductDetails", selectedProductDetails)

 

  // 18-01
  const addProductToSlot = async (
    slotName,
    selectedProduct,
    alternateProduct
  ) => {
    try {
      const alternateQuantity = Number(alternateProduct.quantity);
      const alternatePrice = Number(alternateProduct.price);

      // Find the slot by name
      const slot = editquotations.slots.find(
        (slot) => slot.slotName === slotName
      );
      if (!slot) {
        alert("Slot not found.");
        return;
      }

      // Find the selected product in the slot
      const selectedProductIndex = slot.Products.findIndex(
        (product) => product.productId === selectedProduct.productId
      );

      if (selectedProductIndex === -1) {
        alert("Selected product not found.");
        return;
      }

      // Validate quantities and prices
      if (
        isNaN(alternateQuantity) ||
        isNaN(alternatePrice) ||
        alternateQuantity > selectedProduct.quantity
      ) {
        alert(
          "Invalid alternate product data or quantity exceeds available stock."
        );
        return;
      }

      // Check if the alternate product already exists in the slot
      const existingProductIndex = slot.Products.findIndex(
        (product) => product.productId === alternateProduct.productId
      );

      if (existingProductIndex !== -1) {
        alert("This product is already added to the slot.");
        return;
      }

      // Adjust the selected product's quantity and total
      const updatedSlots = editquotations.slots.map((currentSlot) => {
        if (currentSlot.slotName === slotName) {
          return {
            ...currentSlot,
            Products: currentSlot.Products.map((product, index) => {
              if (index === selectedProductIndex) {
                return {
                  ...product,
                  quantity: product.quantity - alternateQuantity,
                  total: (product.quantity - alternateQuantity) * product.price,
                };
              }
              return product;
            }),
          };
        }
        return currentSlot;
      });

      // Add the alternate product to the slot
      updatedSlots.forEach((currentSlot) => {
        if (currentSlot.slotName === slotName) {
          currentSlot.Products.push({
            ...alternateProduct,
            quantity: alternateQuantity,
            price: alternatePrice,
            total: alternateQuantity * alternatePrice,
          });
        }
      });

      // Recalculate Grand Total
      const updatedGrandTotal = updatedSlots.reduce((total, slot) => {
        return (
          total +
          slot.Products.reduce(
            (sum, product) => sum + (Number(product.total) || 0),
            0
          )
        );
      }, 0);

      // Validate Grand Total
      if (isNaN(updatedGrandTotal)) {
        console.error("Invalid GrandTotal calculation.");
        alert("GrandTotal calculation failed.");
        return;
      }

      // Prepare payload for backend
      const payload = {
        id: editquotations?.quoteId,
        slots: updatedSlots,
        GrandTotal: updatedGrandTotal,
      };

      console.log("Payload Sent to Backend:", JSON.stringify(payload, null, 2));

      // Send the payload to the backend
      const response = await axios.post(
        "https://api.rentangadi.in/api/quotations/addontherproductsameslots",
        payload
      );

      if (response.status === 200) {
        console.log("Alternate product added successfully:", response.data);

        // Update local state with the updated data
        setEditquotation((prev) => ({
          ...prev,
          slots: updatedSlots,
          GrandTotal: updatedGrandTotal,
        }));

        alert("Alternate product added successfully!");
        window.location.reload()
      }
    } catch (error) {
      console.error(
        "Error adding alternate product:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.error || "Failed to add alternate product.");
    }
  };

  // addproduct+++++
  const [selectedProductDetails1, setSelectedProductDetails1] = useState({
    productId: null,
    productName: "",
    price: 0,
    StockAvailable: 0,
    quantity: 1,
    total: 0,
    availableQty: 0,
  });
  console.log(selectedProductDetails1, "selectedProductDetails11");
  // const handleProductSelection2 = (productId) => {
  //   console.log("productId",productId)
  //   // Find the product in the database using `_id`
  //   const selectedProduct = ProductData.find(
  //     (product) => product._id === productId
  //   );

  //   if (selectedProduct) {
  //     // Update state with the selected product's details
  //     setSelectedProductDetails1({
  //       productId: selectedProduct._id, // Use `_id` as `productId`
  //       productName: selectedProduct.ProductName, // Correct property
  //       price: Number(selectedProduct.ProductPrice), // Ensure price is a number
  //       StockAvailable: Number(selectedProduct.ProductStock),
  //       quantity: 1, // Default quantity
  //       total: Number(selectedProduct.ProductPrice) * 1, // Calculate total
  //       totalAvailableQty:Number(selectedProduct.totalAvailableQty)
  //     });
  //   } else {
  //     console.error("Selected product not found in ProductData.");
  //   }
  // };

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
        availableQty:Number(selectedProduct.availableQty) || 0,
        // totalAvailableQty, // Use calculated `totalAvailableQty`
      });
    } else {
      console.error("Selected product not found in ProductData.");
    }
  };

  // const handleQuantityChange2 = (newQuantity) => {
  //   setSelectedProductDetails1((prev) => ({
  //     ...prev,
  //     quantity: newQuantity,
  //     total: prev.price * newQuantity,
  //   }));
  // };
  const handleQuantityChange2 = (newQuantity) => {
    setSelectedProductDetails1((prev) => {
      if (newQuantity > prev.StockAvailable) {
        alert("Insufficient stock available for the selected quantity.");
        return prev; // Return the current state without updating
      }
      return {
        ...prev,
        quantity: newQuantity,
        total: prev.price * newQuantity,
      };
    });
  };

  
  // 18-08-2025
  const addProductToSlot1 = async (slotName, newProduct) => {
    try {
      // Validate new product
      const productQuantity = Number(newProduct.quantity);
      const productPrice = Number(newProduct.price);

      if (isNaN(productQuantity) || isNaN(productPrice)) {
        alert("Invalid product data. Please check the quantity and price.");
        return;
      }

      // Find and update the specific slot
      const updatedSlot = editquotations.slots.find(
        (slot) => slot.slotName === slotName
      );

      if (!updatedSlot) {
        alert("Slot not found.");
        return;
      }

      // Check if the product already exists in the slot
      const existingProductIndex = updatedSlot.Products.findIndex(
        (product) => product.productId === newProduct.productId
      );

      console.log("updatedSlot---", updatedSlot);
      if (existingProductIndex === -1) {
        // Add new product if it doesn't exist
        updatedSlot.Products.push({
          productId: newProduct.productId,
          productName: newProduct.productName || "New Product",
          quantity: productQuantity,
          price: productPrice,
          total: productQuantity * productPrice,
          StockAvailable: newProduct.StockAvailable,
        });
      } else {
        alert("This product is already added to the slot.");
        return;
      }

      // Recalculate Grand Total for the updated slot
      updatedSlot.total = updatedSlot.Products.reduce((sum, product) => {
        return sum + (Number(product.total) || 0);
      }, 0);

      // Prepare payload for backend
      const payload = {
        id: editquotations?.quoteId,
        slots: [updatedSlot], // Only the updated slot
      };

      console.log("Payload Sent to Backend:", JSON.stringify(payload, null, 2));

      // Send the payload to the backend
      const response = await axios.post(
        "https://api.rentangadi.in/api/quotations/addontherproductsameslotstwo",
        payload
      );

      if (response.status === 200) {
        console.log("Product added successfully:", response.data);

        // Update local state with the updated data
        setEditquotation((prev) => ({
          ...prev,
          slots: prev.slots.map((slot) =>
            slot.slotName === slotName ? updatedSlot : slot
          ),
        }));

        alert("Product added successfully!");
        fetchquotations()
        setShowTable1(false);
        window.location.reload()
        setSelectedProductDetails1((prev) => ({
          ...prev,
          StockAvailable: prev.StockAvailable - productQuantity, 
        }));
      }
    } catch (error) {
      console.error(
        "Error adding product:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.error || "Failed to add product.");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setFilteredQuotations(QuotationData); 
    } else {
      const filtered = QuotationData.filter(
        (quote) =>
          quote.clientName.toLowerCase().includes(value) ||
          quote.quoteDate.toLowerCase().includes(value) ||
          quote.GrandTotal.toString().includes(value) ||
          quote.GST.toString().includes(value)
      );
      setFilteredQuotations(filtered);
    }
  };

  // 23-03
  const handleRemoveSelectedProduct = () => {
    setSelectedProductDetails1({
      productId: null,
      productName: "",
      price: 0,
      StockAvailable: 0,
      quantity: 1,
      total: 0,
      availableQty: 0,
    });
  };
  
  const handleRemoveProduct = (productId) => {
    const updated = Products.filter((prod) => prod.productId !== productId);
    setProducts(updated);
  };
  


  return (
    <div className="m-2 mt-6 md:mt-2 p-2 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />

      {/* Header */}
      <Header banner="Quotations" title="Quotations" />
      <div className="mb-3 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search..."
            className="w-72 border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-500"
          />
          <AiOutlineSearch className="absolute left-3 top-3 text-gray-500 text-lg" />
        </div>
      </div>
      {/* <div className="mb-3 flex gap-5 justify-end">
        <button
          onClick={() => setShowAddCreateQuotation(true)}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Create Quotations
          </span>
        </button>
      </div> */}

      {showAddCreateQuotation && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full max-w-7xl max-h-7xl overflow-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold"> Create Quotation</h2>
              {/* <button
                onClick={() => setShowAddCreateQuotation(false)}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg p-2"
              >
                &#x2715;
              </button> */}
            </div>
            <form className="space-y-4">
              <div className="border border-gray-300 rounded-md p-4">
                {/* Row 1 */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                  <label className="block text-gray-700 font-semibold">
                    Client Name:{" "}
                    <span className="text-black-500">
                      {editquotations?.clientName || "N/A"}
                    </span>
                  </label>
                  <label className="block text-gray-700 font-semibold">
                    Phone Number:{" "}
                    <span className="text-black-500">
                      {editquotations?.clientNo || "N/A"}
                    </span>
                  </label>
                </div>

                {/* Row 2 */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                  <label className="block text-gray-700 font-semibold">
                    Executive Name:{" "}
                    <span className="text-black-500">
                      {editquotations?.executivename || "N/A"}
                    </span>
                  </label>
                  {/* <label className="block text-gray-700 font-semibold">
                    Event Slot:{" "}
                    <span className="text-black-500">7:00 AM to 11 :45 PM</span>
                  </label> */}
                  {/* <label className="block text-gray-700 font-semibold">
                    GST:{" "}
                    <span className="text-black-500">
                      {editquotations?.GST || "N/A"}
                    </span>
                  </label> */}
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                  <label className="block text-gray-700 font-semibold">
                    Address:{" "}
                    <span className="text-black-500">
                      {editquotations.placeaddress}
                    </span>
                  </label>
                </div>
                </div>
                

                {/* Row 3 */}

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Products
                  </h3>
                  <div className="border border-gray-200 rounded-md p-2">
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                            Slot
                          </th>
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                            Product Name
                          </th>
                          {/* <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                             Stock
                            </th> */}
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                            Available Stock
                          </th>
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                            Quantity
                          </th>
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                            Price
                          </th>
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                            Total
                          </th>
                          {/* <th
                            className="border px-4 py-2 text-left text-gray-700 font-semibold text-center"
                            style={{ width: "200px" }}
                          >
                            Action
                          </th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {editquotations?.slots?.map((slot, slotIndex) => (
                          <React.Fragment key={slotIndex}>
                            {slot?.Products?.map((product, productIndex) => (
                              <tr
                                key={productIndex}
                                className="hover:bg-gray-50"
                              >
                                {productIndex === 0 && (
                                  <td
                                    className="border px-4 py-2 text-gray-700 font-bold text-center bg-gray-200"
                                    rowSpan={slot.Products.length}
                                    style={{
                                      borderBottom: "1px solid #8080803b",
                                    }}
                                  >
                                    {slot?.slotName?.slice(0,16)}, <br />
                          {slot?.quoteDate}, <br />{slot?.slotName?.slice(16,)}, <br />
                          {slot?.endDate},
                                    {/* {slot.slotName},{slot?.quoteDate},
                                    {slot?.endDate}, */}
                                  </td>
                                )}
                                {/* Product Details */}
                                <td className="border px-4 py-2 text-gray-700 text-center">
                                  {product.productName || "N/A"}
                                </td>
                                <td className="border px-4 py-2 text-gray-700 text-center">
                                  {product.availableStock || "0"}
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
                                    Number(product.price) *
                                    Number(product.quantity)
                                  ).toFixed(2) || 0}
                                </td>
                                {/* <td className="border px-4 py-2 text-gray-700 text-center">
                                  <div
                                    className="px-3 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
                                    onClick={() => {
                                      setShowTable(!showTable),
                                        setOnterSlots(slot.slotName),
                                        setParticulaProductId(
                                          product?.productId
                                        );
                                      setPr(product);
                                    }}
                                  >
                                    Add Alternate Product
                                  </div>
                                </td> */}
                                {productIndex === 0 && (
                                  <td
                                    className="border px-4 py-2 text-gray-700 font-bold text-center bg-gray-200"
                                    rowSpan={slot.Products.length}
                                    style={{
                                      borderBottom: "1px solid #8080803b",
                                    }}
                                    onClick={() => {
                                      setShowTable1(!showTable1),
                                        setOnterSlots(slot.slotName),
                                        setPr1(product);
                                    }}
                                  >
                                    Add Product
                                  </td>
                                )}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <label
                    className="block text-gray-700 font-semibold"
                    style={{ fontSize: "15px", fontWeight: "600" }}
                  >
                    Grand Total:{" "}
                    <span className="text-black-500">
                      {editquotations?.GrandTotal || "N/A"}
                      {/* {grandTotal|| "N/A"} */}
                    </span>
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <div
                  className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none"
                  onClick={() => setModalIsOpen(true)}
                  style={{ width: "150px" }}
                >
                  Add Other Slot
                </div>
              </div>
              <div className="flex justify-between items-center mt-3"></div>
              <div>
                {showTable && (
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
                                  onChange={(value) =>
                                    handleProductSelection1(value)
                                  }
                                  multiple // Handle selection
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 border">
                            {selectedProductDetails.availableQty || selectedProductDetails?.StockAvailable}
                          </td>
                          <td className="px-4 py-2 border">
                            <input
                              type="number"
                              value={selectedProductDetails.quantity}
                              onChange={(e) =>
                                handleQuantityChange1(Number(e.target.value))
                              }
                              style={{ width: 150 }}
                              className="border border-gray-300 rounded-md px-2 py-1 w-full"
                            />
                          </td>
                          <td className="px-4 py-2 border">
                            ₹{selectedProductDetails.price || 0}
                          </td>
                          <td className="px-4 py-2 border">
                            ₹{selectedProductDetails.total || 0}
                          </td>
                          <td>
                            <div
                              style={{ margin: "10px" }}
                              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
                              onClick={() =>
                                addProductToSlot(
                                  ontherSlots,
                                  Pr,
                                  selectedProductDetails
                                )
                              }
                            >
                              Add
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                {showTable1 && (
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
                                  onChange={(value) =>
                                    handleProductSelection2(value)
                                  }
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
                                handleQuantityChange2(Number(e.target.value))
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
                              onClick={() =>
                                addProductToSlot1(
                                  ontherSlots,
                                  // Pr1,
                                  selectedProductDetails1
                                )
                              }
                            >
                              Add
                            </div>
                            <div
    style={{ margin: "10px", marginTop: "5px" }}
    className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none"
    onClick={handleRemoveSelectedProduct}
  >
    Remove
  </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
           
    <div>
      
    </div>
             
    <div className="flex flex-wrap justify-between items-end gap-4 mt-4">
  
  {/* Labour Charge */}
  <div className="w-full md:w-1/4">
    <label className="block text-gray-700 font-semibold mb-2">
    Manpower Cost/Labour Charge
    </label>
    <input
      type="number"
      value={labourecharge || ""}
      // onChange={(e) => setlabourecharge(Number(e.target.value))}
      onChange={(e) => setlabourecharge(Math.max(0, Number(e.target.value)))}
      className="border border-gray-300 rounded-md px-3 py-2 w-full"
    />
  </div>

  {/* Transportation Charge */}
  <div className="w-full md:w-1/4">
    <label className="block text-gray-700 font-semibold mb-2">
    Transport Charge
    </label>
    <input
      type="number"
      value={transportcharge || ""}
      // onChange={(e) => settransportcharge(Number(e.target.value))}
      onChange={(e) => settransportcharge(Math.max(0, Number(e.target.value)))}
      className="border border-gray-300 rounded-md px-3 py-2 w-full"
    />
  </div>

  {/* Discount Input */}
  <div className="w-full md:w-1/4">
    <label className="block text-gray-700 font-semibold mb-2">
      Discount (%)
    </label>
    <input
      type="number"
      value={discount || ""}
      // onChange={(e) => setDiscount(Number(e.target.value))}
      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
      placeholder="Discount in percentage"
      className="border border-gray-300 rounded-md px-3 py-2 w-full"
    />
  </div>

  {/* GST Selection */}
  <div className="w-full md:w-1/4">
    <label className="block text-gray-700 font-semibold mb-2">
      GST
    </label>
    <select
      id="GST"
      value={GST || ""}
      onChange={(e) => setGST(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-200"
    >
      <option value="">Select GST</option>
      <option value="0.18">18%</option>
    </select>
  </div>

  {/* Round Off Input */}
  <div className="w-full md:w-1/4">
    <label className="block text-gray-700 font-semibold mb-2">
      Round off
    </label>
    <input
      type="number"
      value={adjustment || ""}
      // onChange={(e) => setAdjustment(Number(e.target.value))}
      onChange={(e) => setAdjustment(Math.max(0, Number(e.target.value)))}
      className="border border-gray-300 rounded-md px-3 py-2 w-full"
    />
  </div>

  {/* Grand Total Input */}
  <div className="w-full md:w-1/4">
    <label className="block text-gray-700 font-semibold mb-2">
      Grand Total <span className="text-red-500">*</span>
    </label>
    <input
      type="number"
      value={grandTotal} // Dynamically updated value
      readOnly
      className="border border-gray-300 rounded-md px-3 py-2 w-full"
    />
  </div>

</div>


              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCreateQuotation(false)}
                  className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 rounded-lg text-sm px-5 py-2.5"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleupdateQuotations}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 focus:outline-none"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <GridComponent
        dataSource={filteredQuotations}
        allowPaging
        allowSorting
        editSettings={{ allowDeleting: true }}
        toolbar={["Search"]} // Add "Search" option here
        width="auto"
      >
        <ColumnsDirective>
          <ColumnDirective field="quoteDate" headerText="Quote Date" />
          <ColumnDirective field="quoteTime" headerText="Time" />
          <ColumnDirective field="clientName" headerText="Client Name" />
          <ColumnDirective field="GST" headerText="GST" />
          <ColumnDirective field="adjustments" headerText="Round off" />
          <ColumnDirective field="GrandTotal" headerText="GrandTotal" />
          <ColumnDirective field="status" headerText="Status" />
          {/* <ColumnDirective field="status" headerText="Quote Followup" /> */}
          <ColumnDirective
            field="status"
            headerText="Action"
            template={(data) => (
              <div className="flex gap-3">
                {data.status === "pending" ? (
                  <>
                    {" "}
                    <button
                      onClick={() => {
                        setShowAddCreateQuotation(true);
                        setEditquotation(data);
                      }}
                      style={{
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                      }}
                    >
                     Create an Order
                    </button>
                  </>
                ) : (
                  <>
                    {" "}
                    <Link to={`/QuotationFormat/${data?._id}`}>
                      <button
                        style={{
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          padding: 0,
                        }}
                      >
                        <FaEye style={{ fontSize: "20px" }} />
                      </button>{" "}
                    </Link>
                  </>
                )}

                {/* <button
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <img src={edit} width="30px" height="20px" alt="WhatsApp" />
                </button> */}
                <button
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                  onClick={() => deleteQuotation(data?._id)}
                >
                  <img
                    src={deleteicon}
                    width="30px"
                    height="20px"
                    alt="WhatsApp"
                  />
                </button>
              </div>
            )}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Selection, Edit, Sort, Filter]} />
      </GridComponent>

      {/* Add onther slots */}
      {/* Update enquiry modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Example Modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
            display: "flex", // Center alignment
            alignItems: "center", // Vertically center the modal
            justifyContent: "center", // Horizontally center the modal
            zIndex: "9999",
          },
          content: {
            width: "50%",
            height: "auto",
            maxWidth: "700px",
            maxHeight: "80vh",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <div className="flex justify-between items-start space-x-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">
            Delivery Date
            </label>
            <input
              type="date"
              value={enquiryDate}
              onChange={(e) => setEnquiryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-200"
              style={{ width: "90%" }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">
            Dismantling Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-200"
              style={{ width: "90%" }}
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Slots
          </label>
          <select
            value={selectslots}
            onChange={(e) => {
              setSelectslots(e.target.value);
            }}
            id="executiveName"
            style={{ width: "90%" }}
            className="block w-full px-3 py-2 rounded-md border focus:ring-blue-200"
          >
            <option value="">Select Slots</option>
            {/* Render options only if Executives is not empty */}
            <option value="Slot 1: 7:00 AM to 11:00 PM">
              Slot 1: 7:00 AM to 11:00 PM
            </option>
            <option value="Slot 2: 11:00 PM to 11:45 PM">
              Slot 2: 11:00 PM to 11:45 PM
            </option>
            <option value="Slot 3: 7:00 AM to 4:00 AM">
              Slot 3: 7:00 AM to 4:00 AM
            </option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 font-semibold mb-2">
            Sub Category
          </label>
          <select
            id="subcategory"
            value={selectedSubcategory}
            onChange={handleSubcategorySelection}
            className="block w-full px-3 py-2 rounded-md border focus:ring-blue-200"
          >
            <option value="">Select Sub Category</option>
            {subcategory.map((item) => (
              <option key={item._id} value={item.subcategory}>
                {item.subcategory}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Select the Products
          </label>

          <MultiSelectComponent
            id="Products"
            dataSource={filteredProducts}
            fields={{ text: "ProductName", value: "_id" }}
            placeholder="Select Products"
            mode="Box"
            value={Products.map((p) => p.productId)}
            onChange={(e) => handleProductSelection(e.value)}
            style={{ border: "4px solid #ccc" }} // Adjust color and style as needed
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
            itemTemplate={(data) => (
              <div className="flex items-center">
                <img
                  src={`https://api.rentangadi.in/product/${data?.ProductIcon}`}
                  alt={data.ProductName}
                  className="w-8 h-8 mr-2 rounded"
                />
                <span>{data.ProductName}</span>
              </div>
            )}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Products</h3>
          <div className=" p-2">
            {Products.length > 0 ? (
              <table className="min-w-full table-auto border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {/* <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                      Image
                    </th> */}
                    <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                      Product Name
                    </th>
                    <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                      Quantity
                    </th>
                    <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                      Price
                    </th>
                    <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                      Total
                    </th>
                    <th className="border px-4 py-2">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {Products.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      {/* Product Image */}
                      {/* <td className="border px-4 py-2 text-center">
                        <img
                          src={`https://api.rentangadi.in/product/${product?.ProductIcon}`}
                          className="w-10 h-10 rounded"
                          alt={product.productName}
                        />
                      </td> */}

                      {/* Product Name */}
                      <td className="border px-4 py-2 text-gray-700">
                        {product.productName || "N/A"}
                      </td>

                      {/* Quantity Input */}
                      <td className="border px-4 py-2 text-center">
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              product.productId,
                              parseInt(e.target.value)
                            )
                          }
                          className="border border-gray-300 rounded-md px-2 py-1 w-20 text-center"
                        />
                      </td>
                      <td className="border px-4 py-2 text-gray-700 text-center">
                        ₹{product.price || 0}
                      </td>
                      {/* Total */}
                      <td className="border px-4 py-2 text-gray-700 text-center">
                        ₹{product.total || 0}
                      </td>
                      <td className="border px-4 py-2 text-center">
        <button
          onClick={() => handleRemoveProduct(product.productId)} // ✅ handle delete
          className="text-red-600 hover:underline"
        >
          Remove
        </button>
        </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <></>
            )}
          </div>
        </div>
       
        <button
          onClick={() => setModalIsOpen(false)}
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
          onClick={addOntherSlots}
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
          Submit
        </button>
      </Modal>

      {/*  */}
    </div>
  );
}

export default Quotations;
