import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button, Modal } from 'flowbite-react'; // Flowbite digunakan untuk styling modal dll.

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
      // Hapus akun dari Firebase Authentication
      await deleteUser({ uid: selectedUser.uid });

      // Hapus data terkait pengguna dari Firestore (misalnya, komentar)
      await deleteUserData({ uid: selectedUser.uid });

      // Tutup modal dan reset user terpilih
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      
      // Refresh daftar pengguna
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
            <Button color="red" onClick={() => openDeleteModal(user)}>
              Hapus Akun
            </Button>
          </li>
        ))}
      </ul>

      {/* Modal konfirmasi hapus */}
      <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <Modal.Header>Konfirmasi Penghapusan</Modal.Header>
        <Modal.Body>
          <p>Apakah kamu yakin ingin menghapus akun <strong>{selectedUser?.email}</strong> dan semua data terkait?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setIsDeleteModalOpen(false)}>
            Batal
          </Button>
          <Button color="red" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Menghapus..." : "Hapus"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserList;
