import React, { useState, useEffect } from "react";


const USER_NAME = "reyesborjas86";
const API_URL = `https://playground.4geeks.com/todo/todos/${USER_NAME}`;

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchTodos();
  }, []);


  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      
      if (response.status === 404) {
        setTodos([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError("Failed to load todos. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const updateTodosOnServer = async (updatedTodos) => {
    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        body: JSON.stringify(updatedTodos),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

   
    } catch (error) {
      console.error("Error updating todos:", error);
      setError("Failed to update todos. Please try again.");
 
      fetchTodos();
    }
  };


  const addTodo = async (e) => {
    e.preventDefault();
    
    if (!newTodo.trim()) return;
    
    const todoItem = { label: newTodo.trim(), done: false };
    const updatedTodos = [...todos, todoItem];
    
   
    setTodos(updatedTodos);
    setNewTodo("");
    
    
    await updateTodosOnServer(updatedTodos);
  };

  // Function to remove a todo
  const removeTodo = async (index) => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    
 
    setTodos(updatedTodos);
    
 
    await updateTodosOnServer(updatedTodos);
  };


  const clearAllTodos = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

    
      setTodos([]);
    } catch (error) {
      console.error("Error clearing todos:", error);
      setError("Failed to clear todos. Please try again.");
 
      fetchTodos();
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Todo List</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            type="button" 
            className="close" 
            onClick={() => setError(null)}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-body">
       
          <form onSubmit={addTodo} className="mb-3 d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Add new todo..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </form>

         
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
             
              {todos.length === 0 ? (
                <p className="text-center">No todos yet. Add one above!</p>
              ) : (
                <ul className="list-group">
                  {todos.map((todo, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {todo.label}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeTodo(index)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

            
              {todos.length > 0 && (
                <div className="text-center mt-3">
                  <button
                    className="btn btn-warning"
                    onClick={clearAllTodos}
                  >
                    Clear All Todos
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TodoList;