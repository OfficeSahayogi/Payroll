// utils/dateFormatter.js

export const formatDateToDDMMYYYY = (date) => {
    if (!date) return ""; // Handle undefined or null dates
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0"); // Add leading zero if day < 10
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = d.getFullYear(); // Extract full year
    return `${day}-${month}-${year}`;
  };
  