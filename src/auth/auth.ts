// Handles logout logic using localStorage.
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('assignedCounty');
  window.location.href = '/login';
};


