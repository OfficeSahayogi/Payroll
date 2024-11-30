import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import base from "../config/api";

const DailyEmployeeChart = () => {
  const {
    role,
    organizations,
    selectedOrganization: selectedOrg,
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
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10; // Margin around the page
    const gridHeight = (pageHeight - 4 * margin) / 3; // Divide page height into three grids
  
    // Helper function to split data into three grids
    const splitIntoGrids = (data, numGrids) => {
      const gridSize = Math.ceil(data.length / numGrids);
      const grids = [];
      for (let i = 0; i < numGrids; i++) {
        grids.push(data.slice(i * gridSize, (i + 1) * gridSize));
      }
      return grids;
    };
  
    // Filter Staff and Labor Data
    const staffData = chartData.filter((row) => row.type === "Staff");
    const labourData = chartData.filter((row) => row.type === "Labor");
  
    // Split data into three grids
    const staffGrids = splitIntoGrids(staffData, 3);
    const labourGrids = splitIntoGrids(labourData, 3);
  
    // Function to render a single grid
    const renderGrid = (data, startY) => {
      const tableData = [];
  
      // Format each row as three columns (Code, Name pairs)
      for (let i = 0; i < data.length; i += 3) {
        tableData.push([
          data[i]?.code || "",
          data[i]?.name || "",
          data[i + 1]?.code || "",
          data[i + 1]?.name || "",
          data[i + 2]?.code || "",
          data[i + 2]?.name || "",
        ]);
      }
  
      autoTable(doc, {
        head: [["Code", "Name", "Code", "Name", "Code", "Name"]],
        body: tableData,
        startY,
        styles: { fontSize: 8, cellPadding: 1.5, halign: "center" },
        theme: "grid",
        columnStyles: {
          0: { cellWidth: 20 }, // Code column 1
          1: { cellWidth: 60 }, // Name column 1
          2: { cellWidth: 20 }, // Code column 2
          3: { cellWidth: 60 }, // Name column 2
          4: { cellWidth: 20 }, // Code column 3
          5: { cellWidth: 60 }, // Name column 3
        },
        margin: { left: margin, right: margin },
      });
    };
  
    // Render Staff Data (First Page)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    const staffTitle = `${selectedOrganization} - Staff Data`;
    const titleWidth = doc.getTextWidth(staffTitle);
    doc.text(staffTitle, (pageWidth - titleWidth) / 2, margin); // Centered title
    staffGrids.forEach((grid, index) => {
      const startY = margin + 10 + index * (gridHeight + margin);
      renderGrid(grid, startY);
    });
  
    // Add Labor Data (Second Page)
    doc.addPage();
    const labourTitle = `${selectedOrganization} - Labor Data`;
    const labourTitleWidth = doc.getTextWidth(labourTitle);
    doc.text(labourTitle, (pageWidth - labourTitleWidth) / 2, margin); // Centered title
    labourGrids.forEach((grid, index) => {
      const startY = margin + 10 + index * (gridHeight + margin);
      renderGrid(grid, startY);
    });
  
    // Save the PDF
    doc.save(`${selectedOrganization}_Staff_and_Labor_Data.pdf`);
  };
  
  
  
  

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
        <div className="overflow-y-auto max-h-80 xl:max-h-[600px] 2xl:max-h-[700px]">
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
