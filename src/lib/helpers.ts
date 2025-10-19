export const setNestedValue = (obj: any, keyString: string, value: any) => {
  const keys = keyString.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    // Handle array notation in the current key
    const arrayMatch = key.match(/^([^\[]+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [_, arrayKey, index] = arrayMatch;
      
      // Ensure the array exists
      if (!current[arrayKey] || !Array.isArray(current[arrayKey])) {
        current[arrayKey] = [];
      }
      
      // Ensure the index exists
      if (!current[arrayKey][index]) {
        current[arrayKey][index] = {};
      }
      
      current = current[arrayKey][index];
    } else {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
  }

  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
  
  return obj;
}