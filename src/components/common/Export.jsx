// import React, { useState } from "react";
// import * as XLSX from "xlsx";

// const Export = (data1) => {
//   const { data } = data1;

//   const [sub, setSub] = useState(data);

//   const handleExport = () => {
//     // 1️⃣ Convert JSON to worksheet
//     const ws = XLSX.utils.json_to_sheet(sub);

//     // 2️⃣ Create a new workbook and append the worksheet
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

//     // 3️⃣ Trigger download
//     XLSX.writeFile(wb, "export.xlsx");
//   };

//   return (
//     <div>
//       <button
//         className="bg-blue-500 rounded-sm px-2 py-1 text-white"
//         onClick={handleExport}
//       >
//         Export to Excel
//       </button>
//     </div>
//   );
// };

// export default Export;

import React from "react";
import * as XLSX from "xlsx";

// Helper function to format data for Excel
// const formatDataForExcel = (data) => {
//   return data.map((row) => {
//     const formattedRow = {};

//     Object.keys(row).forEach((key) => {
//       let value = row[key];

//       // 1️⃣ Detect dates dynamically
//       if (value && typeof value === "string" && !isNaN(Date.parse(value))) {
//         value = new Date(value).toLocaleDateString("en-GB"); // DD/MM/YYYY
//       }

//       // 2️⃣ Format numbers
//       if (typeof value === "number") {
//         value = value.toLocaleString("en-US", { minimumFractionDigits: 2 });
//       }

//       // 3️⃣ Format headers nicely
//       const formattedKey = key
//         .replace(/_/g, " ")
//         .replace(/\b\w/g, (l) => l.toUpperCase());

//       formattedRow[formattedKey] = value;
//     });

//     return formattedRow;
//   });
// };

const Export = ({
  data,
  fileName = "export.xlsx",
  buttonText = "Export to Excel",
}) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }

    // Convert to worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Export Excel file
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button
      className="bg-blue-500 rounded-sm px-2 py-1 text-white"
      onClick={handleExport}
    >
      {buttonText}
    </button>
  );
};

export default Export;
