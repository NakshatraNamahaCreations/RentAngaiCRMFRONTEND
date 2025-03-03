import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import upload from "../assets/images/upload.png";
import { ApiURL, ImageApiURL } from "../path";
import { Header } from "../components";
import { useLocation } from "react-router-dom";

function EditProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const rowDataString = urlParams.get("rowData");
  const rowData = JSON.parse(rowDataString);
  console.log("data", rowData); // Check if data is correctly received

  const [newCategoryName, setNewCategoryName] = useState(
    rowData?.ProductCategory
  );

  const [categorydata, setCategoryData] = useState([]);
  const [ProductName, setProductName] = useState(rowData?.ProductName);
  const [subcategoryName, setSubcategoryName] = useState(
    rowData?.ProductSubcategory
  );
  const [Productdesc, setProductdesc] = useState(rowData?.ProductDesc);
  const [Productprize, setProductprize] = useState(rowData?.ProductPrice);
  const [offerPrize, setOfferPrize] = useState(rowData?.offerPrice);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [Productfeature, setProductfeature] = useState(rowData?.ProductFeature);
  const [loading, setLoading] = useState(false);
  const [qty, setqty] = useState(rowData?.qty);
  const [minqty, setminqty] = useState(rowData?.minqty);
  const [ProductStock, setProductStock] = useState(rowData?.ProductStock);
  const [p1image, setp1image] = useState(rowData?.ProductImg1);
  const [p2image, setp2image] = useState(rowData?.ProductImg2);
  const [p3image, setp3image] = useState(rowData?.ProductImg3);
  const [ProductIcon, setProductIcon] = useState(rowData?.ProductIcon);

  const [Material, setMaterial] = useState(rowData?.Material);
  const [ProductSize, setProductSize] = useState(rowData?.ProductSize);
  const [Color, setColor] = useState(rowData?.Color);
  const [seater, setseater] = useState(rowData?.seater);

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
    if (!newCategoryName) {
      toast.error("Please select category");
      return;
    }

    if (!subcategoryName) {
      toast.error("Please select subcategory");
      return;
    }
    if (!ProductName) {
      toast.error("Please enter ProductName");
      return;
    }

    if (!Productdesc) {
      toast.error("Please enter Productdesc");
      return;
    }
    if (!Productprize) {
      toast.error("Please enyter Productprize");
      return;
    }
   
    if (!ProductIcon) {
      toast.error("Please select ProductIcon");
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
      const response = await axios.put(
        `${ApiURL}/product/updateProducts/${rowData?._id}`,
        formData
      );
      if (response.status === 200) {
        window.location.assign("/product");
        toast.success("Product added successfully");
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

  return (
    <div className=" mt-6 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Product Management" title="Edit Products" />
      <Toaster />

      <div>
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-5">
          {loading ? (
            <p className="text-center text-blue-600">Loading...</p>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:gap-4 mb-2">
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
                      value={rowData?.ProductCategory}
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      {rowData?.ProductCategory}
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
                    <option value={rowData?.ProductSubcategory}>
                      {rowData?.ProductSubcategory}
                    </option>
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
                <div className="flex-1 mb-2 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="ProductSize"
                  >
                    Size
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
                    Product Price <span className="text-red">*</span>
                  </label>
                  <input
                    id="productPrice"
                    type="number"
                    value={Productprize}
                    onChange={(e) => setProductprize(e.target.value)}
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
                    onChange={(e) => setqty(e.target.value)}
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
                    onChange={(e) => setminqty(e.target.value)}
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
                      src={`${ImageApiURL}/product/${ProductIcon}`}
                      alt="Selected Image"
                      className="w-32 h-32 object-cover"
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
                        SVG, PNG, JPG or GIF (MAX. 800x400px)
                      </p>
                    </div>
                  )}

                  <input
                    id="dropzone-file"
                    type="file"
                    class="hidden"
                    onChange={(e) => setProductIcon(e.target.files[0])}
                  />
                </label>
              </div>
              <div className="flex flex-col md:flex-row md:gap-4 mb-4">
                {/* <div className="flex-1 mb-4">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="productImage1"
                  >
                    Product Image 1 <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="productImage1"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setp1image(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="productImage1"
                      className="block border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white hover:bg-gray-100 relative"
                    >
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <img
                          src={upload}
                          alt="Upload Icon"
                          className="h-6 w-6 text-gray-400"
                        />
                      </div>
                      {p1image ? (
                        <img
                          src={URL.createObjectURL(p1image)}
                          alt="Selected Image"
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <span className="text-gray-500">
                          Select Product Image 1
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex-1 mb-4">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="productImage2"
                  >
                    Product Image 2
                  </label>
                  <div className="relative">
                    <input
                      id="productImage2"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setp2image(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="productImage2"
                      className="block border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white hover:bg-gray-100 relative"
                    >
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <img
                          src={upload}
                          alt="Upload Icon"
                          className="h-6 w-6 text-gray-400"
                        />
                      </div>
                      {p2image ? (
                        <img
                          src={URL.createObjectURL(p2image)}
                          alt="Selected Image"
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <span className="text-gray-500">
                          Select Product Image 2
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex-1 mb-4">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="productImage3"
                  >
                    Product Image 3
                  </label>
                  <div className="relative">
                    <input
                      id="productImage3"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setp3image(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="productImage3"
                      className="block border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white hover:bg-gray-100 relative"
                    >
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <img
                          src={upload}
                          alt="Upload Icon"
                          className="h-6 w-6 text-gray-400"
                        />
                      </div>

                      {p3image ? (
                        <img
                          src={URL.createObjectURL(p3image)}
                          alt="Selected Image"
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <span className="text-gray-500">
                          Select Product Image 3
                        </span>
                      )}
                    </label>
                  </div>
                </div> */}

                {/* <div className="flex-1 mb-4 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="p1image"
                  >
                    Product image1 url<span className="text-red">*</span>
                  </label>
                  <input
                    id="p1image"
                    value={p1image}
                    onChange={(e) => setp1image(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                    rows="3"
                  />

                  <img
                    src={`http://localhost:8000/product/${p1image}`}
                    alt="Selected Image"
                    style={{ objectFit: "contain" }}
                    className="w-full h-32 object-cover mt-2"
                  />
                </div>
                <div className="flex-1 mb-4 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="p2image"
                  >
                    Product image2 url
                  </label>
                  <input
                    id="p2image"
                    value={p2image}
                    onChange={(e) => setp2image(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                    rows="3"
                  />
                  <img
                      src={`http://localhost:8000/product/${p2image}`}
                    alt="Selected Image"
                    style={{ objectFit: "contain" }}
                    className="w-full h-32 object-cover mt-2"
                  />
                </div>
                <div className="flex-1 mb-4 mx-8">
                  <label
                    className="block text-gray-700 font-semibold mb-2"
                    htmlFor="p3image"
                  >
                    Product image3 url
                  </label>
                  <input
                    id="p3image"
                    value={p3image}
                    onChange={(e) => setp3image(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                    rows="3"
                  />
                  <img
                     src={`http://localhost:8000/product/${p3image}`}
                    alt="Selected Image"
                    style={{ objectFit: "contain" }}
                    className="w-full h-32 object-cover mt-2"
                  />
                </div> */}
              </div>

              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Update Product
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
