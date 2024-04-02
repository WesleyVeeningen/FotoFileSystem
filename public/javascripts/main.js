document.addEventListener('DOMContentLoaded', function () {
    const folderNames = document.querySelectorAll('.folder-name');

    folderNames.forEach(folder => {
        folder.addEventListener('click', async function () {
            const folderName = folder.textContent.trim(); // Extract the folder name from the clicked element
            const response = await fetch(`/files/${folderName}`); // Fetch files based on folder name
            const files = await response.json();
            displayFiles(files);
        });
    });

    function displayFiles(files) {
        const filesTableBody = document.getElementById('files-table-body');
        filesTableBody.innerHTML = '';

        files.forEach(file => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-gray-200');

            row.innerHTML = `
                    <td class="px-4 py-2"><img src="/uploads/${file.folder}/thumbnails/${file.name}" alt="Thumbnail" class="w-16 h-16 object-cover"></td>
                    <td class="px-4 py-2">${file.name}</td>
                    <td class="px-4 py-2">${file.fileType}</td>
                    <td class="px-4 py-2">${file.size} bytes</td>
                    <td class="px-4 py-2">${file.createdAt}</td>
                    <td class="px-4 py-2">${file.originDate ? file.originDate : '-'}</td>
                    <td class="px-4 py-2">
                        <a href="/uploads/${file.folder}/${file.name}" download class="text-blue-500 hover:text-blue-600 mr-2"><i class="fas fa-download"></i></a>
                        <button data-file-id="${file._id}" class="delete-button text-red-500 hover:text-red-600"><i class="fas fa-trash"></i></button>
                    </td>
                `;

            filesTableBody.appendChild(row);
        });

        // Show the files container
        document.getElementById('files-container').classList.remove('hidden');

        // Add event listeners to delete buttons
        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async function () {
                const fileId = button.dataset.fileId;
                if (confirm(`Are you sure you want to delete this file? ${fileId}`)) {
                    const response = await fetch(`/files/${fileId}`, { method: 'DELETE' });
                    const data = await response.json();
                    if (data.success) {
                        // Remove the deleted file row from the table
                        button.closest('tr').remove();
                    } else {
                        alert(data.message);
                    }
                }
            });
        });
    }

    // Select the Add Folder button
    const addFolderBtn = document.getElementById('add-folder-btn');

    // Add event listener to the Add Folder button
    addFolderBtn.addEventListener('click', async function () {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            try {
                const response = await fetch('/folders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: folderName })
                });
                const data = await response.json();
                if (data.success) {
                    // Folder added successfully, update the UI
                    // You may need to fetch the updated folder list and display it
                    console.log('Folder added successfully');
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error adding folder:', error);
                alert('An error occurred while adding the folder. Please try again.');
            }
        }
    });
});

// Add event listener to delete buttons for folders
document.addEventListener('DOMContentLoaded', function () {
    const deleteFolderButtons = document.querySelectorAll('.delete-folder-button');
    deleteFolderButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const folderId = button.dataset.folderId;
            if (confirm(`Are you sure you want to delete this folder?`)) {
                try {
                    const response = await fetch(`/folders/${folderId}`, { method: 'DELETE' });
                    const data = await response.json();
                    if (data.success) {
                        // Remove the deleted folder from the UI
                        button.closest('.folder').remove();
                    } else {
                        alert(data.message);
                    }
                } catch (error) {
                    console.error('Error deleting folder:', error);
                    alert('An error occurred while deleting the folder. Please try again.');
                }
            }
        });
    });
});
