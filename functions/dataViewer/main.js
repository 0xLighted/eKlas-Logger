import fs from 'fs';
import path from 'path';

function getFileStructure(dirPath, prefix = '') {
    let structure = '';

    try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });

        items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            const newPrefix = `${prefix}${isLast ? '    ' : '|   '}`;
            const icon = isLast ? '└─ ' : '|─ ';

            structure += `${prefix}${icon}${item.name}\n`;

            if (item.isDirectory()) {
                const subDirPath = path.join(dirPath, item.name);
                structure += getFileStructure(subDirPath, newPrefix);
            }
        });
    } catch (error) {
        console.error(`Error reading directory: ${dirPath}\n`, error);
    }

    return structure;
}

export default async ({ req, res, log, error }) => {
    // Handle bundle.js request
    if (req.path === 'dist/bundle.js') {
        try {
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
    console.log(getFileStructure('.'));

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
    <script src="./dist/bundle.js"></script>
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