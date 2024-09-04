import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function SuggestionList({ onSelect }) { // Receive onSelect prop
    const [suggestions, setSuggestions] = useState([]);
    const { user } = useAuth();

    // Get current date in the desired format
    const currentDate = new Date().toLocaleDateString('en-GB'); // Adjust locale if needed

    // Define your default suggestions with the current date
    const defaultSuggestions = ['Shopping', 'Grocery', currentDate]; 

    const [listIds, setListIds] = useState([]); // Move this line above the useEffect
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (user) {
                const q = query(collection(db, 'lists'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);

                const suggestionsData = querySnapshot.docs.map(doc => doc.data().name);
                const fetchedListIds = querySnapshot.docs.map(doc => doc.id); 

                const allSuggestions = [...new Set([...defaultSuggestions, ...suggestionsData])];
                setSuggestions(allSuggestions);
                setListIds(fetchedListIds); 
            } else {
                setSuggestions(defaultSuggestions);
            }
        };

        fetchSuggestions();
    }, [user, listIds]); // Use listIds as a dependency

    return (
      <div className="mt-2">
      <h4 className="font-semibold">Suggestions:</h4>
      <div className="flex flex-wrap"> 
          {suggestions.map(item => (
              <button
                  key={item}
                  type="button" // Add type="button" to prevent form submission
                  onClick={() => onSelect(item)} 
                  className="bg-gray-200 text-sm p-1 m-1 rounded"
              >
                  {item}
              </button>
          ))}
      </div>
  </div>
    );
}