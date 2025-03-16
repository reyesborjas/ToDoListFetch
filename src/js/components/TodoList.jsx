import React, { useState, useEffect } from "react";
import '../../styles/ToDoList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSpinner, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const USER_NAME = "reyesborjas86";
const API_URL = `https://playground.4geeks.com/todo/todos`;

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
      setError(null);
      
      setTasks([]);
      
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Error al cargar las tareas. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  
  const addTask = async (taskText) => {
    try {
      setLoading(true);
      
    
      const response = await fetch(`${API_URL}/${USER_NAME}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: taskText,
          is_done: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const newTaskData = await response.json();
      console.log("Task created:", newTaskData);
      
    
      setTasks(prevTasks => [...prevTasks, newTaskData]);
      
      return newTaskData;
    } catch (error) {
      console.error("Error adding task:", error);
      setError("Error al añadir la tarea. Por favor, intenta nuevamente.");
      return null;
    } finally {
      setLoading(false);
    }
  };


  const updateTask = async (taskId, updatedData) => {
    try {
   
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const updatedTaskData = await response.json();
      console.log("Task updated:", updatedTaskData);
      
    
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTaskData : task
        )
      );
      
      return updatedTaskData;
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Error al actualizar la tarea. Por favor, intenta nuevamente.");
      return null;
    }
  };


  const deleteTask = async (taskId) => {
    try {

      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
    
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Error al eliminar la tarea. Por favor, intenta nuevamente.");
      return false;
    }
  };


  const handleNewTask = async (event) => {
    if (event.key === "Enter" && newTask.trim() !== "") {
      const taskText = newTask.trim();
      setNewTask(""); 
      
      await addTask(taskText);
    }
  };


  const handleToggleTask = async (task) => {
    const updatedData = {
      label: task.label,
      is_done: !task.is_done
    };
    
    await updateTask(task.id, updatedData);
  };

  
  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
  };

  
  const clearAllTasks = async () => {
    setLoading(true);
    
    try {
     
      const deletePromises = tasks.map(task => deleteTask(task.id));
      await Promise.all(deletePromises);
      
     
      setTasks([]);
    } catch (error) {
      console.error("Error clearing tasks:", error);
      setError("Error al eliminar todas las tareas. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar la lista de tareas
  const refreshTasks = () => {
    fetchTasks();
  };

  return (
    <div className="todo-container">
      <div className="todo-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 className="todo-title">To Do List</h1>
          <button onClick={refreshTasks} className="delete-btn" style={{ background: 'none', border: 'none' }}>
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="error-close-btn"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="input-container">
          <input
            type="text"
            className="task-input"
            placeholder="Agregar una nueva tarea..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleNewTask}
          />
          <span className="input-hint">Presiona Enter</span>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin className="spinner-icon" />
          </div>
        ) : (
          <>
            <ul className="task-list">
              {tasks.length === 0 ? (
                <li className="empty-list-message">No hay tareas, agrega una nueva</li>
              ) : (
                tasks.map(task => (
                  <li
                    key={task.id}
                    className={`task-item ${task.is_done ? 'task-completed' : ''}`}
                  >
                    <div 
                      className="task-text"
                      onClick={() => handleToggleTask(task)}
                      style={{ cursor: 'pointer' }}
                    >
                      {task.label}
                      {task.is_done && <span className="task-done-mark"> ✓</span>}
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="delete-btn"
                      aria-label="Delete task"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </li>
                ))
              )}
            </ul>
            
            {tasks.length > 0 && (
              <div className="clear-btn-container">
                <button
                  onClick={clearAllTasks}
                  className="clear-all-btn"
                >
                  <FontAwesomeIcon icon={faSyncAlt} className="sync-icon" />
                  Limpiar Todas las Tareas
                </button>
              </div>
            )}
          </>
        )}
        
        <div className="footer-text">
          <p>Tareas: {tasks.length} - Guardadas en la nube</p>
        </div>
      </div>
    </div>
  );
}