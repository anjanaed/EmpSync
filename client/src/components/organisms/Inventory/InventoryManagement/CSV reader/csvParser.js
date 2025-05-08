import Papa from 'papaparse';

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const ingredients = results.data.map(row => ({
                    name: row.name,
                    price_per_unit: row.price_per_unit.toString(),
                    quantity: row.quantity.toString(),
                    type: row.type,
                    priority: parseInt(row.priority) || 3
                }));
                resolve(ingredients);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const validateCSVData = (ingredients) => {
    const errors = [];
    const requiredFields = ['name', 'price_per_unit', 'quantity', 'type'];
  
    ingredients.forEach((ingredient, index) => {
      requiredFields.forEach(field => {
        if (!ingredient[field]) {
          errors.push(`Row ${index + 1}: Missing ${field}`);
        }
      });
  
      if (isNaN(parseFloat(ingredient.price_per_unit))) {
        errors.push(`Row ${index + 1}: Invalid price format`);
      }
  
      if (isNaN(parseInt(ingredient.quantity))) {
        errors.push(`Row ${index + 1}: Invalid quantity format`);
      }
    });
  
    return errors;
  };