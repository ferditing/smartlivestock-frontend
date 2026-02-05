// Handles logout logic using localStorage.
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  window.location.href = '/login';
};


