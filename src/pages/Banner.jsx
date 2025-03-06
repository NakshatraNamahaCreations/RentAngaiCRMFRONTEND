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

function Banner() {
  const [showAddbanner, setShowAddbanner] = useState(false);
  const [newbannerName, setNewbannerName] = useState("");
  const [bannerImgUrl, setbannerImgUrl] = useState(null);
  const [bannerData, setbannerData] = useState([]);
  const [allBanners, setAllBanners] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const gridRef = useRef(null);
  const [editedBannerImg, setEditedBannerImg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchbanner();
  }, []);

  const fetchbanner = async () => {
    try {
      const res = await axios.get(`${ApiURL}/banner/getallbanner`);
      if (res.status === 200) {
        setbannerData(res.data.banner);
        setFilterData(res.data.banner);
        setAllBanners(res.data.banner);
      }
    } catch (error) {
      console.error("Error fetching banner:", error);
      toast.error("Failed to fetch banner");
    }
  };

  const postbanner = async (e) => {
    e.preventDefault();
    if (!bannerImgUrl) {
      alert("Please fill out all fields");
    } else {
      const formData = new FormData();

      formData.append("banner", bannerImgUrl);
      try {
        const config = {
          url: "/banner/addbanner",
          method: "post",
          baseURL: ApiURL,
          data: formData,
        };
        const response = await axios(config);
        if (response.status === 200) {
          setNewbannerName("");
          setbannerImgUrl(null);
          toast.success("Successfully Added");
          setShowAddbanner(false);
          fetchbanner(); // Refresh data after adding
        }
      } catch (error) {
        console.error(error);
        alert("banner Not Added");
      }
    }
  };

  const deletebanner = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        const response = await axios.post(
          `${ApiURL}/banner/deletebanner/${id}`
        );
        if (response.status === 200) {
          toast.success("Successfully Deleted");
          fetchbanner(); // Refresh data after deletion
        }
      } catch (error) {
        toast.error("banner Not Deleted");
        console.error("Error deleting the banner:", error);
      }
    }
  };

  const editbanner = async (data) => {
    try {
      const { _id } = data;
      const formData = new FormData();

      if (editedBannerImg) {
        formData.append("banner", editedBannerImg);
      }

      const response = await axios.put(
        `${ApiURL}/banner/editbanner/${_id}`,
        formData
      );
      if (response.status === 200) {
        toast.success("Successfully Updated");
        fetchbanner(); // Refresh data after update
      } else {
        alert("Failed to update banner");
      }
    } catch (error) {
      console.error("Error updating the banner:", error);
    }
  };

  const imageTemplate = (props) => {
    return (
      <div>
        <img
          src={`http://localhost:8000/userbanner/${props.banner}`}
          alt="banner"
          style={{ width: "250px", height: "100px" }}
        />
      </div>
    );
  };

  const imageEditTemplate = (args) => (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => handleImageValidation(e.target.files[0], setEditedBannerImg)}
    />
  );

  const toolbarClick = async (args) => {
    const itemName = args.item.id;
    if (itemName.includes("delete")) {
      // Handle delete action
      const selectedRecords = gridRef.current.getSelectedRecords();
      if (selectedRecords.length) {
        const deletePromises = selectedRecords.map((record) =>
          deletebanner(record._id)
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
      await editbanner(args.data);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setFilterData(allBanners); 
    } else {
      const filtered = allBanners.filter((item) =>
        item._id.toLowerCase().includes(value) 
      );
      setFilterData(filtered);
    }
  };

  const handleImageUpload = (event, isEditing = false) => {
    const file = event.target.files[0];

    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const requiredWidth = 1250;
        const requiredHeight = 625;

        if (img.width !== requiredWidth || img.height !== requiredHeight) {
          alert(`Please upload an image with dimensions ${requiredWidth}x${requiredHeight}px`);
          return;
        }

        if (isEditing) {
          setEditedbannerImg(file);
        } else {
          setbannerImgUrl(file);
        }
      };
    }
  };

  return (
    <div className="m-2 mt-6 md:mt-2 p-2 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      <div className="mb-3 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search banners..."
            className="w-72 border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-500"
          />
          <AiOutlineSearch className="absolute left-3 top-3 text-gray-500 text-lg" />
        </div>
        <div className="mb-3 flex justify-end">
          <button
            onClick={() => setShowAddbanner(true)}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Add Banner
            </span>
          </button>
        </div>
      </div>

      {/* Header */}
      <Header banner="App Management" title="Banner" />

      {/* Side Canvas for adding banner */}
      {showAddbanner && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Add Banner</h2>
            <label className="block mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden w-full"
              />
              <div className="relative border border-gray-300 rounded-md px-3 py-2 w-full cursor-pointer bg-white hover:bg-gray-100">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <img src={upload} alt="Upload Icon" className="h-6 w-6 text-gray-400" />
                </span>
                {bannerImgUrl ? (
                  <img
                    src={URL.createObjectURL(bannerImgUrl)}
                    alt="Selected Image"
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <span className="text-gray-500">Select an image (1250x625px)</span>
                )}
              </div>
            </label>

            <div className="flex justify-between">
              <button
                onClick={() => setShowAddbanner(false)}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                Close
              </button>
              <button
                onClick={postbanner}
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

          <ColumnDirective
            field="bannerImg"
            headerText="Banner Image"
            template={imageTemplate}
            editTemplate={imageEditTemplate} // Adding the custom edit template
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Selection, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
}

export default Banner;