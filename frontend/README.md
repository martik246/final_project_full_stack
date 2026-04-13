# BookEase Frontend

I built the BookEase frontend with React and Vite. This workspace contains the client-side interface for authentication, booking, service browsing, slot management, and the role-based demo flow used in my project.

## Main Purpose

- provide the user interface for my BookEase project
- connect the frontend to the Django backend API
- support customer, staff, and admin interactions in one application

## Development

To run the frontend locally:

```bash
copy ..\\.env.dev ..\\.env
npm install
npm run dev
```

## Notes

- I use Vite for local development and fast rebuilds
- the frontend communicates with the backend through the API helpers in `src/api.js`
- the main UI flow is implemented in `src/App.jsx`
