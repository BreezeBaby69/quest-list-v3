import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [user, setUser] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/user', { headers: { 'x-access-token': token } });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/tasks', { headers: { 'x-access-token': token } });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchUser();
    fetchTasks();
  }, [token]);

  const addTask = (e) => {
    e.preventDefault();
    axios.post('/api/tasks', { title, description }, { headers: { 'x-access-token': token } })
      .then(response => {
        setTasks([...tasks, response.data]);
        setTitle('');
        setDescription('');
      })
      .catch(error => {
        console.error('Error adding task:', error);
      });
  };

  const completeTask = (id) => {
    axios.put(`/api/tasks/${id}`, { completed: true }, { headers: { 'x-access-token': token } })
      .then(response => {
        setTasks(tasks.map(task => task.id === id ? response.data : task));
        toast.success('Task completed! +10 XP, +5 Coins');
      })
      .catch(error => {
        console.error('Error completing task:', error);
      });
  };

  const deleteTask = (id) => {
    axios.delete(`/api/tasks/${id}`, { headers: { 'x-access-token': token } })
      .then(() => {
        setTasks(tasks.filter(task => task.id !== id));
      })
      .catch(error => {
        console.error('Error deleting task:', error);
      });
  };

  return (
    <div>
      {user && (
        <div>
          <h2>{user.username}'s Dashboard</h2>
          <p>Level: {user.level}</p>
          <p>XP: {user.xp}</p>
          <p>Coins: {user.currency}</p>
          <p>Streak: {user.streak} days</p>
        </div>
      )}
      <h1>Gamified To-Do List</h1>
      <form onSubmit={addTask}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
        />
        <button type="submit">Add Task</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            {!task.completed && <button onClick={() => completeTask(task.id)}>Complete</button>}
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskPage;
