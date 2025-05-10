import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

/**
 * Exports ingredient data to a PDF file
 * @param {Array} ingredients - The list of ingredients to export
 * @param {Object} options - Optional configuration parameters
 * @returns {Object} - Status of the export operation
 */
export const exportIngredientsToPDF = (ingredients, options = {}) => {
  try {
    // Check if we have data to export
    if (ingredients.length === 0) {
      return { success: false, message: 'No ingredients to export' };
    }
    
    // Create a new jsPDF instance (portrait, units in mm, A4 size)
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Document title
    const title = options.title || 'Inventory Management - Ingredients List';
    doc.setFontSize(16);
    doc.text(title, 15, 15);
    
    // Generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 22);
    
    // Summary information
    const totalItems = ingredients.length;
    const totalValue = ingredients.reduce(
      (sum, item) => sum + (parseFloat(item.price_per_unit || 0) * parseFloat(item.quantity || 0)), 0
    ).toFixed(2);
    
    doc.text(`Total Items: ${totalItems} | Total Value: $${totalValue}`, 15, 28);
    
    // Define table columns
    const tableColumn = ["ID", "Name", "Price Per Unit", "Quantity", "Priority"];
    
    // Define table rows with better error handling
    const tableRows = ingredients.map(ingredient => {
      const priorityLabels = {1: 'High', 2: 'Medium', 3: 'Low'};
      const priceValue = ingredient.price_per_unit || '0';
      const quantity = ingredient.quantity || '0';
      
      return [
        ingredient.id || 'N/A',
        ingredient.name || 'Unnamed',
        `$${priceValue}`,
        quantity,
        priorityLabels[ingredient.priority] || 'Unknown'
      ];
    });
    
    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 32,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 35 }
    });
    
    // Save the PDF with optional filename
    const filename = options.filename || 'ingredients-inventory.pdf';
    doc.save(filename);
    
    return { success: true, message: 'PDF exported successfully' };
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return { success: false, message: error.message || 'Failed to export PDF' };
  }
};