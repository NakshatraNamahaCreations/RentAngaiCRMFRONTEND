import React, { useState, useEffect } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Search,
  Inject,
  Toolbar,
  Edit,
  Sort,
} from "@syncfusion/ej2-react-grids";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { ApiURL } from "../path";
import { Header } from "../components";
import moment from "moment/moment";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { AiOutlineSearch } from "react-icons/ai";

// Clients Component
const Clients = () => {
  const navigate = useNavigate();
  const [showAddClients, setShowAddClients] = useState(false);
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [PhoneNumber, setPhoneNumber] = useState("");
  const [AlternateNumber, setAlternateNumber] = useState("");
  const [Password, setPassword] = useState("");
  const [Address, setAddress] = useState("");
  const [executives, setExecutives] = useState([{ name: "", phoneNumber: "" }]);
  const [ClientData, setClientData] = useState([]);

  console.log(ClientData, "clientdata");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle "View" button click
  const handleViewClick = (client) => {
    setSelectedClient(client);
    setModalIsOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedClient(null);
  };

  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

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

  useEffect(() => {
    fetchClient();
  }, []);

  const fetchClient = async () => {
    try {
      const res = await axios.get(`${ApiURL}/client/getallClients`);
      if (res.status === 200) {
        setClientData(res.data.Client);
        setFilteredData(res.data.Client);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to fetch clients");
    }
  };
  // const fetchClient = async () => {
  //   try {
  //     const res = await axios.get(`${ApiURL}/client/getallClients`);
  //     if (res.status === 200) {
  //       // Ensure executives array exists for all clients
  //       const validatedData = res.data.Client.map(client => ({
  //         ...client,
  //         executives: client.executives || [] // Default to empty array if missing
  //       }));
  //       setClientData(validatedData);
  //       setFilteredData(validatedData);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching clients:", error);
  //     toast.error("Failed to fetch clients");
  //   }
  // };

  // Handle executive input changes
  const handleExecutiveChange = (index, field, value) => {
    const updatedExecutives = [...executives];
    updatedExecutives[index][field] = value;
    setExecutives(updatedExecutives);
  };

  // Add a new executive row
  const addExecutive = () => {
    setExecutives([...executives, { name: "", phoneNumber: "" }]);
  };
  // Remove an executive row
  const removeExecutive = (index) => {
    const updatedExecutives = executives.filter((_, i) => i !== index);
    setExecutives(updatedExecutives);
  };
  const postClients = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!Name || !PhoneNumber || !Address) {
      toast.error("Please fill all required fields");
      return;
    }

    const data = {
      clientName: Name,
      email: Email,
      phoneNumber: PhoneNumber,
      alternateNumber: AlternateNumber,
      password: Password,
      address: Address,
      executives,
    };

    try {
      const response = await axios.post(`${ApiURL}/client/addClients`, data);
      if (response.status === 200) {
        toast.success("Client added successfully");
        setShowAddClients(false); // Close modal or form
        fetchClient(); // Refresh client list
      }
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Failed to add client");
    }
  };
  // const postClients = async (e) => {
  //   e.preventDefault();
  //   if (!Name || !Email || !PhoneNumber || !Address) {
  //     toast.error("Please fill all required fields");
  //     return;
  //   }

  //   const data = {
  //     clientName: Name,
  //     email: Email,
  //     phoneNumber: PhoneNumber,
  //     alternateNumber: AlternateNumber,
  //     password: Password,
  //     address: Address,
  //   };

  //   try {
  //     const response = await axios.post(`${ApiURL}/client/addClients`, data);
  //     if (response.status === 200) {
  //       toast.success("Client added successfully");
  //       setShowAddClients(false);
  //       fetchClient();
  //     }
  //   } catch (error) {
  //     console.error("Error adding client:", error);
  //     toast.error("Failed to add client");
  //   }
  // };

  const deleteClient = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `${ApiURL}/client/deleteClients/${id}`
        );
        if (response.status === 200) {
          toast.success("Client deleted successfully");
          fetchClient();
        }
      } catch (error) {
        console.error("Error deleting client:", error);
        toast.error("Failed to delete client");
      }
    }
  };

  const editClient = async (data) => {
    const {
      _id,
      clientName,
      email,
      phoneNumber,
      alternateNumber,
      password,
      address,
    } = data;

    try {
      const response = await axios.put(`${ApiURL}/client/editclient/${_id}`, {
        clientName,
        email,
        phoneNumber,
        alternateNumber,
        password,
        address,
      });
      if (response.status === 200) {
        toast.success("Client updated successfully");
        fetchClient(); // Refresh data after update
      } else {
        toast.error("Failed to update client");
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Error updating client");
    }
  };

  const actionBegin = async (args) => {
    if (args.requestType === "save") {
      const { data } = args;
      await editClient(data);
    }
    if (args.requestType === "delete") {
      const { data } = args;

      if (Array.isArray(data)) {
        for (const client of data) {
          await deleteClient(client._id);
        }
      } else {
        await deleteClient(data._id);
      }
    }
  };

  const matchingOrders = orderData.filter((order) =>
    ClientData.some((client) => client?._id === order.ClientId)
  );

  // console.log("Matching Orders:", matchingOrders);

  const handleViewOrders = (_id) => {
    const matchingOrders = orderData.filter((order) => order.ClientId === _id);

    // console.log("Matching Orders:", matchingOrders);

    // Navigate to the target page with state
    navigate("/clients/details", { state: { matchingOrders } });
  };
  const navigateToDetails = (_id) => {
    // Navigate to the next page and pass the `_id` in state
    navigate("/clients/details", { state: { id: _id } });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setFilteredData(ClientData); // ✅ Reset when search is cleared
    } else {
      const filtered = ClientData.filter(
        (client) =>
          client.clientName.toLowerCase().includes(value) ||
          client.email.toLowerCase().includes(value) ||
          client.phoneNumber.toLowerCase().includes(value) ||
          client.address.toLowerCase().includes(value)
      );
      setFilteredData(filtered);
    }
  };

  return (
    <div className="m-2 mt-6 md:mt-2 p-2  bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      <Header  title="Clients" />
      <div className="mb-3 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by Name, Email, Phone, Address..."
            className="w-72 border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-500"
          />
          <AiOutlineSearch className="absolute left-3 top-3 text-gray-500 text-lg" />
        </div>
        <div className="mb-3 flex justify-end">
          <button
            onClick={() => setShowAddClients(true)}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Add Clients
            </span>
          </button>
        </div>
      </div>

      {showAddClients && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Clients</h2>
              <button
                onClick={() => setShowAddClients(false)}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg p-2"
              >
                &#x2715;
              </button>
            </div>
            <form onSubmit={postClients} className="space-y-4">
              {/* Client Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Executives */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Executives <span className="text-red-500">*</span>
                </label>
                {executives.map((exec, index) => (
                  <div key={index} className="flex gap-4 items-center mb-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={exec.name}
                      onChange={(e) =>
                        handleExecutiveChange(index, "name", e.target.value)
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={exec.phoneNumber}
                      onChange={(e) =>
                        handleExecutiveChange(
                          index,
                          "phoneNumber",
                          e.target.value
                        )
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {executives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExecutive(index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExecutive}
                  className="text-blue-500 mt-2"
                >
                  Add Executive
                </button>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Contact Person Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={PhoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={Address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddClients(false)}
                  className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 rounded-lg text-sm px-5 py-2.5"
                >
                  Close
                </button>
                <button
                  type="submit"
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
        dataSource={filteredData}
        allowPaging
        allowSorting
        editSettings={{ allowEditing: true, allowDeleting: true }}
        toolbar={["Delete"]}
        width="auto"
        actionBegin={actionBegin}
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />

          <ColumnDirective
            field="clientName"
            headerText="Company Name"
            isPrimaryKey={true}
            width="150"
          />
          <ColumnDirective
            field="phoneNumber"
            headerText="Phone Number"
            width="150"
          />
          {/* <ColumnDirective
            headerText="Executives"
            width="200"
            template={(props) => {
              console.log("Executives Props:", props); 
              const execs = Array.isArray(props?.executives)
                ? props.executives
                : []; // Ensure it's an array

              return (
                <div>
                  {execs.length > 0
                    ? execs.map((exec) => exec?.name || "N/A").join(", ")
                    : "-"}
                </div>
              );
            }}
          /> */}
          {/* <ColumnDirective
            headerText="Executives"
            width="200"
            template={(props) => {
              // Ensure `executives` is an array before mapping
              const execs =
                props.executives && Array.isArray(props.executives)
                  ? props.executives
                  : [];

              return (
                <div>
                  {execs.length > 0
                    ? execs.map((exec) => exec?.name || "N/A").join(", ")
                    : "No Executives"}
                </div>
              );
            }}
          /> */}

          <ColumnDirective field="address" headerText="Address" width="200" />
          <ColumnDirective
            field="address"
            headerText="Action"
            width="100"
            template={(props) => (
              <div className="flex items-center justify-center gap-2">
                {/* Edit Icon */}{" "}
                {/* <button
                  onClick={() => navigateToDetails(props._id)}
                  type="button"
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit"
                  // onClick={() => handleEdit(props)}
                >
                  <FaEye style={{ fontSize: "20px" }} />
                </button> */}
                <button
                  onClick={() => handleViewClick(props)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-transform transform hover:scale-105"
                >
                  View Details
                </button>
              </div>
            )}
          />
        </ColumnsDirective>
        <Inject services={[Page, Search, Toolbar, Edit, Sort]} />
      </GridComponent>
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
        {selectedClient && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
              Client Details
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <strong className="text-gray-600">Company Name:</strong>
                <span className="text-gray-800">
                  {selectedClient.clientName}
                </span>
              </div>
              <div className="flex justify-between">
                <strong className="text-gray-600">Phone Number:</strong>
                <span className="text-gray-800">
                  {selectedClient.phoneNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <strong className="text-gray-600">Email:</strong>
                <span className="text-gray-800">{selectedClient.email}</span>
              </div>
              <div className="flex justify-between">
                <strong className="text-gray-600">Address:</strong>
                <span className="text-gray-800">{selectedClient.address}</span>
              </div>
            </div>

            {/* Executive Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">
                Executives Name
              </h3>
              {selectedClient.executives &&
              selectedClient.executives.length > 0 ? (
                <ul className="space-y-2 list-disc pl-5">
                  {selectedClient.executives.map((exec, index) => (
                    <li key={index} className="text-gray-800">
                      <div className="flex justify-between">
                        <strong className="text-gray-600">Name:</strong>
                        <span className="text-gray-800">{exec.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong className="text-gray-600">Phone:</strong>
                        <span className="text-gray-800">
                          {exec.phoneNumber}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No executives available.</p>
              )}
            </div>

            {/* Close Button */}
            <div className="text-center mt-6">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clients;
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};
