{/* <div id="ords-react-root"></div>
<script src="https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js">
</script> */}

const { useState, useEffect } = React;
function ORDSComponent() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('https://srv-mitta804:8282/ords/avilyst/avilystdata2/get_all/');
                if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
                const result = await response.json();
                setData(result);
            } catch (error) { setError(error); } finally { setLoading(false); }
        } fetchData();
    }, []);
    if (loading) return React.createElement('div', null, 'Loading...');
    if (error) return React.createElement('div', null, `Error: ${error.message}`);

    return React.createElement('div', null, React.createElement('h1', null, 'ORDS Data'),

        React.createElement('pre', null, JSON.stringify(data, null, 2)));
}

const rootDiv = document.getElementById('ords-react-root');
ReactDOM.render(React.createElement(ORDSComponent), rootDiv);
