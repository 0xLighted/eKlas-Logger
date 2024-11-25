export default async ({ req, res, log, error }) => {
    // Handle bundle.js request
    if (req.path === 'dist/bundle.js') {
        try {
            const fs = require('fs');
            const path = require('path');
            const bundleContent = fs.readFileSync(path.join(__dirname, 'dist', 'bundle.js'), 'utf8');
            log('worked?')
            return res.text(bundleContent, 200, {
                'Content-Type': 'application/javascript'
            });
        } catch (err) {
            log(err);
            return res.text('Error loading bundle', 500);
        }
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
    <script src="dist/bundle.js"></script>
    <script>
        renderApp({
            projectId: '${process.env.APPWRITE_FUNCTION_PROJECT_ID}',
            databaseId: 'Logger',
            collectionId: 'User'
        });
    </script>
</body>
</html>`;
    
    return res.text(html, 200, {
        'Content-Type': 'text/html'
    })
}