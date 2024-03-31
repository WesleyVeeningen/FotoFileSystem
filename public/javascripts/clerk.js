// Get this URL and Publishable Key from the Clerk Dashboard
const clerkPublishableKey = 'pk_test_c3RpcnJlZC1zb2xlLTk4LmNsZXJrLmFjY291bnRzLmRldiQ';
const frontendApi = 'your-domain.clerk.accounts.dev'; // Replace 'your-domain' with your actual Clerk domain
const version = '@latest'; // Set to appropriate version

// Creates asynchronous script
const script = document.createElement('script');
script.setAttribute('data-clerk-frontend-api', frontendApi);
script.setAttribute('data-clerk-publishable-key', clerkPublishableKey);
script.async = true;
script.src = `https://${frontendApi}/npm/@clerk/clerk-js${version}/dist/clerk.browser.js`;

// Adds listener to initialize ClerkJS after it's loaded
script.addEventListener('load', async function () {
    await window.Clerk.load({
        // Set load options here...
    });
});
document.body.appendChild(script);
