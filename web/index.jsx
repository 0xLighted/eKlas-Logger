import { createRoot } from 'react-dom/client';
import { App } from './app';

const renderApp = (config) => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<App config={config} />);
};
console.log("Render app in window context")
window.renderApp = renderApp;