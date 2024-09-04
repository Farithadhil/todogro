// components/GroceryList.js
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, query, where, 
  doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import ListItem from './ListItem';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import notoSansTamilFont from '/public/fonts/NotoSansTamil-Regular.ttf';
import SuggestionList from './SuggestionList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faShareAlt, faCopy, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontFaceObserver } from 'fontfaceobserver'; 



const categories = [
  { name: 'Others', icon: '🤷‍♀️', alt: 'Others' },
  { name: 'Fruits', icon: '🍎', alt: 'Fruits' },
  { name: 'Vegetables', icon: '🥦', alt: 'Vegetables' },
  { name: 'Dairy', icon: '🥛', alt: 'Dairy' },
  { name: 'Meat', icon: '🥩', alt: 'Meat' },
  { name: 'Seafood', icon: '🐟', alt: 'Seafood' },
  { name: 'Bakery', icon: '🥐', alt: 'Bakery' },
  { name: 'Pantry', icon: '🥫', alt: 'Pantry' },
  { name: 'Beverages', icon: '🍹', alt: 'Beverages' },
  { name: 'Frozen', icon: '🧊', alt: 'Frozen' },
  { name: 'Breakfast', icon: '🥞', alt: 'Breakfast' },
  { name: 'Wellness', icon: '💊', alt: 'Wellness' },
  { name: 'Baby', icon: '👶', alt: 'Baby' },
  { name: 'Pets', icon: '🐶', alt: 'Pets' },
  { name: 'Household', icon: '🧹', alt: 'Household' },
  { name: 'Personal', icon: '🧴', alt: 'Personal' },
  { name: 'International', icon: '🌎', alt: 'International' },
  { name: 'Gluten-Free', icon: '🌾🚫', alt: 'Gluten-Free' },
  { name: 'Baking', icon: '🧁', alt: 'Baking' },
  { name: 'Sweets', icon: '🍭', alt: 'Sweets' },
  { name: 'Canned', icon: '🥫', alt: 'Canned' },
  { name: 'Condiments', icon: '🧂', alt: 'Condiments' },
  { name: 'Prepared', icon: '🥘', alt: 'Prepared' },
  { name: 'Seasonal', icon: '🍂', alt: 'Seasonal' }
];



export default function GroceryList({ listId, onDelete }) {
  const [list, setList] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, price: 0, category: '' });
  const [showPrices, setShowPrices] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && listId) {
      // Fetch list data initially using getDoc
      const fetchListData = async () => {
          try {
              const docRef = doc(db, 'lists', listId);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                  setList({ id: docSnap.id, ...docSnap.data() });
                  setNewListName(docSnap.data().name || ''); // Update newListName here
              } else {
                  console.log("No such document!");
              }
          } catch (error) {
              console.error("Error fetching list data:", error);
          }
      };

      fetchListData();
  }
}, [user, listId]);

  const [editingListName, setEditingListName] = useState(false);
  // Use optional chaining or a conditional check to initialize newListName
  const [newListName, setNewListName] = useState(list ? list.name : ''); 

    const handleEditListName = () => {
        setEditingListName(true);
    };

    const handleSaveListName = async () => {
        if (newListName.trim() === '') return; 

        const listRef = doc(db, 'lists', listId);
        await updateDoc(listRef, {
            name: newListName
        });
        setEditingListName(false);
    };

    const handleDeleteList = async () => {
      if (window.confirm("Are you sure you want to delete this list?")) {
          const listRef = doc(db, 'lists', listId);
          await deleteDoc(listRef);
          onDelete(); // Call the callback to refresh the list in Dashboard
      }
  };              


  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name.trim() === '') return;

    const listRef = doc(db, 'lists', listId);
    await updateDoc(listRef, {
      items: arrayUnion({ ...newItem, completed: false })
    });
    setNewItem({ name: '', quantity: 1, price: 0, category: '' });
  };

  

  const calculateTotal = () => {
    if (!list || !list.items) return 0;
    return list.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (!list) return <div>Loading...</div>;



  const exportAsPDF = async (list) => {
    const doc = new jsPDF();

    // Load and embed the font
    doc.addFont(notoSansTamilFont, "NotoSansTamil", "normal");
    doc.setFont("NotoSansTamil");
  
    doc.text(list.name, 14, 16);
    
    const tableColumn = ["Item", "Quantity", "Price", "Category"];
    const tableRows = list.items.map(item => [item.name, item.quantity, `₹${item.price}`, item.category]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { font: "NotoSansTamil" },
      headStyles: { font: "NotoSansTamil" },
    });
  
    doc.text(`Total: $${calculateTotal().toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
    
    doc.save(`${list.name}.pdf`);
  };
  

  
  const copyAsPlainText = (list) => {
    let text = `${list.name}\n\n`;
    list.items.forEach(item => {
      text += `${item.name} - Quantity: ${item.quantity}, Price: $${item.price}, Category: ${item.category}\n`;
    });
    text += `\nTotal: $${calculateTotal().toFixed(2)}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert("List copied to clipboard!");
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };
  
  const shareViaWhatsApp = (list) => {
    let text = encodeURIComponent(`${list.name}\n\n`);
    list.items.forEach(item => {
      text += encodeURIComponent(`${item.name} - Quantity: ${item.quantity}, Price: $${item.price}, Category: ${item.category}\n`);
    });
    text += encodeURIComponent(`\nTotal: $${calculateTotal().toFixed(2)}`);
    
    window.open(`https://wa.me/?text=${text}`);
  };








  return (
    <div className="mt-4 p-4 bg-white shadow rounded-lg">  
    <div className="flex justify-between items-center mb-4"> {/* Container for name and icons */}
        {editingListName ? (
            <div>
                <input 
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="border p-2 mr-2 rounded"
                />
                <button onClick={handleSaveListName} className="bg-green-500 text-white p-2 rounded">Save</button>
            </div>
        ) : (
            <h2 className="text-xl font-bold">
                {list.name} 
                <FontAwesomeIcon icon={faEdit} className="ml-2 cursor-pointer" onClick={handleEditListName} />
            </h2>
        )}
        <div> {/* Icon group */}
            <FontAwesomeIcon icon={faShareAlt} className="mr-2 cursor-pointer" onClick={() => shareViaWhatsApp(list)} />
            <FontAwesomeIcon icon={faCopy} className="mr-2 cursor-pointer" onClick={() => copyAsPlainText(list)} />
            <FontAwesomeIcon icon={faTrashAlt} className="cursor-pointer" onClick={handleDeleteList} />
        </div>
    </div>
      
      <form onSubmit={addItem} className="mb-4">
        <input
          type="text"
          value={newItem.name}
          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
          placeholder="Item name"
          className="border p-2 mr-2 rounded"
        />
        <input
          type="number"
          value={newItem.quantity}
          onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
          placeholder="Quantity"
          className="border p-2 mr-2 rounded w-20"
        />
        <input
          type="number"
          value={newItem.price}
          onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
          placeholder="₹ Price"
          className="border p-2 mr-2 rounded w-20"
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({...newItem, category: e.target.value})}
          className="border p-2 mr-2 rounded"
        >
          <option value="">Select category</option>
    {categories.map(category => (
        <option key={category.name} value={category.name}>
            {category.icon} {category.name} 
        </option>
    ))}
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Item
        </button>
      </form>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showPrices}
            onChange={() => setShowPrices(!showPrices)}
            className="mr-2"
          />
          Show Prices
        </label>
      </div>

      
            {/* Table layout for list items */}
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Completed</th>
                        <th className="border p-2">Item</th>
                        <th className="border p-2">Quantity</th>
                        {showPrices && <th className="border p-2">Price</th>}
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Actions</th> 
                    </tr>
                </thead>
                <tbody>
                {list.items && list.items.length > 0 ? (
                    list.items.map((item, index) => (
                        <ListItem
                            key={index}
                            item={item}
                            listId={listId}
                            showPrice={showPrices}
                            categories={categories}
                            list={list}
                        />
                    ))
                ) : (
                     <tr>
                            <td colSpan={showPrices ? 5 : 4} className="text-center p-2">
                            Ready to shop? Click 'Add Item' to start building your list!
                            </td>
                        </tr>
                )}
            </tbody>
            </table>



      {showPrices && (
        <div className="mt-4 font-bold">
          Total: ${calculateTotal().toFixed(2)}
        </div>
      )}

      <div className="mt-4">
        <button onClick={() => exportAsPDF(list)} className="bg-green-500 text-white p-2 rounded mr-2">
          Download PDF
        </button>
        <button onClick={() => copyAsPlainText(list)} className="bg-yellow-500 text-white p-2 rounded mr-2">
          Copy as Text
        </button>
        <button onClick={() => shareViaWhatsApp(list)} className="bg-green-600 text-white p-2 rounded">
          Share via WhatsApp
        </button>
      </div>
    </div>
  );
}