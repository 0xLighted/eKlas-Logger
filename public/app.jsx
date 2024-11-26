import { useState, useEffect } from 'react';
import { Client, Databases } from 'appwrite';
import { DataList } from './components/DataList';

export const App = ({ config }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [syncStatus, setSyncStatus] = useState('synchronized');

    // Database connection
    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject(config.projectId);
    const database = new Databases(client);
    
    // Fetch all data from database
    const fetchData = async () => {
        try {
            const response = await database.listDocuments(
                config.databaseId,
                config.collectionId
            );
            setData(response.documents);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        console.log(data)
        // Subscribe to realtime updates
        const unsubscribe = client.subscribe(
            [`databases.${config.databaseId}.collections.${config.collectionId}.documents`],
            (response) => {
                // Handle different types of events
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    // Add new document to state
                    setData(prevData => [...prevData, response.payload]);
                }
                
                if (response.events.includes('databases.*.collections.*.documents.*.update')) {
                    // Update existing document in state
                    setData(prevData => 
                        prevData.map(doc => 
                            doc.$id === response.payload.$id ? response.payload : doc
                        )
                    );
                }
                
                if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
                    // Remove document from state
                    setData(prevData => 
                        prevData.filter(doc => doc.$id !== response.payload.$id)
                    );
                }
            }
        );

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, [config.databaseId, config.collectionId]);

    // Loaded state indicator
    
    useEffect(() => {
        const syncSubscribe = client.subscribe(['connected', 'disconnected'], (status) => {
            setSyncStatus(status.type === 'connected' ? 'synchronized' : 'syncing...');
        });

        return () => syncSubscribe();
    }, []);

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">My Appwrite Data</h1>
                <span className="text-sm text-gray-500">{syncStatus}</span>
            </div>
            <DataList data={data} />
        </div>
    );
};

export default App