import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function ListItem({ item, listId, showPrice, categories, list }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('');

    useEffect(() => {
        // Only update state variables when the component mounts or when 'item' changes 
        if (item) {
            setName(item.name || '');
            setQuantity(item.quantity || 1);
            setPrice(item.price || 0);
            setCategory(item.category || '');
        }
    }, []); 

    if (!item) {
        return null; 
    }

    const handleUpdate = async () => {
        const listRef = doc(db, 'lists', listId);

         // Find the index of the item to update using a unique identifier (e.g., 'id')
    const itemIndex = list.items.findIndex(i => i.id === item.id); 


        if (itemIndex !== -1) {
            // Update the item directly in the array using its index
            const updatedItems = [...list.items];
            updatedItems[itemIndex] = { ...item, name, quantity, price, category };

            await updateDoc(listRef, {
                items: updatedItems
            });
        } else {
            console.error('Item not found in the list');
            // Handle the error gracefully (e.g., show an error message to the user)
        }

        setEditing(false);
    };

    const handleDelete = async () => {
        const listRef = doc(db, 'lists', listId);
        await updateDoc(listRef, {
            items: arrayRemove(item)
        });
    };

    const handleToggleComplete = async () => {
        const listRef = doc(db, 'lists', listId);
        await updateDoc(listRef, {
            items: arrayRemove(item)
        });
        await updateDoc(listRef, {
            items: arrayUnion({ ...item, completed: !item.completed })
        });
    };

    if (editing) {
        return (
            <div className="flex items-center space-x-2 my-2">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-1 rounded"
                />
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border p-1 rounded w-16"
                />
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="border p-1 rounded w-16"
                />

                <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="border p-1 rounded"
                >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                        <option key={cat.name} value={cat.name}> 
                            {cat.icon} {cat.name}
                        </option>
                    ))}
                </select>

                <button onClick={handleUpdate} className="bg-green-500 text-white p-1 rounded">Save</button>
                <button onClick={() => setEditing(false)} className="bg-gray-500 text-white p-1 rounded">Cancel</button>
            </div>
        );
    }

    return (
        <tr> 
            <td className="border p-2 text-center">
                <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={handleToggleComplete}
                />
            </td>
            <td className="border p-2">{name}</td>
            <td className="border p-2 text-center">{quantity}</td>
            {showPrice && <td className="border p-2 text-center">₹{price}</td>}
            <td className="border p-2">
                <span aria-label={item.category} role="img"> 
                    {categories.find(c => c.name === item.category)?.icon || ''} 
                </span> 
                {item.category}
            </td>
            <td className="border p-2">
                <button onClick={() => setEditing(true)} className="bg-blue-500 text-white p-1 rounded mr-2">Edit</button>
                <button onClick={handleDelete} className="bg-red-500 text-white p-1 rounded">Delete</button>
            </td>
        </tr>
    );
}