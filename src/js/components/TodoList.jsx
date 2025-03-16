import React, { useState, useEffect } from "react";
import '../../styles/ToDoList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSpinner, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

// En tu JSX:
<FontAwesomeIcon icon={faTrash} />

const USER_NAME = "reyesborjas86";
const API_URL = `https://playground.4geeks.com/todo/todos/${USER_NAME}`;

export default function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      
      if (response.status === 404) {
        // If user doesn't exist, create a new user with empty todos
        await createUser();
        setTasks([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTasks(data.map(task => task.label));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Create a new user if the user doesn't exist
  const createUser = async () => {
    try {
      // Example from documentation uses an empty array for new users
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify([]),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error creating user: ${response.status}`);
      }
      
      console.log(response.ok); // Will be true if the response is successful
      console.log(response.status); // The status code=201 or code=400 etc.
      
      return response.json(); // As shown in the documentation example
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to create user. Please try again.");
    }
  };

  const updateTasksOnServer = async (updatedTasks) => {
    try {
      // Convert simple string tasks to the format expected by the API
      const tasksForAPI = updatedTasks.map(task => ({
        label: task,
        done: false
      }));

      // Following the documentation example structure
      const response = await fetch(API_URL, {
        method: "PUT",
        body: JSON.stringify(tasksForAPI),
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log(response.ok); // Will be true if the response is successful
      console.log(response.status); // The status code=200 or code=400 etc.
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return response.json()
        .then(data => {
          // Here is where your code should start after the fetch finishes
          console.log(data); // This will print on the console the exact object received from the server
        });
    } catch (error) {
      console.error("Error updating tasks:", error);
      setError("Failed to update tasks. Please try again.");
      fetchTasks();
    }
  };

  const handleNewTask = async (event) => {
    if (event.key === "Enter" && newTask.trim() !== "") {
      const updatedTasks = [...tasks, newTask.trim()];
      setTasks(updatedTasks);
      setNewTask("");
      await updateTasksOnServer(updatedTasks);
    }
  };

  const handleDeleteTask = async (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    await updateTasksOnServer(updatedTasks);
  };

  const clearAllTasks = async () => {
    try {
      // Using DELETE method as specified in the documentation to remove the user
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setTasks([]);
      
      // Recreate the user with an empty todos array after deletion
      await createUser();
    } catch (error) {
      console.error("Error clearing tasks:", error);
      setError("Failed to clear tasks. Please try again.");
      fetchTasks();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex justify-center items-center font-todo">
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl border-t-4 border-indigo-500 transition-all hover:shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-indigo-700">To Do List</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded flex justify-between items-center">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="relative mb-6">
          <input
            type="text"
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-400"
            placeholder="Agregar una nueva tarea..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleNewTask}
          />
          <span className="absolute right-3 top-3 text-gray-400 text-sm">Presiona Enter</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-8">
            {/* Font Awesome spinner */}
            <i className="fas fa-spinner fa-spin text-indigo-500 text-2xl"></i>
          </div>
        ) : (
          <>
            <ul className="space-y-2 mb-6 max-h-80 overflow-y-auto task-list">
              {tasks.length === 0 ? (
                <li className="text-gray-500 text-center py-4">No hay tareas, agrega una nueva</li>
              ) : (
                tasks.map((task, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all task-item"
                  >
                    <span className="text-gray-800">{task}</span>
                    <button
                      onClick={() => handleDeleteTask(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-all"
                      aria-label="Delete task"
                    >
                      {/* Font Awesome trash icon */}
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </li>
                ))
              )}
            </ul>
            
            {tasks.length > 0 && (
              <div className="text-center">
                <button
                  onClick={clearAllTasks}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center mx-auto transition-all"
                >
                  {/* Font Awesome refresh icon */}
                  <i className="fas fa-sync-alt mr-2"></i>
                  Limpiar Todas las Tareas
                </button>
              </div>
            )}
          </>
        )}
        
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Tareas guardadas en la nube</p>
        </div>
      </div>
    </div>
  );
}