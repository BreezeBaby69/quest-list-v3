import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function AchievementsPage() {
  const [allAchievements, setAllAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    axios.get('/api/achievements', { headers: { 'x-access-token': token } })
      .then(response => {
        setAllAchievements(response.data.all_achievements);
        setUserAchievements(response.data.user_achievements.map(ach => ach.id));
      })
      .catch(error => {
        console.error('Error fetching achievements:', error);
      });
  }, [token]);

  return (
    <div>
      <h2>Achievements</h2>
      <ul>
        {allAchievements.map(ach => (
          <li key={ach.id} style={{ color: userAchievements.includes(ach.id) ? 'gold' : 'black' }}>
            <h3>{ach.name}</h3>
            <p>{ach.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AchievementsPage;
