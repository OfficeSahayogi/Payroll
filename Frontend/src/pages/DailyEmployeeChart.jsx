import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import base from "../config/api";

const DailyEmployeeChart = () => {
  const currentDate=new Date().toDateString
  const {
    role,
    organizations,
    selectedOrg,
  } = useSelector((state) => state.user);
  const [selectedOrganization, setSelectedOrganization] = useState(
    selectedOrg || organizations[0]
  );
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChartData = async (org) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${base.baseUrl}/api/employees/chart`, {
        params: { org },
        withCredentials: true,
      });
      setChartData(response.data);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError(err.response?.data?.message || "Failed to fetch chart data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(selectedOrganization);
  }, [selectedOrganization]);

  const exportToPDF = () => {
    const doc = new jsPDF("portrait"); // Portrait orientation
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10; // Margin around the page
  
    // Get the current date in dd-mm-yyyy format
    const formatDate = () => {
      const currentDate = new Date();
      const dd = String(currentDate.getDate()).padStart(2, "0");
      const mm = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const yyyy = currentDate.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    };
  
    const currentDate = formatDate();
  
    // Helper function to format data into three columns
    const formatDataIntoColumns = (data) => {
      const columnSize = Math.ceil(data.length / 3); // Divide data into three parts
      return [
        data.slice(0, columnSize),
        data.slice(columnSize, columnSize * 2),
        data.slice(columnSize * 2),
      ];
    };
  
    // Filter Staff and Labour Data
    const staffData = chartData.filter((row) => row.type === "Staff");
    const labourData = chartData.filter((row) => row.type === "Labor");
  
    // Split data into three columns
    const [staffLeft, staffMid, staffRight] = formatDataIntoColumns(staffData);
    const [labourLeft, labourMid, labourRight] = formatDataIntoColumns(labourData);
  
    // Function to render a single table
    const addTable = (title, leftColumn, midColumn, rightColumn, startY) => {
      // Prepare table data
      const tableData = [];
      for (
        let i = 0;
        i < Math.max(leftColumn.length, midColumn.length, rightColumn.length);
        i++
      ) {
        tableData.push([
          leftColumn[i] ? leftColumn[i].code : "",
          leftColumn[i] ? leftColumn[i].name : "",
          midColumn[i] ? midColumn[i].code : "",
          midColumn[i] ? midColumn[i].name : "",
          rightColumn[i] ? rightColumn[i].code : "",
          rightColumn[i] ? rightColumn[i].name : "",
        ]);
      }
  
      // Add table to PDF
      autoTable(doc, {
        head: [["Code", "Name", "Code", "Name", "Code", "Name"]],
        body: tableData,
        startY,
        styles: { cellPadding: 2, fontSize: 8 }, // Reduced font size for compact layout
        theme: "grid",
        columnStyles: {
          0: { cellWidth: 15 }, // Code (Left)
          1: { cellWidth: 50 }, // Name (Left)
          2: { cellWidth: 15 }, // Code (Middle)
          3: { cellWidth: 50 }, // Name (Middle)
          4: { cellWidth: 15 }, // Code (Right)
          5: { cellWidth: 50 }, // Name (Right)
        },
        margin: { left: margin, right: margin },
      });
    };
  
    let startY = 20;
  
    // Add Staff Data on the First Page
    if (staffData.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12); // Title font size
      const staffTitle = `${selectedOrganization}`;
      const staffTitleWidth = doc.getTextWidth(staffTitle);
      doc.text(staffTitle, (pageWidth - staffTitleWidth) / 2, margin); // Centered title
  
      // Add the date at the top right corner
      doc.setFontSize(10);
      doc.text(currentDate, pageWidth - margin - doc.getTextWidth(currentDate), margin);
  
      addTable("Staff", staffLeft, staffMid, staffRight, startY);
    }
  
    // Add Labour Data on the Second Page
    if (labourData.length > 0) {
      doc.addPage(); // Add a new page for Labour data
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12); // Title font size
      const labourTitle = `${selectedOrganization}`;
      const labourTitleWidth = doc.getTextWidth(labourTitle);
      doc.text(labourTitle, (pageWidth - labourTitleWidth) / 2, margin); // Centered title
  
      // Add the date at the top right corner
      doc.setFontSize(10);
      doc.text(currentDate, pageWidth - margin - doc.getTextWidth(currentDate), margin);
  
      addTable("Labour", labourLeft, labourMid, labourRight, startY);
    }
  
    // Save the PDF
    doc.save(`${selectedOrganization}_Staff_and_Labour_Data.pdf`);
  };
  
  
  
  
  // const exportToPDF = () => {
  //   const doc = new jsPDF("landscape");
  
  //   // Filter the data for Staff and Labour separately
  //   const staffData = chartData.filter((row) => row.type === "Staff");
  //   const labourData = chartData.filter((row) => row.type === "Labor");
  
  //   // Helper function to format data into two columns
  //   const formatDataIntoColumns = (data) => {
  //     const midpoint = Math.ceil(data.length / 2);
  //     return [data.slice(0, midpoint), data.slice(midpoint)];
  //   };
  
  //   // Function to split data into multiple pages
  //   const paginateData = (data, rowsPerPage) => {
  //     const pages = [];
  //     for (let i = 0; i < data.length; i += rowsPerPage) {
  //       pages.push(data.slice(i, i + rowsPerPage));
  //     }
  //     return pages;
  //   };
  
  //   // Generate table for a specific type (Staff/Labour)
  //   const addTable = (title, data, startY) => {
  //     doc.setFont("helvetica", "bold"); // Set font to bold
  //     doc.setFontSize(16); // Set font size to 16 for a larger title
  //     const pageWidth = doc.internal.pageSize.getWidth(); // Total width of the PDF
  //     const textWidth = doc.getTextWidth(title); // Width of the title text
  //     const centerX = (pageWidth - textWidth) / 2; // Calculate centered X position
  //     doc.text(title, centerX, startY - 6); // Add title text
  
  //     const tableData = data.map((row) => [row.code, row.name]);
  
  //     // Define rows per page based on the page height and row height
  //     const pageHeight = doc.internal.pageSize.getHeight() - 20; // Subtract margins
  //     const rowHeight = 10; // Approximate row height
  //     const rowsPerPage = Math.floor(pageHeight / rowHeight);
  
  //     // Split data into multiple pages if it exceeds rows per page
  //     const paginatedData = paginateData(tableData, rowsPerPage);
  
  //     let currentY = startY;
  //     paginatedData.forEach((page, pageIndex) => {
  //       if (pageIndex > 0) {
  //         doc.addPage(); // Add a new page for each subsequent page
  //         currentY = 20; // Reset startY for the new page
  //       }
  
  //       autoTable(doc, {
  //         head: [["Code", "Name"]],
  //         body: page,
  //         startY: currentY,
  //         styles: { cellPadding: 2, fontSize: 10, halign: "center" },
  //         theme: "grid",
  //         columnStyles: {
  //           0: { cellWidth: 50, halign: "center" }, // Adjust column width
  //           1: { cellWidth: 100, halign: "center" },
  //         },
  //         margin: { left: 10, right: 10 },
  //       });
  
  //       currentY = doc.previousAutoTable.finalY + 10; // Update Y position for the next section
  //     });
  //   };
  
  //   let startY = 20;
  
  //   // Add Staff Data
  //   if (staffData.length > 0) {
  //     addTable(`${selectedOrganization} - Staff`, staffData, startY);
  //   }
  
  //   // Add Labour Data
  //   if (labourData.length > 0) {
  //     addTable(`${selectedOrganization} - Labour`, labourData, startY);
  //   }
  
  //   // Save PDF
  //   doc.save(`${selectedOrganization}_DailyEmployeeChart.pdf`);
  // };
  
  
  
  
  
  

  const splitData = (data) => {
    const midpoint = Math.ceil(data.length / 2);
    return [data.slice(0, midpoint), data.slice(midpoint)];
  };

  const [leftColumn, rightColumn] = splitData(chartData);

  return (
    <div className="h-full w-full flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">
            Daily Employee Chart
          </h2>

          {role === "Super Admin" && (
            <div className="mb-6">
              <select
                className="p-2 border rounded-lg w-full"
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
              >
                {organizations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
              onClick={exportToPDF}
            >
              Export to PDF
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[350px] 2xl:max-h-[700px]">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : chartData.length === 0 ? (
            <p className="text-center text-gray-500">No data found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <table className="table-auto border-collapse w-full">
                <thead>
                  <tr className="bg-blue-100 text-blue-900 text-center">
                    <th className="px-4 py-2 border">Code</th>
                    <th className="px-4 py-2 border">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {leftColumn.map((row, index) => (
                    <tr key={index} className="text-center">
                      <td className="px-4 py-2 border">{row.code}</td>
                      <td className="px-4 py-2 border">{row.name || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="table-auto border-collapse w-full">
                <thead>
                  <tr className="bg-blue-100 text-blue-900 text-center">
                    <th className="px-4 py-2 border">Code</th>
                    <th className="px-4 py-2 border">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {rightColumn.map((row, index) => (
                    <tr key={index} className="text-center">
                      <td className="px-4 py-2 border">{row.code}</td>
                      <td className="px-4 py-2 border">{row.name || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyEmployeeChart;
