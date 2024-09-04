// components/NewListForm.js
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import CategorySelect from './CategorySelect';
import SuggestionList from './SuggestionList';

export default function NewListForm() {
  const [listName, setListName] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (listName.trim() && user) {
          try {
              await addDoc(collection(db, 'lists'), {
                  name: listName,
                  userId: user.uid,
                  items: [{
                      name: itemName,
                      category,
                      quantity,
                      price
                  }]
              });
              // Also add the item to the suggestions collection
              await addDoc(collection(db, 'items'), {
                  name: itemName,
                  userId: user.uid
              });
              setListName('');
              setItemName('');
              setCategory('');
              setQuantity(1);
              setPrice(0);
          } catch (error) {
              console.error('Error adding document: ', error);
          }
      }
  };

  // Function to handle suggestion clicks
  const handleSuggestionClick = (suggestion) => {
      setListName(suggestion); // Update the list name field
  };
    return (
      <form onSubmit={handleSubmit} className="mb-4">
            <div> {/* Wrap input and suggestions in a div for better layout */}
                <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="New list name"
                    className="border p-2 mr-2 rounded w-full" // Make input full width
                />
                {/* Pass the click handler to SuggestionList */}
                <SuggestionList onSelect={handleSuggestionClick} /> 
            </div>
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item name"
          className="border p-2 mr-2 rounded"
        />
       
        <CategorySelect onSelect={setCategory} />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="Quantity"
          className="border p-2 mr-2 rounded w-20"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="Price ₹"
          className="border p-2 mr-2 rounded w-20"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Item to New List
        </button>
        <SuggestionList onSelect={(item) => setItemName(item)} />
      </form>
    );
  }