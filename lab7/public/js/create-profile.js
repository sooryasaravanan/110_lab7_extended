document.getElementById('create-profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const uid = document.getElementById('uid').value;
    const displayName = document.getElementById('displayName').value;
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/create-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uid, displayName, email })
        });

        if (response.ok) {
            window.location.href = '/home';
        } else {
            console.error('Profile creation failed');
        }
    } catch (error) {
        console.error('Error creating profile:', error);
    }
});
