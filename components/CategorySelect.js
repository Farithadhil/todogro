// components/CategorySelect.js
import { useState } from 'react';

const categories = [
  'Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Household', 'Other'
];

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
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}