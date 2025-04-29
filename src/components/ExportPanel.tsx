import React, { useCallback } from "react";
import { toPng, toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import { Download, FileImage, File as FilePdf } from "lucide-react";

interface ExportPanelProps {
  isDarkMode: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ isDarkMode }) => {
  const downloadImage = useCallback(
    async (format: "png" | "jpeg") => {
      const node = document.querySelector(".react-flow") as HTMLElement;
      if (!node) return;

      try {
        const dataUrl = await (format === "png" ? toPng : toJpeg)(node, {
          backgroundColor: isDarkMode ? "#111827" : "#ffffff",
          quality: 0.95,
        });

        const link = document.createElement("a");
        link.download = `flowchart.${format}`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error exporting image:", error);
      }
    },
    [isDarkMode]
  );

  const downloadPDF = useCallback(async () => {
    const node = document.querySelector(".react-flow") as HTMLElement;
    if (!node) return;

    try {
      const dataUrl = await toPng(node, {
        backgroundColor: isDarkMode ? "#111827" : "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [node.clientWidth, node.clientHeight],
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, node.clientWidth, node.clientHeight);
      pdf.save("flowchart.pdf");
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  }, [isDarkMode]);

  return (
    <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => downloadImage("png")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
          title="Download as PNG"
        >
          <FileImage className="w-5 h-5" />
          <span className="text-sm">PNG</span>
        </button>
        <button
          onClick={() => downloadImage("jpeg")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
          title="Download as JPEG"
        >
          <FileImage className="w-5 h-5" />
          <span className="text-sm">JPEG</span>
        </button>
        <button
          onClick={downloadPDF}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
          title="Download as PDF"
        >
          <FilePdf className="w-5 h-5" />
          <span className="text-sm">PDF</span>
        </button>
      </div>
    </div>
  );
};
