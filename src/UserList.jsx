import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const functions = getFunctions();
    const listUsers = httpsCallable(functions, 'listUsers'); // Fungsi ini dipanggil dari Firebase Functions
    const result = await listUsers();
    setUsers(result.data.users);
    setLoading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const functions = getFunctions();
    const deleteUser = httpsCallable(functions, 'deleteUser');
    const deleteUserData = httpsCallable(functions, 'deleteUserData');

    if (selectedUser) {
      await deleteUser({ uid: selectedUser.uid });
      await deleteUserData({ uid: selectedUser.uid });
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    }
    setDeleting(false);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Daftar Akun Pengguna</h1>
      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.uid} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-md">
            <span>{user.email}</span>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded"
              onClick={() => openDeleteModal(user)}
            >
              Hapus Akun
            </button>
          </li>
        ))}
      </ul>

      {/* Modal Konfirmasi */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Konfirmasi Penghapusan</h2>
            <p>
              Apakah kamu yakin ingin menghapus akun <strong>{selectedUser?.email}</strong> dan semua data terkait?
            </p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Batal
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
