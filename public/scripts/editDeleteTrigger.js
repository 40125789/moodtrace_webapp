// deleteMood.js

async function deleteMood(selectedCardInfo) {
    return new Promise((resolve, reject) => {
        if (confirm("Are you sure you want to delete this record?")) {
            var moodId = selectedCardInfo.snapshot_id;
            fetch('/views/deletemood/' + moodId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete record');
                }
                // No need to return response.json(), as there may not be a response body for DELETE
                resolve();
            })
            .then(() => {
                console.log('Success: Record deleted successfully');
                // Only redirect after the deletion is successful
                window.location.href = '/history';
            })
            .catch(error => {
                console.error('Error:', error);
                reject(error);
            });
        } else {
            // If user cancels deletion
            reject(new Error('Deletion canceled by user'));
        }
    });
}




export { deleteMood };