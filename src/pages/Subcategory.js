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
import { ApiURL } from "../path";
import { Header } from "../components";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import upload from "../assets/images/upload.png";

function Subcategory() {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [subcatimg, setSubcatimg] = useState(null);
  const [Subcategory, setSubcategory] = useState("");
  const [categorydata, setCategorydata] = useState([]);
  const [filterdata, setFilterdata] = useState([]);
  const [editedSubcatimg, setEditedSubcatimg] = useState(null);
  const gridRef = useRef(null);

  useEffect(() => {
    getcategory();
    getSubcategory();
  }, []);

  const postSucategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName || !Subcategory || !subcatimg) {
      toast.error("Please select all fields");
      return;
    }
    const formData = new FormData();
    formData.append("category", newCategoryName);
    formData.append("subcategory", Subcategory);
    formData.append("subcatimg", subcatimg);

    try {
      const response = await axios.post(
        `${ApiURL}/subcategory/addappsubcat`,
        formData
      );
      if (response.status === 200) {
        toast.success("Successfully Added");
        getSubcategory();
        setShowAddCategory(false);
        setNewCategoryName("");
        setSubcategory("");
        setSubcatimg(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Not Added");
    }
  };

  const getcategory = async () => {
    try {
      const res = await axios.get(`${ApiURL}/category/getcategory`);
      if (res.status === 200) {
        setCategorydata(res.data.category);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getSubcategory = async () => {
    try {
      const res = await axios.get(`${ApiURL}/subcategory/getappsubcat`);
      if (res.status === 200) {
        setFilterdata(res.data.subcategory);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const deleteSubCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete?")) {
      try {
        const response = await axios.post(
          `${ApiURL}/subcategory/deleteappsubcat/${categoryId}`
        );
        if (response.status === 200) {
          toast.success("Successfully Deleted");
          getSubcategory();
        }
      } catch (error) {
        console.error(error.message);
        toast.error("Not Deleted");
      }
    }
  };

  const editSubCategory = async (data) => {
    try {
      const formData = new FormData();
      formData.append("category", data.category);
      formData.append("subcategory", data.subcategory);
      if (editedSubcatimg) {
        formData.append("subcatimg", editedSubcatimg);
      }
      const response = await axios.put(
        `${ApiURL}/subcategory/editappsubcat/${data._id}`,
        formData
      );
      if (response.status === 200) {
        toast.success("Successfully Updated");
        getSubcategory();
      } else {
        toast.error("Failed to update subcategory");
      }
    } catch (error) {
      console.error("There was an error updating the subcategory!", error);
    }
  };

  const imageTemplate = (props) => (
    <div>
      <img
        src={`https://api.rentangadi.in/subcategory/${props.subcatimg}`}
        alt="Subcategory"
        style={{ width: "100px", height: "100px" }}
      />
    </div>
  );

  const imageEditTemplate = (args) => (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        setEditedSubcatimg(file);
        args.rowData.subcatimg = URL.createObjectURL(file);
      }}
    />
  );

  const toolbarClick = async (args) => {
    const itemName = args.item.id;
    if (itemName.includes("delete")) {
      const selectedRecords = gridRef.current.getSelectedRecords();
      if (selectedRecords.length) {
        const deletePromises = selectedRecords.map((record) =>
          deleteSubCategory(record._id)
        );
        await Promise.all(deletePromises);
        gridRef.current.clearSelection();
      } else {
        toast.error("Please select at least one record to delete.");
      }
    }
  };

  // const actionBegin = (args) => {
  //   console.log("args---", args);
  //   if (
  //     args.requestType === "save" &&
  //     args.type === "keydown" &&
  //     args.e.key === "Enter"
  //   ) {
  //     if (!args.data.subcategory) {
  //       toast.error("Subcategory name is required.");
  //       args.cancel = true;
  //       return;
  //     }
  //     args.cancel = true;
  //     editSubCategory(args.data);
  //   }
  // };

  const actionBegin = async (args) => {
    console.log("args----", args);
    if (args.requestType === "save") {
      await editSubCategory(args.data);
    }
  };

  return (
    <div className="m-2 mt-6 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />

      {/* <Header category="Product Management" title="Sub-Category" /> */}
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => setShowAddCategory(true)}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Add Sub-Category
          </span>
        </button>
      </div>

      {showAddCategory && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg"  style={{width:"35rem"}}>
            <h2 className="text-lg font-semibold mb-4">Add Sub-Category</h2>
            <select
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 mb-4 w-full"
            >
              <option value="">Select Category</option>
              {categorydata.map((category) => (
                <option key={category._id} value={category.category}>
                  {category.category}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={Subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="Enter subcategory name"
              className="border border-gray-300 rounded-md px-3 py-2 mb-4 w-full"
            />
            <label className="block mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setSubcatimg(file);
                }}
                className="hidden w-full"
              />
              <div className="relative border border-gray-300 rounded-md px-3 py-2 w-full cursor-pointer bg-white hover:bg-gray-100">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <img
                    src={upload}
                    alt="Upload Icon"
                    className="h-6 w-6 text-gray-400 bg-opacity-50 z-50"
                  />
                </span>
                {subcatimg ? (
                  <img
                    src={URL.createObjectURL(subcatimg)}
                    alt="Selected Image"
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <span className="text-gray-500">Select an icon</span>
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
                onClick={postSucategory}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <GridComponent
        dataSource={filterdata}
        allowPaging
        allowSorting
        toolbar={["Edit", "Delete", "Search"]}
        toolbarClick={toolbarClick}
        actionBegin={actionBegin}
        editSettings={{ allowDeleting: true, allowEditing: true }}
        width="auto"
        ref={gridRef}
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective field="_id" headerText="ID" isPrimaryKey />
          <ColumnDirective field="category" headerText="Category Name" />
          <ColumnDirective field="subcategory" headerText="Subcategory" />
          <ColumnDirective
            field="subcatimg"
            headerText="Subcategory Image"
            template={imageTemplate}
            editTemplate={imageEditTemplate}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Selection, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
}

export default Subcategory;
