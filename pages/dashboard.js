import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import GroceryList from '../components/GroceryList';
import SuggestionList from '../components/SuggestionList'; // Import SuggestionList

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const router = useRouter();

  // Reset the state when user logs out to prevent UI glitches
  useEffect(() => {
    if (!authLoading && !user) {
      setLists([]);
      setNewListName('');
    }
  }, [authLoading, user]);

  // Fetch lists after login
  useEffect(() => {
    if (!authLoading && user) {
      fetchLists();
    } else if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchLists = async () => {
    setLoading(true); // Ensure loading state is set before fetching data
    try {
      const q = query(collection(db, 'lists'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const listsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLists(listsData);
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
    setLoading(false); // Turn off loading once data is fetched
  };

  const createNewList = async (e) => {
    e.preventDefault();
    if (newListName.trim() === '') return;
  
    try {
      const newListData = {
        name: newListName,
        userId: user.uid,
        items: []
      };
  
      const tempId = 'temp_' + Date.now();
      setLists([...lists, { id: tempId, ...newListData }]); 
  
      const docRef = await addDoc(collection(db, 'lists'), newListData);
  
      setLists(lists.map(list => 
        list.id === tempId ? { id: docRef.id, ...list } : list
      ));
  
      setNewListName('');
      fetchLists(); // Refresh the list after creating a new one
    } catch (error) {
      console.error("Error creating new list:", error);
      setLists(lists.filter(list => list.id !== tempId)); 
      alert('Error creating list. Please try again.');
    }
  };
  
  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleSuggestionClick = (suggestion) => {
    setNewListName(suggestion); 
  };

  const handleListDelete = () => {
    fetchLists(); // Refresh the list of lists after a delete
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome, {user.displayName}!</p>

      <form onSubmit={createNewList} className="mb-4 flex items-baseline">
        <div className="flex-grow mr-2"> 
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="New list name"
            className="border p-2 rounded w-full" 
          />
          <SuggestionList onSelect={handleSuggestionClick} className="mt-1 m-0 p-0" />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded align-self-start !important">
          Create New List
        </button>
      </form>

      {lists.length === 0 ? (
        <p>You don't have any grocery lists yet. Create one to get started!</p>
      ) : (
        lists.map(list => (
          <GroceryList key={list.id} listId={list.id} onDelete={handleListDelete} />
        ))
      )}
    </div>
  );
}
