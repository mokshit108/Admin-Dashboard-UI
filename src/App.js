import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const pageSize = 10;

  useEffect(() => {
    axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then(response => {
        setUsers(response.data);
        setFilteredUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      Object.values(user).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users]);

  const indexOfLastUser = currentPage * pageSize;
  const indexOfFirstUser = indexOfLastUser - pageSize;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleSelectRow = id => {
    const selectedIndex = selectedRows.indexOf(id);
    if (selectedIndex > -1) {
      const newSelectedRows = [...selectedRows];
      newSelectedRows.splice(selectedIndex, 1);
      setSelectedRows(newSelectedRows);
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const handlePagination = page => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`button pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePagination(i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
      <>
        <button
          className={`button pagination-button ${isFirstPage ? 'disabled' : ''}`}
          onClick={() => handlePagination(1)}
          disabled={isFirstPage}
        >
          First
        </button>
        <button
          className={`button pagination-button ${isFirstPage ? 'disabled' : ''}`}
          onClick={() => handlePagination(currentPage - 1)}
          disabled={isFirstPage}
        >
          Previous
        </button>
        {getPageNumbers()}
        <button
          className={`button pagination-button ${isLastPage ? 'disabled' : ''}`}
          onClick={() => handlePagination(currentPage + 1)}
          disabled={isLastPage}
        >
          Next
        </button>
        <button
          className={`button pagination-button ${isLastPage ? 'disabled' : ''}`}
          onClick={() => handlePagination(totalPages)}
          disabled={isLastPage}
        >
          Last
        </button>
      </>
    );
  };

  const handleDeleteSelected = () => {
    const updatedUsers = filteredUsers.filter(user => !selectedRows.includes(user.id));
    setFilteredUsers(updatedUsers);
    setSelectedRows([]);
    // You might also want to perform any additional actions like making an API call to update the backend.
  };

  const [editableRowId, setEditableRowId] = useState(null);

const handleEdit = id => {
  setEditableRowId(id);
};

const handleSave = (id, newData) => {
  const updatedUsers = filteredUsers.map(user => {
    if (user.id === id) {
      return { ...user, ...newData };
    }
    return user;
  });

  setFilteredUsers(updatedUsers);
  setEditableRowId(null);
  // You might also want to perform any additional actions like making an API call to update the backend.
};

const handleEditChange = (id, field, value) => {
  const updatedUsers = filteredUsers.map(user => {
    if (user.id === id) {
      return { ...user, [field]: value };
    }
    return user;
  });

  setFilteredUsers(updatedUsers);
};

  // Implement other necessary functions for editing, deleting, and pagination

  return (
    <div className="container">
      <h1>User Management</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button className="button search-button" onClick={() => setSearchTerm('')}>
          Clear
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
            <th>
            <div className="delete-selected-container">
      <button
        className={`button delete-selected-button ${selectedRows.length === 0 ? 'disabled' : ''}`}
        onClick={handleDeleteSelected}
        disabled={selectedRows.length === 0}
      >
        Delete Selected
      </button>
    </div>
            </th>
          </tr>
        </thead>
        <tbody>
  {currentUsers.map(user => (
    <tr key={user.id}>
      <td>{user.id}</td>
      <td>
        {editableRowId === user.id ? (
          <input
            type="text"
            value={user.name}
            onChange={e => handleEditChange(user.id, 'name', e.target.value)}
          />
        ) : (
          user.name
        )}
      </td>
      <td>
        {editableRowId === user.id ? (
          <input
            type="text"
            value={user.email}
            onChange={e => handleEditChange(user.id, 'email', e.target.value)}
          />
        ) : (
          user.email
        )}
      </td>
      <td>
        {editableRowId === user.id ? (
          <input
            type="text"
            value={user.role}
            onChange={e => handleEditChange(user.id, 'role', e.target.value)}
          />
        ) : (
          user.role
        )}
      </td>
      <td>
        {editableRowId === user.id ? (
          <button className="button save-button" onClick={() => handleSave(user.id, user)}>
            Save
          </button>
        ) : (
          <button className="button edit-button" onClick={() => handleEdit(user.id)}>
            Edit
          </button>
        )}
      </td>
      <td>
        <input
          type="checkbox"
          checked={selectedRows.includes(user.id)}
          onChange={() => handleSelectRow(user.id)}
        />
      </td>
    </tr>
  ))}
</tbody>

      </table>
      <div className="pagination">
    
        {renderPagination()}
      </div>
    </div>
  );
};

export default App;