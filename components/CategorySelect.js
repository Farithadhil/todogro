import { useState } from 'react';
import { categories } from './categories'; // Import the centralized categories

export default function CategorySelect({ onSelect }) {
  const [category, setCategory] = useState('');

  const handleChange = (e) => {
    setCategory(e.target.value);
    onSelect(e.target.value);
  };

  return (
    <select
      value={category}
      onChange={handleChange}
      className="border p-2 rounded"
    >
      <option value="">Select a category</option>
      {categories.map(cat => (
        <option key={cat.name} value={cat.name}>
          {cat.icon} {cat.name} 
        </option>
      ))}
    </select>
  );
}