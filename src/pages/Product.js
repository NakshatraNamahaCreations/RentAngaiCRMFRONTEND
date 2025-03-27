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
import { useStateContext } from "../contexts/ContextProvider";
import Calendar from "rsuite/Calendar";
// Import styles
import "rsuite/Calendar/styles/index.css";
import { AiOutlineSearch } from "react-icons/ai";

function Product() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const gridRef = useRef(null);
  const [productData, setProductData] = useState([]);
  const [isAddProductVisible, setIsAddProductVisible] = useState(false);
  const { currentMode } = useStateContext();
  const [filteredData, setFilteredData] = useState([]); 
  // console.log(filteredData,"filteredData")
  const [searchTerm, setSearchTerm] = useState("");
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
        setFilteredData(response.data.ProductsData);
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
      <div className="flex justify-center items-center">
        <button
          type="button"
          className="text-white py-1 px-2 capitalize rounded-1xl text-md"
          onClick={() => navigateToEdit(props)}
        >
          <img src={editimage} style={{ width: "25px", height: "25px" }} />
        </button>
       
      </div>
    ) : null;
  };
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
  
    if (value === "") {
      setFilteredData(productData); // Reset to full dataset when search is cleared
    } else {
      const filtered = productData.filter(
        (item) =>
          item?.ProductName?.toLowerCase().includes(value) ||
          item?.ProductSize?.toLowerCase().includes(value) ||
          item?.Material?.toLowerCase().includes(value)
      );
      setFilteredData(filtered);
    }
  };
  

  // const handleSearch = (e) => {
  //   const value = e.target.value.toLowerCase();
  //   setSearchTerm(value);

  //   if (value === "") {
  //     setFilteredData(productData); // Reset to full dataset when search is cleared
  //   } else {
  //     const filtered = productData.filter(
  //       (item) =>
  //         item.ProductName.toLowerCase().includes(value) ||
  //         item.ProductSize.toLowerCase().includes(value) ||
  //         item.Material.toLowerCase().includes(value)
  //     );
  //     setFilteredData(filtered); // Update filteredData with search results
  //   }
  // };





  return (
    <div className="m-2 mt-6  md:mt-2 p-2 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      {!isAddProductVisible ? (
        <div>
          <Header category="Product Management" title="Products" />
          <div className="mb-3 flex justify-between items-center">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by Product Name, Size, Material..."
                className="w-72 border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-500"
              />
              <AiOutlineSearch className="absolute left-3 top-3 text-gray-500 text-lg" />
            </div>
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
          </div>
        
        

          <GridComponent
            dataSource={filteredData}
            allowPaging
            allowSorting
            toolbar={["Delete"]} // Add "Search" option here
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
              <ColumnDirective field="seater" headerText="Seater" template={(props) => props.seater || "N/A"} />
              <ColumnDirective field="Material" headerText="Material" template={(props) => props.Material || "N/A"} />
              {/* <ColumnDirective field="ProductSize" headerText="Size"  template={(props) => props.ProductSize || "N/A"} /> */}
              <ColumnDirective field="ProductDesc" headerText="Description"   template={(props) => props.ProductDesc || "N/A"}/>
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
