import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { ApiURL } from "../path";
import { Header } from "../components";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FaEye, FaTrashAlt } from "react-icons/fa";


const Refurbishment = () => {
  const [refurbishmentData, setRefurbishmentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    fetchRefurbishment();
  }, []);

  const fetchRefurbishment = async () => {
    try {
      const res = await axios.get(`${ApiURL}/refurbishment/all`);
      if (res.status === 200) {
        setRefurbishmentData(res.data);
      }
    } catch (error) {
      console.error("Error fetching Refurbishment:", error);
      toast.error("Failed to fetch Refurbishment");
    }
  };

  const deleteRefurbishment = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        const response = await axios.delete(`${ApiURL}/refurbishment/${id}`);
        if (response.status === 200) {
          toast.success("Refurbishment deleted successfully");
          fetchRefurbishment();
        }
      } catch (error) {
        console.error("Error deleting refurbishment:", error);
        toast.error("Failed to delete refurbishment");
      }
    }
  };

  // Filtered and paginated data
  const filteredData = refurbishmentData.filter((item) =>
    item.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="m-4 p-4 md:p-6 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      <Header category="Page" title="Refurbishment" />

      {/* Search Box */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to page 1 on new search
          }}
          className="border border-gray-300 px-4 py-2 rounded-md w-64"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="border px-4 py-2">S.No.</th>
              <th className="border px-4 py-2">Order ID</th>
              <th className="border px-4 py-2">Floor Manager</th>
              <th className="border px-4 py-2">Shipping Address</th>
              <th className="border px-4 py-2">Created</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  No refurbishment records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50 text-sm">
                  <td className="border px-4 py-2 text-center">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td className="border px-4 py-2">{item.orderId}</td>
                  <td className="border px-4 py-2">{item.floorManager}</td>
                  <td className="border px-4 py-2">{item.shippingAddress}</td>
                  <td className="border px-4 py-2">
                    {moment(item.createdAt).format("DD-MM-YYYY")}
                  </td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => navigate(`/refurbishmentinvoice/${item.orderId}`)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    >
                        <FaEye  style={{fontSize:"20px"}}/>

                    </button>
                    <button
                      onClick={() => deleteRefurbishment(item._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                     <FaTrashAlt  style={{fontSize:"20px"}}/>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex space-x-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Refurbishment;
