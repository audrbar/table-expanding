import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Treemap,
} from 'recharts';
import {
    parse,
    format,
    differenceInHours,
    isValid,
    differenceInDays,
} from 'date-fns';

// Helper to parse the specific date format
const parseDate = (dateString) => {
    // ... (same as before)
    if (!dateString) return null;
    const cleanDateString = dateString.split(',')[0];
    try {
        const dt = parse(cleanDateString, 'yyyy.MM.dd HH:mm:ss', new Date());
        return isValid(dt) ? dt : null;
    } catch (e) {
        console.error(`Error parsing date: ${dateString}`, e);
        return null;
    }
};

const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82ca9d',
    '#ffc658',
    '#db2828',
    '#f2711c',
    '#fbbd08',
    '#b5cc18',
    '#21ba45',
    '#00b5ad',
    '#2185d0',
    '#6435c9',
    '#a333c8',
    '#e03997',
    '#a5673f',
];

const DataAnalyzerFile = () => {
    // Ensure initial state is an empty array
    const [parsedData, setParsedData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Function to handle file parsing ---
    const parseCsvFile = (file) => {
        setLoading(true);
        setError(null);
        setParsedData([]); // Reset to empty array before parsing
        setFileName(file.name);

        Papa.parse(file, {
            header: true,
            delimiter: ';',
            skipEmptyLines: true,
            complete: (results) => {
                console.log('Parsing complete.');
                if (results.errors.length > 0) {
                    console.error('CSV Parsing Errors:', results.errors);
                    setError(
                        `Errors occurred during CSV parsing in ${file.name}. Check console.`
                    );
                    setParsedData([]); // Ensure it's [] on error
                } else {
                    console.log('CSV Parsed Successfully.');
                    const processed = results.data
                        .map((row) => {
                            // ... (date parsing and duration calculation) ...
                            const createdDate = parseDate(row.CREATED_DATE);
                            const actionDate = parseDate(row.ACTION_DATE);
                            let durationDays = null;
                            let durationHours = null;

                            if (
                                createdDate &&
                                actionDate &&
                                isValid(createdDate) &&
                                isValid(actionDate) &&
                                actionDate >= createdDate
                            ) {
                                durationDays = differenceInDays(
                                    actionDate,
                                    createdDate
                                );
                                durationHours = differenceInHours(
                                    actionDate,
                                    createdDate
                                );
                            } // ... error handling ...

                            return {
                                ...row,
                                createdDateValid: createdDate,
                                actionDateValid: actionDate,
                                durationHours: durationHours,
                                durationDays: durationDays,
                            };
                        })
                        .filter(
                            (row) =>
                                row.ID && row.CREATED_DATE && row.ACTION_DATE
                        );

                    setParsedData(processed); // Set the processed array
                    setError(null);
                    if (processed.length === 0 && results.data.length > 0) {
                        setError(
                            `File ${file.name} parsed, but no valid data rows found for analysis.`
                        );
                    } else if (
                        processed.length === 0 &&
                        results.data.length === 0
                    ) {
                        setError(
                            `File ${file.name} parsed, but it appears to be empty.`
                        );
                    }
                }
                setLoading(false);
            },
            error: (err, file) => {
                console.error('PapaParse Error:', err);
                setError(
                    `Failed to parse file ${file?.name || 'selected file'}: ${
                        err.message
                    }`
                );
                setParsedData([]); // Ensure it's [] on error
                setLoading(false);
            },
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (
                file.type &&
                !file.type.includes('csv') &&
                !file.name.toLowerCase().endsWith('.csv')
            ) {
                setError(
                    `Invalid file type: "${file.type}". Please select a CSV file.`
                );
                setFileName(file.name);
                setParsedData([]); // Reset to empty array
                setLoading(false);
                event.target.value = null;
                return;
            }
            parseCsvFile(file);
        } else {
            setError(null);
            setFileName('');
            setParsedData([]); // Reset to empty array
            setLoading(false);
        }
        event.target.value = null;
    };

    const handleClearData = () => {
        setParsedData([]); // Reset to empty array
        setFileName('');
        setError(null);
        setLoading(false);
    };

    // --- Memoized calculations ---
    // --- Memoized calculations (remain the same, depend on parsedData) ---
    const monthlyCreations = useMemo(() => {
        // ... (same as before)
        if (!parsedData.length) return [];
        const counts = {};
        parsedData.forEach((row) => {
            if (row.createdDateValid) {
                const monthYear = format(row.createdDateValid, 'yyyy-MM');
                counts[monthYear] = (counts[monthYear] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }, [parsedData]);

    const durationStats = useMemo(() => {
        // ... (same as before, using durationDays)
        if (!parsedData.length)
            return { average: 0, median: 0, min: 0, max: 0, durations: [] };
        const durations = parsedData
            .map((row) => row.durationDays)
            .filter((d) => d !== null && d >= 0);

        if (!durations.length)
            return { average: 0, median: 0, min: 0, max: 0, durations: [] };

        durations.sort((a, b) => a - b);
        const sum = durations.reduce((acc, val) => acc + val, 0);
        const average = sum / durations.length;
        const mid = Math.floor(durations.length / 2);
        const median =
            durations.length % 2 !== 0
                ? durations[mid]
                : (durations[mid - 1] + durations[mid]) / 2;
        const min = durations[0];
        const max = durations[durations.length - 1];

        return { average, median, min, max, durations };
    }, [parsedData]);

    const durationHistogramData = useMemo(() => {
        // ... (same as before, using durationDays)
        if (!durationStats.durations.length) return [];
        const durations = durationStats.durations;
        const maxDuration = Math.max(...durations, 0);
        let binSize;
        let unit = 'day(s)';

        if (maxDuration <= 1) {
            binSize = 1;
            unit = 'day(s) (0-1)';
        } else if (maxDuration <= 14) {
            binSize = 1;
        } else if (maxDuration <= 60) {
            binSize = 7;
            unit = 'week(s)';
        } else if (maxDuration <= 365) {
            binSize = 30;
            unit = 'month(s)';
        } else {
            binSize = 90;
            unit = 'quarter(s)';
        }
        binSize = Math.max(binSize, 1);

        const bins = {};
        let maxBinValue = 0;

        durations.forEach((duration) => {
            const binIndex = Math.floor(duration / binSize);
            const binStart = binIndex * binSize;
            const binEnd = binStart + binSize - 1;
            const binName = unit.includes('day(s)')
                ? binSize === 1
                    ? `${binStart} day(s)`
                    : `${binStart}-${binEnd} days`
                : binSize === 7
                ? `Week ${binIndex + 1} (~${binStart}-${binEnd}d)`
                : `${binStart}-${binEnd} days`;
            bins[binName] = (bins[binName] || 0) + 1;
            maxBinValue = Math.max(maxBinValue, binStart);
        });

        const sortedBins = [];
        for (let i = 0; i <= maxBinValue; i += binSize) {
            const binStart = i;
            const binEnd = binStart + binSize - 1;
            const binName = unit.includes('day(s)')
                ? binSize === 1
                    ? `${binStart} day(s)`
                    : `${binStart}-${binEnd} days`
                : binSize === 7
                ? `Week ${
                      Math.floor(i / binSize) + 1
                  } (~${binStart}-${binEnd}d)`
                : `${binStart}-${binEnd} days`;
            sortedBins.push({ range: binName, count: bins[binName] || 0 });
        }

        if (maxDuration <= 1 && binSize === 1 && sortedBins.length > 1) {
            const combinedCount = sortedBins.reduce(
                (sum, bin) => sum + bin.count,
                0
            );
            return [{ range: `0-1 day(s)`, count: combinedCount }];
        } else if (maxDuration <= 1 && binSize === 1) {
            if (sortedBins.length === 0)
                return [{ range: '0 day(s)', count: 0 }];
            sortedBins[0].range = `0-1 day(s)`;
            return sortedBins;
        }

        return sortedBins;
    }, [durationStats]);

    const staffActivity = useMemo(() => {
        // ... (same as before, using durationDays)
        if (!parsedData.length) return { durations: [], counts: [] };
        const staffData = {};

        parsedData.forEach((row) => {
            if (
                row.STAFF &&
                row.durationDays !== null &&
                row.durationDays >= 0
            ) {
                if (!staffData[row.STAFF]) {
                    staffData[row.STAFF] = { totalDuration: 0, count: 0 };
                }
                staffData[row.STAFF].totalDuration += row.durationDays;
                staffData[row.STAFF].count += 1;
            }
        });

        const avgDurations = Object.entries(staffData)
            .map(([staff, data]) => ({
                staff,
                avgDurationDays:
                    data.count > 0 ? data.totalDuration / data.count : 0,
            }))
            .sort((a, b) => b.avgDurationDays - a.avgDurationDays);

        const counts = Object.entries(staffData)
            .map(([staff, data]) => ({
                staff,
                count: data.count,
            }))
            .sort((a, b) => b.count - a.count);

        return { durations: avgDurations, counts };
    }, [parsedData]);

    const actionTypeCounts = useMemo(() => {
        // ... (same as before)
        if (!parsedData.length) return [];
        const counts = {};
        parsedData.forEach((row) => {
            if (row.ACTION) {
                counts[row.ACTION] = (counts[row.ACTION] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [parsedData]);

    const registrationToActionDuration = useMemo(() => {
        // ... (same as before)
        if (!parsedData.length) return { average: 0, median: 0 };
        const durations = [];
        parsedData.forEach((row) => {
            const regDate = parseDate(row.REGISTRATION_DATE);
            const actionDate = row.actionDateValid;
            if (
                regDate &&
                actionDate &&
                isValid(regDate) &&
                isValid(actionDate)
            ) {
                const diffDays = differenceInDays(actionDate, regDate);
                if (diffDays >= 0) {
                    durations.push({
                        id: row.ID,
                        reference: row.REFERENCE,
                        regToActionDays: diffDays,
                    });
                }
            }
        });
        if (!durations.length) return { average: 0, median: 0 };
        const daysArray = durations
            .map((d) => d.regToActionDays)
            .sort((a, b) => a - b);
        const sum = daysArray.reduce((acc, val) => acc + val, 0);
        const average = sum / daysArray.length;
        const mid = Math.floor(daysArray.length / 2);
        const median =
            daysArray.length % 2 !== 0
                ? daysArray[mid]
                : (daysArray[mid - 1] + daysArray[mid]) / 2;
        return { average, median, data: durations };
    }, [parsedData]);

    console.log('Rendering DataAnalyzerFile - State:', {
        loading,
        error: error !== null,
        dataLength: parsedData?.length,
        parsedData,
    }); // Use optional chaining just in case

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
            <h1>Data Analysis Dashboard</h1>

            {/* --- File Input Section --- */}
            <div
                style={{
                    marginBottom: '20px',
                    padding: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                }}
            >
                {/* ... Input, label, button ... */}
                <label
                    htmlFor="csvFileInput"
                    style={{ marginRight: '10px', fontWeight: 'bold' }}
                >
                    Load CSV File:
                </label>
                <input
                    id="csvFileInput"
                    type="file"
                    accept=".csv, text/csv"
                    onChange={handleFileChange}
                    style={{ marginRight: '10px' }}
                    disabled={loading}
                />
                {(fileName || loading) && (
                    <button
                        onClick={handleClearData}
                        disabled={loading}
                        style={{ marginLeft: '10px' }}
                    >
                        Clear Data
                    </button>
                )}
                {fileName && !loading && (
                    <p
                        style={{
                            marginTop: '5px',
                            fontSize: '0.9em',
                            color: '#555',
                        }}
                    >
                        File: {fileName}
                    </p>
                )}
            </div>

            {/* --- Status Messages --- */}
            {loading && (
                <div style={{ color: 'blue', marginBottom: '15px' }}>
                    Parsing file, please wait...
                </div>
            )}
            {error && (
                <div
                    style={{
                        color: 'red',
                        marginBottom: '15px',
                        fontWeight: 'bold',
                    }}
                >
                    Error: {error}
                </div>
            )}

            {/* --- Charts Section (ADDED SAFETY CHECK: parsedData && ...) --- */}
            {!loading && !error && parsedData.length > 0 && (
                <>
                    <p>
                        Analyzed {parsedData.length} valid rows from {fileName}.
                    </p>

                    {/* Chart 1: Monthly Creations */}
                    <section
                        style={{
                            marginBottom: '40px',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '20px',
                        }}
                    >
                        <h2>Items Created Per Month</h2>
                        <p>Based on CREATED_DATE</p>
                        {monthlyCreations.length > 0 ? (
                            <ResponsiveContainer width="95%" height={300}>
                                <BarChart
                                    data={monthlyCreations}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="count"
                                        fill="#8884d8"
                                        name="Creations"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>
                                No valid creation dates found in the loaded
                                data.
                            </p>
                        )}
                    </section>

                    {/* Chart 2: Duration Distribution (Days) */}
                    <section
                        style={{
                            marginBottom: '40px',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '20px',
                        }}
                    >
                        <h2>Distribution of Processing Duration (Days)</h2>
                        <p>
                            Time difference between CREATED_DATE and
                            ACTION_DATE. Average:{' '}
                            {durationStats.average?.toFixed(1)} days, Median:{' '}
                            {durationStats.median?.toFixed(1)} days, Min:{' '}
                            {durationStats.min} days, Max: {durationStats.max}{' '}
                            days.
                        </p>
                        {durationHistogramData.length > 0 ? (
                            <ResponsiveContainer width="95%" height={300}>
                                <BarChart
                                    data={durationHistogramData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis
                                        label={{
                                            value: 'Number of Items',
                                            angle: -90,
                                            position: 'insideLeft',
                                        }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="count"
                                        fill="#82ca9d"
                                        name="Items in Duration Range"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No valid duration data found.</p>
                        )}
                    </section>

                    {/* Chart 3: Average Duration per Staff (Days) */}
                    <section
                        style={{
                            marginBottom: '40px',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '20px',
                        }}
                    >
                        <h2>Average Action Duration Per Staff (Days)</h2>
                        <p>
                            Average time from CREATED_DATE to ACTION_DATE per
                            staff member (Top 20 shown).
                        </p>
                        {staffActivity.durations.length > 0 ? (
                            <ResponsiveContainer width="95%" height={400}>
                                <BarChart
                                    data={staffActivity.durations.slice(0, 20)}
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 150,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis
                                        dataKey="staff"
                                        type="category"
                                        width={140}
                                    />
                                    <Tooltip
                                        formatter={(value) =>
                                            `${value.toFixed(1)} days`
                                        }
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="avgDurationDays"
                                        fill="#ffc658"
                                        name="Avg. Duration (Days)"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No staff duration data found.</p>
                        )}
                    </section>

                    {/* Additional Insights Section */}
                    <section>
                        <h2>Additional Insights</h2>
                        {/* Chart 4: Actions per Staff */}
                        <div style={{ marginBottom: '30px' }}>
                            <h3>Actions Per Staff Member (Top 20)</h3>
                            {staffActivity.counts.length > 0 ? (
                                <ResponsiveContainer width="95%" height={400}>
                                    <BarChart
                                        data={staffActivity.counts.slice(0, 20)}
                                        layout="vertical"
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 150,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                        />
                                        <YAxis
                                            dataKey="staff"
                                            type="category"
                                            width={140}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="count"
                                            fill="#8884d8"
                                            name="Action Count"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p>No staff activity data found.</p>
                            )}
                        </div>

                        {/* Chart 5: Action Type Distribution */}
                        <div style={{ marginBottom: '30px' }}>
                            <h3>Action Type Distribution</h3>
                            {actionTypeCounts.length > 0 ? (
                                <ResponsiveContainer width="95%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={actionTypeCounts}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }) =>
                                                `${name}: ${(
                                                    percent * 100
                                                ).toFixed(0)}%`
                                            }
                                        >
                                            {actionTypeCounts.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [
                                                `${value} (${(
                                                    (value /
                                                        parsedData.length) *
                                                    100
                                                ).toFixed(1)}%)`,
                                                name,
                                            ]}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p>No action data found.</p>
                            )}
                        </div>

                        {/* Other text-based insights */}
                        <div>
                            <h3>Further Analysis Opportunities</h3>
                            <p>
                                <strong>
                                    Registration to Action Duration:
                                </strong>
                                Average:{' '}
                                {registrationToActionDuration.average?.toFixed(
                                    1
                                )}{' '}
                                days, Median:{' '}
                                {registrationToActionDuration.median?.toFixed(
                                    1
                                )}{' '}
                                days.
                            </p>
                            {/* ... (other suggestions remain the same) ... */}
                            <ul>
                                <li>
                                    <strong>Lifecycle Analysis:</strong> Analyze
                                    time between consecutive actions for the
                                    *same* item/reference.
                                </li>
                                <li>
                                    <strong>Staff vs. Action Type:</strong>{' '}
                                    Stacked bar chart or heatmap.
                                </li>
                                <li>
                                    <strong>
                                        Workload Distribution Over Time:
                                    </strong>{' '}
                                    Plot actions per week/day.
                                </li>
                                <li>
                                    <strong>Correlation Analysis:</strong> Staff
                                    vs. duration (days).
                                </li>
                                <li>
                                    <strong>Outlier Detection:</strong>{' '}
                                    Investigate items with extreme durations
                                    (days).
                                </li>
                                <li>
                                    <strong>Reference Frequency:</strong>{' '}
                                    Actions per unique REFERENCE.
                                </li>
                                <li>
                                    <strong>Document Version Impact:</strong>{' '}
                                    Correlate DOC_VERSION_REF with time/action.
                                </li>
                            </ul>
                        </div>
                    </section>
                </>
            )}

            {/* --- Initial/Empty State Prompt (ADDED SAFETY CHECK: parsedData && ...) --- */}
            {!loading && !error && parsedData && parsedData.length === 0 && (
                <p>
                    Please select a CSV file using the input above to start the
                    analysis.
                </p>
            )}
        </div>
    );
};

export default DataAnalyzerFile;
