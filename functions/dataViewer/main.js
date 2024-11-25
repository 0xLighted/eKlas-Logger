import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../web/app.jsx';

export default ({ req, res, log, error }) => {
    if (req.method != 'GET' || req.path != '/') {
        error('Method not allowed: ' + req.method);
        return res.json({success: false, message: "Method not allowed, Please send GET"});
      }
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appwrite React App</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root"></div>
    <script src="bundle.js"></script>
    <script>
        const container = document.getElementById('root');
        const root = createRoot(container);
        root.render(<App config={
            endpoint: '${process.env.APPWRITE_FUNCTION_ENDPOINT}',
            projectId: '${process.env.APPWRITE_FUNCTION_PROJECT_ID}',
            databaseId: '${process.env.DATABASE_ID}',
            collectionId: '${process.env.COLLECTION_ID}'
        } />);
    </script>
</body>
</html>`;
    
    return res.text(html, 200, {
        'Content-Type': 'text/html'
    })
}