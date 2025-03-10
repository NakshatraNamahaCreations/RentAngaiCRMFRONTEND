import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import upload from "../assets/images/upload.png";
import { ApiURL } from "../path";
import { Header } from "../components";
import * as XLSX from 'xlsx';

function AddProduct() {
  const [newCategoryName, setNewCategoryName] = useState("");

  const [categorydata, setCategoryData] = useState([]);
  const [ProductName, setProductName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [Productdesc, setProductdesc] = useState("");
  const [Productprize, setProductprize] = useState("");
  const [offerPrize, setOfferPrize] = useState("");
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [Productfeature, setProductfeature] = useState("");
  const [loading, setLoading] = useState(false);
  const [qty, setqty] = useState("");
  const [minqty, setminqty] = useState("");
  const [ProductStock, setProductStock] = useState("");
  const [p1image, setp1image] = useState("");
  const [p2image, setp2image] = useState("");
  const [p3image, setp3image] = useState("");
  const [ProductIcon, setProductIcon] = useState("");

  const [Material, setMaterial] = useState("");
  const [ProductSize, setProductSize] = useState("");
  const [Color, setColor] = useState("");
  const [seater, setseater] = useState("");

  useEffect(() => {
    getCategory();
  }, []);

  const getCategory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ApiURL}/category/getcategory`);
      if (res.status === 200) {
        setCategoryData(res.data?.category);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error.message || error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newCategoryName) {
      fetchSubcategoriesByCategoryName();
    }
  }, [newCategoryName]);

  const fetchSubcategoriesByCategoryName = async () => {
    try {
      const response = await axios.post(`${ApiURL}/subcategory/postappsubcat`, {
        category: newCategoryName,
      });

      if (response.status === 200 && response.data.subcategories) {
        setSubcategoryData(response.data.subcategories);
      } else {
        setSubcategoryData([]);
        console.warn("No subcategories found for the specified category.");
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error.message || error);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!newCategoryName) {
      toast.error("Please select a category");
      return;
    }
    if (!subcategoryName) {
      toast.error("Please select a subcategory");
      return;
    }
    if (!ProductName) {
      toast.error("Please enter a product name");
      return;
    }
    if (!Productdesc) {
      toast.error("Please enter a product description");
      return;
    }
    if (!Productprize) {
      toast.error("Please enter a product price");
      return;
    }
    if (!ProductIcon) {
      toast.error("Please upload a product icon");
      return;
    }

    const formData = new FormData();
    formData.append("ProductCategory", newCategoryName);
    formData.append("ProductSubcategory", subcategoryName);
    formData.append("ProductName", ProductName);
    formData.append("ProductDesc", Productdesc);
    formData.append("ProductPrice", Productprize);
    formData.append("offerPrice", offerPrize);
    formData.append("ProductFeature", Productfeature);
    formData.append("ProductIcon", ProductIcon);
    formData.append("ProductImg1", p1image);
    formData.append("ProductImg2", p2image);
    formData.append("ProductImg3", p3image);
    formData.append("qty", qty);
    formData.append("minqty", minqty);
    formData.append("ProductStock", ProductStock);
    formData.append("Material", Material);
    formData.append("ProductSize", ProductSize);
    formData.append("Color", Color);
    formData.append("seater", seater);

    try {
      setLoading(true);
      const response = await axios.post(
        `${ApiURL}/product/addProducts`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        toast.success("Product added successfully");
        window.location.assign("/product");
      } else {
        toast.error("Failed to add product");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error adding product:", error.message || error);
      toast.error("An error occurred while adding the product");
      setLoading(false);
    }
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 496 || img.height !== 530) {
          toast.error("Please upload an image with dimensions 496x530 px.");
        } else {
          setProductIcon(file); 
        }
      };
    }
  };

  const[file,setFile] = useState(null);

  const downloadExcel = () => {
    const productSchemaKeys = {
      ProductName: "",
      ProductDesc: "",
      ProductCategory: "",
      ProductSubcategory: "",
      ProductStock: "",
      ProductPrice: "",
      seater: "",
      Material: "",
      ProductSize: "",
      Color: "",
      qty: "",
      minqty: "",
    };
    const worksheet = XLSX.utils.json_to_sheet([productSchemaKeys]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Template");
    XLSX.writeFile(workbook, "product-template.xlsx");
  };

  const uploadFile = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };
  const addExcel = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log("Raw Excel Data:", jsonData);

        // Map the data to include only required fields
        const mappedData = jsonData.map((item) => ({
          ProductName: item["ProductName"],
          ProductDesc: item["ProductDesc"],
          ProductCategory: item["ProductCategory"],
          ProductSubcategory: item["ProductSubcategory"],
          ProductStock: item["ProductStock"],
          ProductPrice: item["ProductPrice"],
          seater: item["seater"],
          Material: item["Material"],
          ProductSize: item["ProductSize"],
          Color: item["Color"],
          qty: item["qty"],
          minqty: item["minqty"],
          material_type: item["material_type"],
        }));

        console.log("Mapped Data:", mappedData);

        // Send data to backend
        const response = await axios.post(
         `${ApiURL}/product/bulkuploadproduct`,
          mappedData
        );

        if (response.status === 200) {
          alert("Products Added Successfully!");
          window.location.reload();
        }
      } catch (error) {
        console.error("Error sending data to backend:", error);
        alert("Failed to add products. Please try again.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="mt-6 md:m-5 md:mt-2 p-2 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Product Management" title="Add Products" />
      <Toaster />

      <div>
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-5">
          {loading ? (
            <p className="text-center text-blue-600">Loading...</p>
          ) : (
            <>
              <div
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {/* Button to download Excel */}
                <button
                  onClick={downloadExcel}
                  style={{
                    marginRight: "10px",
                    padding: "8px 12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Download Excel
                </button>

                {/* Hidden input for file upload */}
                <input
                  type="file"
                  placeholder="Upload file"
                  onChange={uploadFile}
                />

                {/* Button to trigger file upload and add Excel */}
                <button
                  onClick={addExcel}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Add Excel
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:gap-4 mb-2">
                <div className="flex-1 mb-2 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="productName"
                  >
                    Product Name <span className="text-red">*</span>
                  </label>
                  <input
                    id="productName"
                    type="text"
                    value={ProductName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div className="flex-1 mb-4 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="category"
                  >
                    Category <span className="text-red">*</span>
                  </label>
                  <select
                    id="category"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  >
                    <option
                      value=""
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Select Category
                    </option>
                    {categorydata.map((category) => (
                      <option
                        key={category._id}
                        value={category.category}
                        className="block text-gray-700 font-semibold "
                      >
                        {category.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 mb-4 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="subcategory"
                  >
                    Subcategory <span className="text-red">*</span>
                  </label>
                  <select
                    id="subcategory"
                    value={subcategoryName}
                    onChange={(e) => setSubcategoryName(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  >
                    <option value="">Select Subcategory</option>
                    {subcategoryData.map((subcategory) => (
                      <option
                        key={subcategory._id}
                        value={subcategory.subcategory}
                      >
                        {subcategory.subcategory}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:gap-4 mb-2">
                <div className="flex-1 mb-2 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="ProductStock"
                  >
                    Available Stock <span className="text-red">*</span>
                  </label>
                  <input
                    id="ProductStock"
                    type="text"
                    value={ProductStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div className="flex-1 mb-4 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="productPrice"
                  >
                    Pricing <span className="text-red">*</span>
                  </label>
                  <input
                    id="productPrice"
                    type="number"
                    value={Productprize}
                    onChange={(e) =>
                      setProductprize(Math.max(0, e.target.value))
                    }
                    // onChange={(e) => setProductprize(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>

                <div className="flex-1 mb-2 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="ProductSize"
                  >
                    Size and Weight(optional)
                  </label>
                  <input
                    id="ProductSize"
                    type="text"
                    value={ProductSize}
                    onChange={(e) => setProductSize(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:gap-4 mb-2">
                <div className="flex-1 mb-2 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="Color"
                  >
                    Color
                  </label>
                  <input
                    id="Color"
                    type="text"
                    value={Color}
                    onChange={(e) => setColor(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div className="flex-1 mb-2 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="Material"
                  >
                    Material
                  </label>
                  <input
                    id="Material"
                    type="text"
                    value={Material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>

                {/* <div className="flex-1 mb-4 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="offerPrice"
                  >
                    Offer Price <span className="text-red">*</span>
                  </label>
                  <input
                    id="offerPrice"
                    type="number"
                    value={offerPrize}
                    onChange={(e) => setOfferPrize(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div> */}
              </div>
              <div className="flex flex-col md:flex-row md:gap-4 mb-2">
                <div className="flex-1 mb-2 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="qty"
                  >
                    Quantity <span className="text-red">*</span>
                  </label>
                  <input
                    id="qty"
                    type="number"
                    value={qty}
                    onChange={(e) => setqty(Math.max(0, e.target.value))}
                    // onChange={(e) => setqty(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>

                <div className="flex-1 mb-2 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="minqty"
                  >
                    Min Quantity
                  </label>
                  <input
                    id="minqty"
                    type="number"
                    value={minqty}
                    onChange={(e) => setminqty(Math.max(0, e.target.value))}
                    // onChange={(e) => setminqty(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>

                <div className="flex-1 mb-2 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="seater"
                  >
                    Seater
                  </label>
                  <input
                    id="seater"
                    type="text"
                    value={seater}
                    onChange={(e) => setseater(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:gap-4 mb-2">
                {/* <div className="flex-1 mb-4 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="productFeatures"
                  >
                    Product Features
                  </label>
                  <textarea
                    id="productFeatures"
                    value={Productfeature}
                    onChange={(e) => setProductfeature(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                    rows="3"
                  />
                </div> */}

                <div className="flex-1 mb-4 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="productDesc"
                  >
                    Product Description <span className="text-red">*</span>
                  </label>
                  <textarea
                    id="productDesc"
                    value={Productdesc}
                    onChange={(e) => setProductdesc(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                    rows="3"
                  />
                </div>
              </div>
              <div class="flex items-center justify-center w-full">
                <label
                  for="dropzone-file"
                  class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  {ProductIcon ? (
                    <img
                      src={URL.createObjectURL(ProductIcon)}
                      alt="Selected Image"
                      className="w-32 h-32 object-cover"
                      style={{ width: "300px" }}
                    />
                  ) : (
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span class="font-semibold">
                          Click to upload product icon{" "}
                          <span className="text-red">*</span>
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        SVG, PNG, JPG or GIF
                      </p>
                    </div>
                  )}

                  <input
                    id="dropzone-file"
                    type="file"
                    class="hidden"
                    onChange={(e) => setProductIcon(e.target.files[0])}
                    // onChange={handleImageChange}
                  />
                </label>
              </div>
              {/* <div className="flex flex-col md:flex-row md:gap-4 mb-4">
  <div className="flex-1 mb-4 mx-8">
    <label
      className="block text-gray-700 font-semibold mb-2"
      htmlFor="p1image"
    >
      Product Image 1 <span className="text-red">*</span>
    </label>
    <input
      id="p1image"
      type="file"
      accept="image/*"
      onChange={(e) => setp1image(e.target.files[0])}
      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
    />
    {p1image && (
      <div className="mt-2">
        <img
          src={URL.createObjectURL(p1image)}
          alt="Product Image 1 Preview"
          className="w-32 h-32 object-cover"
        />
      </div>
    )}
  </div>

  <div className="flex-1 mb-4 mx-8">
    <label
      className="block text-gray-700 font-semibold mb-2"
      htmlFor="p2image"
    >
      Product Image 2
    </label>
    <input
      id="p2image"
      type="file"
      accept="image/*"
      onChange={(e) => setp2image(e.target.files[0])}
      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
    />
    {p2image && (
      <div className="mt-2">
        <img
          src={URL.createObjectURL(p2image)}
          alt="Product Image 2 Preview"
          className="w-32 h-32 object-cover"
        />
      </div>
    )}
  </div>

  <div className="flex-1 mb-4 mx-8">
    <label
      className="block text-gray-700 font-semibold mb-2"
      htmlFor="p3image"
    >
      Product Image 3
    </label>
    <input
      id="p3image"
      type="file"
      accept="image/*"
      onChange={(e) => setp3image(e.target.files[0])}
      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
    />
    {p3image && (
      <div className="mt-2">
        <img
          src={URL.createObjectURL(p3image)}
          alt="Product Image 3 Preview"
          className="w-32 h-32 object-cover"
        />
      </div>
    )}
  </div>
</div> */}

              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Add Product
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
