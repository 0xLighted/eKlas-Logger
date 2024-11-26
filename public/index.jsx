import { createRoot } from 'react-dom/client';
import { App } from './app';

const renderApp = (config) => {
    const root = createRoot(document.getElementById('root'));
    root.render(<App config={config} />);
};
console.log("Render app in window context")
window.renderApp = renderApp;