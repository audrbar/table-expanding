import React from 'react';

function App() {
    // Sample data with nested objects
    const data = [
        {
            id: 1,
            name: 'Category 1',
            items: [
                { id: 11, itemName: 'Item 1-1', quantity: 2 },
                { id: 12, itemName: 'Item 1-2', quantity: 1 },
                { id: 13, itemName: 'Item 1-3', quantity: 3 },
            ],
        },
        {
            id: 2,
            name: 'Category 2',
            items: [
                { id: 21, itemName: 'Item 2-1', quantity: 2 },
                { id: 22, itemName: 'Item 2-2', quantity: 1 },
            ],
        },
        {
            id: 3,
            name: 'Category 3',
            items: [
                { id: 31, itemName: 'Item 3-1', quantity: 1 },
                { id: 32, itemName: 'Item 3-2', quantity: 2 },
                { id: 33, itemName: 'Item 3-3', quantity: 4 },
                { id: 34, itemName: 'Item 3-4', quantity: 3 },
            ],
        },
    ];

    // Function to calculate the total row span for each category
    const calculateRowSpan = (category) =>
        category.items.reduce((acc, item) => acc + item.quantity, 0) + 1;

    return (
        <div>
            <table border="1">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Item ID</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((category) => (
                        <React.Fragment key={category.id}>
                            <tr>
                                <td rowSpan={calculateRowSpan(category)}>
                                    {category.name}
                                </td>
                                {/* Render the first item */}
                                <td>{category.items[0].id}</td>
                                <td>{category.items[0].itemName}</td>
                                <td>{category.items[0].quantity}</td>
                            </tr>
                            {/* Render the rest of the items */}
                            {category.items.slice(1).map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.itemName}</td>
                                    <td>{item.quantity}</td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
