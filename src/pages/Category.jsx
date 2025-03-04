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
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import upload from "../assets/images/upload.png";
import { ApiURL } from "../path";
import { Header } from "../components";
import { AiOutlineSearch } from "react-icons/ai";

function Category() {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [CategoryImgUrl, setCategoryImgUrl] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const gridRef = useRef(null);
  const [editedCategoryImg, setEditedCategoryImg] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${ApiURL}/category/getcategory`);
      if (res.status === 200) {
        setCategoryData(res.data.category);
        setFilterData(res.data.category);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const postCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName || !CategoryImgUrl) {
      alert("Please fill out all fields");
    } else {
      const formData = new FormData();
      formData.append("category", newCategoryName);
      formData.append("categoryImg", CategoryImgUrl);
      try {
        const config = {
          url: "/category/addcategory",
          method: "post",
          baseURL: ApiURL,
          data: formData,
        };
        const response = await axios(config);
        if (response.status === 200) {
          setNewCategoryName("");
          setCategoryImgUrl(null);
          toast.success("Successfully Added");
          setShowAddCategory(false);
          fetchCategories(); // Refresh data after adding
        }
      } catch (error) {
        console.error(error);
        alert("Category Not Added");
      }
    }
  };

  const deleteCategory = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        const response = await axios.post(
          `${ApiURL}/category/deletecategory/${id}`
        );
        if (response.status === 200) {
          toast.success("Successfully Deleted");
          fetchCategories(); // Refresh data after deletion
        }
      } catch (error) {
        toast.error("Category Not Deleted");
        console.error("Error deleting the category:", error);
      }
    }
  };

  const editCategory = async (data) => {
    try {
      const { _id, category } = data;
      const formData = new FormData();
      formData.append("category", category);
      if (editedCategoryImg) {
        formData.append("categoryImg", editedCategoryImg);
      }

      const response = await axios.put(
        `${ApiURL}/category/editcategory/${_id}`,
        formData
      );
      if (response.status === 200) {
        toast.success("Successfully Updated");
        fetchCategories(); // Refresh data after update
      } else {
        alert("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating the category:", error);
    }
  };

  const imageTemplate = (props) => {
    return (
      <div>
        <img
          src={`https://api.rentangadi.in/category/${props.categoryImg}`}
          alt="Category"
          style={{ width: "100px", height: "100px" }}
        />
      </div>
    );
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value === "") {
      setFilterData(categoryData);
    } else {
      const filtered = categoryData.filter((item) =>
        item.category.toLowerCase().includes(value)
      );
      setFilterData(filtered);
    }
  };

  const imageEditTemplate = (args) => {
    return (
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          setEditedCategoryImg(file);
          args.rowData.categoryImg = URL.createObjectURL(file);
        }}
      />
    );
  };

  const toolbarClick = async (args) => {
    const itemName = args.item.id;
    if (itemName.includes("delete")) {
      // Handle delete action
      const selectedRecords = gridRef.current.getSelectedRecords();
      if (selectedRecords.length) {
        const deletePromises = selectedRecords.map((record) =>
          deleteCategory(record._id)
        );
        await Promise.all(deletePromises);
        gridRef.current.clearSelection();
        toast.success("Selected records deleted successfully.");
      } else {
        alert("Please select at least one record to delete.");
      }
    }
  };

  const actionBegin = async (args) => {
    if (args.requestType === "save") {
      await editCategory(args.data);
    }
  };

  const handleImageUpload = (event, isEditing = false) => {
    const file = event.target.files[0];

    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        // Set required dimensions (change if needed)
        const requiredWidth = 100;
        const requiredHeight = 100;

        if (img.width !== requiredWidth || img.height !== requiredHeight) {
          alert(
            `Please upload an image with dimensions ${requiredWidth}x${requiredHeight}px`
          );
          return;
        }

        if (isEditing) {
          setEditedCategoryImg(file);
        } else {
          setCategoryImgUrl(file);
        }
      };
    }
  };

  return (
    <div className="md:mt-2 p-2 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      <div className="mb-3 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search categories..."
            className="w-72 border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-500"
          />
          <AiOutlineSearch className="absolute left-3 top-3 text-gray-500 text-lg" />
        </div>
      <div className="mb-3 flex justify-end">

        <button
          onClick={() => setShowAddCategory(true)}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Add Category
          </span>
        </button>
      </div>
      </div>

      {/* Side Canvas for adding category */}
      {showAddCategory && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg" style={{width:"35rem"}}>
            <h2 className="text-lg font-semibold mb-4">Add Category</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="border border-gray-300 rounded-md px-3 py-2 mb-4"
              style={{width:"32rem"}}
            />
            <label className="block mb-4">
              <input
                type="file"
                accept="image/*"
                // onChange={(e) => {
                //   const file = e.target.files[0];
                //   setCategoryImgUrl(file);
                // }}
                onChange={handleImageUpload}
                className="hidden  w-full"
              />
             <div className="relative border border-gray-300 rounded-md px-3 py-2 w-full cursor-pointer bg-white hover:bg-gray-100">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <img src={upload} alt="Upload Icon" className="h-6 w-6 text-gray-400" />
                </span>
                {CategoryImgUrl ? (
                  <img
                    src={URL.createObjectURL(CategoryImgUrl)}
                    alt="Selected Image"
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <span className="text-gray-500">Select an image (100x100px)</span>
                )}
              </div>
            </label>

            <div className="flex justify-between">
              <button
                onClick={() => setShowAddCategory(false)}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                Close
              </button>
              <button
                onClick={postCategory}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Component */}
      <GridComponent
        dataSource={filterData}
        allowPaging
        allowSorting
        toolbar={["Edit", "Delete"]}
        toolbarClick={toolbarClick}
        actionBegin={actionBegin}
        editSettings={{ allowDeleting: true, allowEditing: true }}
        width="auto"
        ref={gridRef}
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective field="_id" headerText="ID" isPrimaryKey={true} />
          <ColumnDirective field="category" headerText="Category Name" />
          <ColumnDirective
            field="categoryImg"
            headerText="Category Image"
            template={imageTemplate}
            editTemplate={imageEditTemplate} 
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Selection, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
}

export default Category;
