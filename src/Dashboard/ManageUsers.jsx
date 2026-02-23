import { Table, Pagination } from 'flowbite-react';
import React, { useEffect, useState } from 'react';

const ManageUsers = () => {
  const [usersPage, setUsersPage] = useState({
    content: [],
    totalPages: 1,
    number: 0,
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const pageSize = 10; // số lượng user trên mỗi trang
  const token = localStorage.getItem("token");

  // fetch users theo trang
  const fetchUsers = async (page = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`https://https://book-management-backend-eghi.onrender.com/api/users?page=${page}&size=${pageSize}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsersPage(data);
    } catch (err) {
      console.error("Error loading users:", err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const res = await fetch(`https://https://book-management-backend-eghi.onrender.com/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      alert("User deleted successfully!");
      
      // Tính toán lại trang sau khi xóa
      const remainingItemsOnCurrentPage = content.length - 1;
      
      if (remainingItemsOnCurrentPage === 0 && currentPage > 0) {
        // Nếu không còn item nào trong trang hiện tại và không phải trang đầu tiên
        setCurrentPage(currentPage - 1);
      } else {
        // Refresh trang hiện tại
        fetchUsers(currentPage);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  const handleEdit = (userId, currentRole) => {
    setEditingUserId(userId);
    setNewRole(currentRole);
  };

  const handleUpdateRole = async () => {
    try {
      const res = await fetch(`https://https://book-management-backend-eghi.onrender.com/api/users/${editingUserId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Update failed");
      alert("Role updated successfully!");
      // refresh page
      fetchUsers(currentPage);
      setEditingUserId(null);
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Error updating role");
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setNewRole("");
  };

  // destructure để render an toàn
  const { content = [], totalPages = 1, number = 0 } = usersPage;

  if (loading && content.length === 0) {
    return (
      <div className="w-full max-w-[1180px] mx-auto flex flex-col items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <p className="text-gray-600 text-lg font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='px-4 my-12'>
      <h2 className='mb-8 text-3xl font-bold'>Manage Users</h2>

      {content.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <>
          <Table className='lg:w-[1180px]'>
            <Table.Head>
              <Table.HeadCell>No.</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {content.map((user, index) => (
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={user.id}>
                  <Table.Cell>{currentPage * pageSize + index + 1}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {user.username}
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    {editingUserId === user.id ? (
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                        disabled={loading}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="CUSTOMER">Customer</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="space-x-2">
                    {editingUserId === user.id ? (
                      <>
                        <button
                          onClick={handleUpdateRole}
                          className="bg-green-600 px-3 py-1 text-white rounded hover:bg-green-700 transition-colors"
                          disabled={loading}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-400 px-3 py-1 text-white rounded hover:bg-gray-500 transition-colors"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(user.id, user.role)}
                          className="bg-yellow-500 px-3 py-1 text-white rounded hover:bg-yellow-600 transition-colors"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-600 px-3 py-1 text-white rounded hover:bg-red-700 transition-colors"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center text-center mt-8">
              <Pagination
                currentPage={currentPage + 1}
                totalPages={totalPages}
                layout="pagination"
                nextLabel="Next"
                previousLabel="Prev"
                showIcons
                onPageChange={(page) => setCurrentPage(page - 1)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageUsers;