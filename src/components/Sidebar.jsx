import React from "react";
import { Link, NavLink } from "react-router-dom";
import { SiShopware } from "react-icons/si";
import { MdOutlineCancel, MdOutlineDryCleaning } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { FiShoppingBag, FiEdit } from "react-icons/fi";
import { BsKanban, BsFillHandbagFill } from "react-icons/bs";
import { GiMasterOfArms } from "react-icons/gi";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useStateContext } from "../contexts/ContextProvider";
import { FaImages, FaWarehouse } from "react-icons/fa";
import { GoReport } from "react-icons/go";

import { IoMdContacts } from "react-icons/io";

// Sidebar
const Sidebar = () => {
  const { activeMenu, setActiveMenu, screenSize, currentColor } =
    useStateContext();

  // handle sidebar close
  const handleCloseSidebar = () => {
    if (activeMenu && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  // active link styles
  const activeLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-white text-md m-2";

  // non-active link styles
  const normalLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2";

  const links = [
    {
      title: "Dashboard",
      links: [
        {
          name: "Home",
          icon: <FiShoppingBag />,
        },
        { 
          name: "Master",
          icon: <GiMasterOfArms />,
        },
        // {
        //   name: "banner",
        //   icon: <FaImages />,
        // },
      ],
    },
    {
      title: "App Management",
      links: [
        {
          name: "Banner",
          icon: <FaImages />,
        },
      ],
    },
    {
      title: "Product Management",
      links: [
        // {
        //   name: "category",
        //   icon: <BsKanban />,
        // },
        // {
        //   name: "subcategory",
        //   icon: <BsFillHandbagFill />,
        // },
        {
          name: "product",
          icon: <FiEdit />,
        },
        // {
        //   name: "inventory",
        //   icon: <BiColorFill />,
        // },
      ],
    },
    {
      title: "Client Management",
      links: [
        {
          name: "clients",
          icon: <IoMdContacts />,
        },
        {
          name: "orders",
          icon: <AiOutlineShoppingCart />,
        },
        // {
        //   name: "Refurbishment",
        //   icon: <MdOutlineDryCleaning />,
        // },
      ],
    },
    // {
    //   title: "Warehoue Management",
    //   links: [
    //     {
    //       name: "Warehouse-Orders",
    //       icon: <FaWarehouse />,
    //     },
        
    //   ],
    // },

    {
      title: "Enquiry Management",
      links: [
        {
          name: "enquiry",
          icon: <BsKanban />,
        },
        {
          name: "enquiry-calendar",
          icon: <BsKanban />,
        },
      ],
    },

    {
      title: "Quotations",

      links: [
        {
          name: "quotations",
          icon: <BsKanban />,
        },
        {
          name: "terms&conditions",
          icon: <BsKanban />,
        },
      ],
      
    },
  
    {
      title: "Reports",
      links: [
        {
          name: "paymentReport",
          icon: <GoReport />,
        },
      ],
    },
  ];
  return (
    <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10">
      {activeMenu && (
        <>
          <div className="flex justify-between items-center">
            {/* Brand Info */}
            <Link
              to="/"
              onClick={handleCloseSidebar}
              className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
            >
              <SiShopware /> <span>Rent Angadi</span>
            </Link>

            {/* Menu Close Icon */}
            <TooltipComponent content="Close" position="BottomCenter">
              <button
                type="button"
                onClick={() =>
                  setActiveMenu((prevActiveMenu) => !prevActiveMenu)
                }
                className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
              >
                <MdOutlineCancel />
              </button>
            </TooltipComponent>
          </div>

          {/* Render all Links */}
          <div className="mt-10">
            {links.map((item) => (
              <div key={item.title}>
                <p className="text-gray-400 m-3 mt-4 uppercase" style={{fontSize:"16px",color:"black",fontWeight:"600"}}>{item.title}</p>

                {/* each link from every category */}
                {item.links.map((link) => (
                  <NavLink
                    to={`/${link.name}`}
                    key={link.name}
                    onClick={handleCloseSidebar}
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? currentColor : "",
                    })}
                    className={({ isActive }) =>
                      isActive ? activeLink : normalLink
                    }
                  >
                    {link.icon}
                    <span className="capitalize">{link.name}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
