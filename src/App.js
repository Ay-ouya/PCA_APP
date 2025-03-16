import React, { useState } from 'react';
import Plot from "react-plotly.js";
import { Container, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';


ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend);

function App() {
    const [file, setFile] = useState(null);
    const [datasetUrl, setDatasetUrl] = useState('');
    const [dataSource, setDataSource] = useState('file');
    const [manualData, setManualData] = useState({
        individue_names: [],
        variable_names: [],
        data: [],
    })
    const [numIndividuals, setNumIndividuals] = useState(0);
    const [numVariables, setNumVariables] = useState(0);
    const [pcaType, setPcaType] = useState('Normed_PCA');
    const [result, setResult] = useState({
        input_matrix_X: [],
        correlation_matrix_R: [],
        Standerdize_Reduced_matrix: [],
        explained_variance: [],
        sorted_eigenvectors: [],
        cumulative_variance: [],
        n_component: 0,
        principal_components_C: [],
        correlation_matrix: [],
        variable_names: [],
        individue_names: [],
    });

    const [result2, setResult2] = useState({
        Inputed_Data: [],
        Centered_Matrix: [],
        covariance_matrix: [],
        explained_variance: [],
        sorted_eigenvectors: [],
        cumulative_variance: [],
        n_component: 0,
        principal_components_C: [],
        correlation_matrix: [],
        inertia_part: [],
        contribution_matrix: [],
        variable_names: [],
        individue_names: [],
    });

    const [test_statistic, setTest_statistic] = useState({
        mean_of_principal_components: [],
        variance_of_principal_components: [],
        covariance_of_principal_components: [],
        rounded_covariance: [],
        sorted_eigenvalues: [],
        diagonal_of_covariance_matrix: [],
        off_diagonal_elements: [],

    });

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUrlChange = (e) => {
        setDatasetUrl(e.target.value);
    };

    const handleDataSourceChange = (e) => {
        setDataSource(e.target.value);
    };

    const handlePcaTypeChange = (e) => {
        setPcaType(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (dataSource === 'file' && !file) {
            alert('Please upload a file first!');
            return;
        }
        if (dataSource === 'url' && !datasetUrl) {
            alert('Please provide a dataset URL!');
            return;
        }
        if (dataSource === 'manual' && (!manualData.data || manualData.data.length === 0)) {
            alert('Please enter data manually!');
            return;
        }

        const formData = new FormData();
        if (dataSource === 'file') {
            formData.append('file', file);
        } else if (dataSource === 'url') {
            // Ensure the URL is the raw file URL
            const rawUrl = datasetUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
            formData.append('datasetUrl', rawUrl);
        } else if (dataSource === 'manual') {
            formData.append('individue_names', JSON.stringify(manualData.individue_names));
            formData.append('variable_names', JSON.stringify(manualData.variable_names));
            formData.append('data', JSON.stringify(manualData.data));
        }
        formData.append('pcaType', pcaType);
        formData.append('dataSource', dataSource);

        try {
            const response = await axios.post('http://localhost:5000/run-pca', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log("Response from backend:", response.data);


            if (pcaType === 'Normed_PCA') {
                setResult(response.data);
                setResult2({});
            } else if (pcaType === 'Non_normed_PCA_homogeneous' || pcaType === 'Non_normed_PCA_heterogeneous') {
                setResult2(response.data);
                setResult({});
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const testPropStatistic = async (C, sorted_eigenvalues) => {
        try {
            const response = await axios.post('http://localhost:5000/test-statistic', {
                principal_components_C: C,
                sorted_eigenvalues: sorted_eigenvalues,
            });
            console.log("Test Statistic Results:", response.data);

            setTest_statistic(response.data);

            console.log("Updated test_statistic state:", response.data);
        } catch (error) {
            console.error('Error testing statistic:', error);
        }
    };

    const renderMatrix = (matrix, title) => {
        if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
            return <p>No data available for {title}</p>;
        }

        return (
            <div style={{ margin: '20px 0' }}>
                <h4 style={{ marginBottom: '10px' }}>{title}</h4>
                <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    padding: '0 15px'
                }}>
                    <div style={{
                        display: 'inline-grid',
                        gridTemplateColumns: `repeat(${matrix[0].length}, auto)`,
                        gap: '5px',
                        padding: '10px 5px',
                    }}>
                        {matrix.map((row, rowIndex) => (
                            row.map((value, colIndex) => (
                                <span
                                    key={`${rowIndex}-${colIndex}`}
                                    style={{
                                        minWidth: '50px',
                                        textAlign: 'right',
                                        padding: '2px 5px'
                                    }}
                                >
                                    {Number(value).toFixed(2)}
                                </span>
                            ))
                        ))}
                    </div>
                    {/* Left bracket */}
                    <div style={{
                        position: 'absolute',
                        left: '0',
                        top: '0',
                        height: '100%',
                        width: '20px',
                        border: '3px solid #000',
                        borderRight: 'none',
                        borderRadius: '1px',
                        borderTopLeftRadius: '75%',
                        borderBottomLeftRadius: '75%',
                    }}></div>
                    {/* Right bracket */}
                    <div style={{
                        position: 'absolute',
                        right: '0',
                        top: '0',
                        height: '100%',
                        width: '20px',
                        border: '3px solid #000',
                        borderLeft: 'none',
                        borderTopRightRadius: '75%',
                        borderBottomRightRadius: '75%',
                    }}></div>
                </div>
            </div>
        );
    };
    const renderTestStatisticMatrix = (matrix, title, decimals = 2) => {
        if (!Array.isArray(matrix) || matrix.length === 0) {
            return <p>No data available for {title}</p>;
        }

        return (
            <div style={{ margin: '20px 0' }}>
                <h3 style={{ marginBottom: '10px' }}>{title}</h3>
                <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    padding: '0 20px'
                }}>
                    <div style={{
                        display: 'inline-grid',
                        gridTemplateColumns: `repeat(${Array.isArray(matrix[0]) ? matrix[0].length : 1}, auto)`,
                        gap: '5px',
                        padding: '10px 5px',
                    }}>
                        {matrix.map((row, rowIndex) => (
                            Array.isArray(row) ? (
                                row.map((value, colIndex) => (
                                    <span
                                        key={`${rowIndex}-${colIndex}`}
                                        style={{
                                            minWidth: '50px',
                                            textAlign: 'center',
                                            padding: '2px 5px'
                                        }}
                                    >
                                        {typeof value === 'number' ?
                                            (Math.abs(value) < 1e-10 ? '0' : value.toFixed(decimals)) :
                                            value}
                                    </span>
                                ))
                            ) : (
                                <span
                                    key={rowIndex}
                                    style={{
                                        minWidth: '50px',
                                        textAlign: 'center',  // Changed from 'right' to 'center'
                                        padding: '2px 5px'
                                    }}
                                >
                                    {typeof row === 'number' ?
                                        (Math.abs(row) < 1e-10 ? '0' : row.toFixed(decimals)) :
                                        row}
                                </span>
                            )
                        ))}
                    </div>
                    {/* Left half-circle bracket */}
                    <div style={{
                        position: 'absolute',
                        left: '5px',
                        top: '0',
                        height: '100%',
                        width: '15px',
                        border: '2px solid #000',
                        borderRight: 'none',
                        borderTopLeftRadius: '50%',
                        borderBottomLeftRadius: '50%',
                    }}></div>
                    {/* Right half-circle bracket */}
                    <div style={{
                        position: 'absolute',
                        right: '5px',
                        top: '0',
                        height: '100%',
                        width: '15px',
                        border: '2px solid #000',
                        borderLeft: 'none',
                        borderTopRightRadius: '50%',
                        borderBottomRightRadius: '50%',
                    }}></div>
                </div>
            </div>
        );
    };
    const PairwiseComponentsPlot = ({ principalComponents, individueNames }) => {
        if (!principalComponents || principalComponents.length === 0) return <p>No data available</p>;
    
        const n_components = principalComponents[0].length;
        const pairs = [];
    
        for (let i = 0; i < n_components; i++) {
            for (let j = i + 1; j < n_components; j++) {
                pairs.push([i, j]);
            }
        }
    
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
                {pairs.map(([x, y], index) => (
                    <div key={index} style={{ width: '40%', minWidth: '400px' }}>
                       <center> <h4>U{x + 1} vs U{y + 1}</h4></center>
                        <Plot
                            data={[
                                {
                                    x: principalComponents.map((point) => point[x]),
                                    y: principalComponents.map((point) => point[y]),
                                    text: individueNames, // Display individual names
                                    mode: 'markers+text',
                                    type: 'scatter',
                                    marker: { size: 8, color: 'blue' },
                                    textposition: 'top center',
                                }
                            ]}
                            layout={{
                                title: `U${x + 1} vs U${y + 1}`,
                                xaxis: { title: `U${x + 1}`, zeroline: true, showgrid: true },
                                yaxis: { title: `U${y + 1}`, zeroline: true, showgrid: true },
                                showlegend: false,
                            }}
                            style={{ width: '100%', height: '400px' }}
                        />
                    </div>
                ))}
            </div>
        );
    };

    
    const CorrelationCircle = ({ cor, variableNames }) => {
        if (!cor || cor.length === 0) return <p>No correlation data available</p>;
    
        const n_components = cor[0].length;
        const pairs = [];
    
        for (let i = 0; i < n_components; i++) {
            for (let j = i + 1; j < n_components; j++) {
                pairs.push([i, j]);
            }
        }
    
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
                {pairs.map(([x, y], index) => (
                    <div key={index} style={{ width: '40%', minWidth: '400px' }}>
                        <center><h4>Correlation Circle: C{x + 1} vs C{y + 1}</h4></center>
                        <Plot
                            data={[
                                // Draw correlation vectors (arrows)
                                ...cor.map((d, i) => ({
                                    x: [0, d[x]],
                                    y: [0, d[y]],
                                    mode: 'lines+markers',
                                    type: 'scatter',
                                    marker: { 
                                        size: 8, 
                                        symbol: 'arrow-bar-up',  // Arrow marker
                                        angleref: 'previous',    // Aligns arrow with line directioncolor: 'red' 
                                        },
                                    line: { color: 'red', width: 2 },
                                    text: ['', variableNames ? variableNames[i] : `Var ${i + 1}`],
                                    textposition: 'top center',
                                    hovertemplate: '(%{x:.4f}, %{y:.4f})<extra></extra>',
                                    name: variableNames ? variableNames[i] : `Var ${i + 1}`,
                                })),
                                // Add text labels near vector tips
                                {
                                    x: cor.map((d) => d[x] * 1.1),
                                    y: cor.map((d) => d[y] * 1.1),
                                    text: variableNames || cor.map((_, i) => `Var ${i + 1}`),
                                    mode: 'text',
                                    type: 'scatter',
                                    textposition: 'top center',
                                    textfont: { color: 'red', size: 14 },
                                    showlegend: false,
                                },
                            ]}
                            layout={{
                                title: `C${x + 1} vs C${y + 1}`,
                                xaxis: {
                                    range: [-1.2, 1.2], 
                                    title: `C${x + 1}`,
                                    zeroline: true,
                                    zerolinewidth: 2,  // Make zero lines thicker
                                    zerolinecolor: "gray",
                                    showgrid: true,
                                    gridcolor: "#ddd",
                                    scaleanchor: "y",  // Enforce equal scaling
                                },
                                yaxis: {
                                    range: [-1.2, 1.2], 
                                    title: `C${y + 1}`,
                                    zeroline: true,
                                    zerolinewidth: 2,
                                    zerolinecolor: "gray",
                                    showgrid: true,
                                    gridcolor: "#ddd",
                                },
                                shapes: [
                                    // Draw unit circle to emphasize the correlation space
                                    {
                                        type: 'circle',
                                        xref: 'x',
                                        yref: 'y',
                                        x0: -1,
                                        y0: -1,
                                        x1: 1,
                                        y1: 1,
                                        line: { color: 'blue', width: 2 },
                                    },
                                    // Draw horizontal and vertical axis lines
                                    {
                                        type: "line",
                                        x0: -1.2, x1: 1.2, y0: 0, y1: 0,
                                        line: { color: "gray", width: 2 },
                                    },
                                    {
                                        type: "line",
                                        x0: 0, x1: 0, y0: -1.2, y1: 1.2,
                                        line: { color: "gray", width: 2 },
                                    }
                                ],
                                showlegend: true,
                            }}
                            style={{ width: '100%', height: '500px' }}
                        />
                    </div>
                ))}
            </div>
        );
    };
    
    
    return (
        <Container className="App">
            <h1>Principal Component Analysis <img src="/pca.png" alt="pca logo" /></h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="radio-buttons">
                    <Form.Label className='title'>Select Data Source</Form.Label>
                    <Form.Check
                        type="radio"
                        label="Upload File"
                        value="file"
                        checked={dataSource === 'file'}
                        onChange={handleDataSourceChange}
                        inline
                    />
                    <Form.Check
                        type="radio"
                        label="Provide URL"
                        value="url"
                        checked={dataSource === 'url'}
                        onChange={handleDataSourceChange}
                        inline
                    />
                    <Form.Check
                        type="radio"
                        label="Enter Data Manually"
                        value="manual"
                        checked={dataSource === 'manual'}
                        onChange={handleDataSourceChange}
                        inline
                    />
                </Form.Group>


                {dataSource === 'file' && (
                    <Form.Group controlId="formFile" className="upload">
                        <Form.Label className="title" htmlFor="fileInput">Upload Dataset (CSV)</Form.Label>
                        {/* <Form.Label className='title'>Upload Dataset (CSV)</Form.Label> */}
                        <label htmlFor="fileInput" className="custom-file-upload">
                            Choose File
                        </label>
                        <Form.Control id='fileInput' className='FILE' type="file" onChange={handleFileChange} />
                    </Form.Group>
                )}

                {dataSource === 'url' && (
                    <Form.Group controlId="formUrl" className="upload">
                        <Form.Label className='title'>Dataset URL</Form.Label>
                        <Form.Control className='url' type="text" placeholder="Enter dataset URL" onChange={handleUrlChange} />
                    </Form.Group>
                )}

                {dataSource === 'manual' && (
                    <Form.Group className="insert">
                        <Form.Label className='title'>Number of Individuals</Form.Label>
                        <Form.Control
                            type="number"
                            value={numIndividuals}
                            onChange={(e) => setNumIndividuals(parseInt(e.target.value))}
                        />
                        <Form.Label className='title'>Number of Variables</Form.Label>
                        <Form.Control
                            type="number"
                            value={numVariables}
                            onChange={(e) => setNumVariables(parseInt(e.target.value))}
                        />
                    </Form.Group>
                )}

{dataSource === 'manual' && numIndividuals > 0 && numVariables > 0 && (
                    // <Form.Group className="initial-table">
                    //     <table>
                    //         <thead>
                    //             <tr>
                    //                 <th>Individual \ Variables</th>
                    //                 {Array.from({ length: numVariables }, (_, j) => (
                    //                     <th key={j}>
                    //                         {manualData.variable_names[j] || `Variable ${j + 1}`}
                    //                     </th>
                    //                 ))}
                    //             </tr>
                    //         </thead>
                    //         <tbody>
                    //             {Array.from({ length: numIndividuals }, (_, i) => (
                    //                 <tr key={i}>
                    //                     <td>
                    //                         {manualData.individue_names[i] || `Individual ${i + 1}`}
                    //                     </td>
                    //                     {Array.from({ length: numVariables }, (_, j) => (
                    //                         <td key={j}>
                    //                             <Form.Control
                    //                                 type="number"
                    //                                 value={manualData.data[i]?.[j] || ''}
                    //                                 placeholder={`${manualData.variable_names[j] || `Var ${j + 1}`}`}
                    //                                 onChange={(e) => {
                    //                                     const newData = [...manualData.data];
                    //                                     if (!newData[i]) newData[i] = [];
                    //                                     newData[i][j] = e.target.value === '' ? '' : parseFloat(e.target.value);
                    //                                     setManualData({ ...manualData, data: newData });
                    //                                 }}
                    //                             />
                    //                         </td>
                    //                     ))}
                    //                 </tr>
                    //             ))}
                    //         </tbody>
                    //     </table>
                    // </Form.Group>


                    <Form.Group className="initial-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Individual \ Variables</th>
                                    {Array.from({ length: numVariables }, (_, j) => (
                                        <th key={j}>
                                            <Form.Control
                                                type="text"
                                                placeholder={`Variable ${j + 1}`}
                                                onChange={(e) => {
                                                    const newVariableNames = [...manualData.variable_names];
                                                    newVariableNames[j] = e.target.value;
                                                    setManualData({ ...manualData, variable_names: newVariableNames });
                                                }}
                                            />
                                            {/*`Variable ${j + 1}`*/}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>

                                {Array.from({ length: numIndividuals }, (_, i) => (
                                    <tr key={i}>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                placeholder={`Individual ${i + 1}`}
                                                onChange={(e) => {
                                                    const newNames = [...manualData.individue_names];
                                                    newNames[i] = e.target.value;
                                                    setManualData({ ...manualData, individue_names: newNames });
                                                }}
                                            />
                                            {/*`Individual ${i + 1}`*/}
                                        </td>
                                        {Array.from({ length: numVariables }, (_, j) => (
                                            <td key={j}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder={`Value for ${manualData.variable_names[j] || `Variable ${j + 1}`}`}
                                                    onChange={(e) => {
                                                        const newData = [...manualData.data];
                                                        if (!newData[i]) newData[i] = [];
                                                        newData[i][j] = parseFloat(e.target.value);
                                                        setManualData({ ...manualData, data: newData });
                                                    }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Form.Group>
                )}

                <Form.Group className="pca-type">
                    <Form.Label className='title'>Select PCA Type</Form.Label>
                    <Form.Select value={pcaType} onChange={handlePcaTypeChange} className='options'>
                        <option value="Normed_PCA">Normed PCA</option>
                        <option value="Non_normed_PCA_homogeneous">Non-normed PCA (Homogeneous)</option>
                        <option value="Non_normed_PCA_heterogeneous">Non-normed PCA (Heterogeneous)</option>
                    </Form.Select>
                </Form.Group>

                <div className="run-button-container">
                    <Button className="run-button" role="button" type="submit">
                        Run PCA
                    </Button>
                </div>
            </Form>
            {(result.explained_variance && result.explained_variance.length > 0) && (
                <Row className="results">
                    <Col>
                        <h2>Results</h2>
                        {renderMatrix(result.input_matrix_X, 'Input Matrix (X)')}
                    </Col>
                    <Col>
                        {renderMatrix(result.Standerdize_Reduced_matrix, 'Standerdized and Reduced Matrix (Z)')}
                        {renderMatrix(result.correlation_matrix_R, 'Correlation Matrix (R)')}
                        <h4>Sorted Eigenvalues (λ) :</h4>
                        <p>(
                            {result.explained_variance
                                .map(value => (typeof value === 'number' ? value.toFixed(2) : value))
                                .join('   ,   ')})
                        </p>
                        {renderMatrix(result.sorted_eigenvectors, 'Sorted Eigenvectors (Uk)')}
                        <h3>Number of Principal Components : {result.n_component} </h3>
                        <h3> The cumulative variance (Q) is :</h3>
                        <p>(
                            {result.cumulative_variance
                                .map(value => (typeof value === 'number' ? value.toFixed(2) : value))
                                .join('   ,   ')})
                        </p>
                        {renderMatrix(result.principal_components_C, 'Principal Components (C)')}
                        <h3>Visualization of Individuals</h3>
                        <PairwiseComponentsPlot principalComponents={result.principal_components_C} individueNames={result.individue_names} />
                        <h3>Visualization of Variables (Correlation Circle)</h3>
                        <CorrelationCircle cor={result.correlation_matrix} variableNames={result.variable_names} className='correlation-circle-container'/>

                        <Button onClick={() => testPropStatistic(result.principal_components_C, result.explained_variance)}>
                            Test Statistic
                        </Button>
                    </Col>
                </Row>
            )}

            {(result2.explained_variance && result2.explained_variance.length > 0) && (
                <Row className="results">
                    <Col>
                        <h2>Results (Non-normed PCA )</h2>
                        {renderMatrix(result2.Inputed_Data, 'Inputed Matrix:')}
                        {renderMatrix(result2.Centered_Matrix, 'Centered Matrix (X)')}
                        {renderMatrix(result2.covariance_matrix, 'Variance Covariance Matrix (V)')}
                        <h3>Sorted Eigenvalues (λ) :</h3>
                        <p>[
                            {result2.explained_variance
                                .map(value => (typeof value === 'number' ? value.toFixed(2) : value))
                                .join('   ,   ')}]
                        </p>
                        {renderMatrix(result2.sorted_eigenvectors, 'Sorted Eigenvectors (Uk)')}
                        <h3>Number of Principal Components : {result2.n_component} </h3>
                        <h3> The cumulative variance (Q) is :</h3>
                        <p>[
                            {result2.cumulative_variance
                                .map(value => (typeof value === 'number' ? value.toFixed(2) : value))
                                .join('   ,   ')}]
                        </p>
                        {renderMatrix(result2.principal_components_C, 'Principal Components (C)')}
                        {renderMatrix(result2.correlation_matrix, 'Correlation Matrix')}
                        {renderMatrix(result2.inertia_part, 'Inertia Part')}
                        {renderMatrix(result2.contribution_matrix, 'Contribution Matrix')}
                        <h3>Visualization of Individuals</h3>
                        <PairwiseComponentsPlot principalComponents={result2.principal_components_C} individueNames={result2.individue_names} />
                        <h3>Visualization of Variables (Correlation Circle)</h3>
                        <CorrelationCircle cor={result2.correlation_matrix} variableNames={result2.variable_names} />
                        <Button onClick={() => testPropStatistic(result2.principal_components_C, result2.explained_variance)}>
                            Test Statistic
                        </Button>
                    </Col>
                </Row>
            )}

            {(test_statistic.mean_of_principal_components && test_statistic.mean_of_principal_components.length > 0) && (
                <Row className="results">
                    <Col>
                        <h2>Test Statistic Results</h2>
                        <h3>Mean of Principal Components</h3>
                        <p>(
                            {test_statistic.mean_of_principal_components
                                .map(value => (typeof value === 'number' ? (Math.abs(value) < 1e-10 ? '0' : value.toFixed(2)) : value))
                                .join('  ,   ')})
                        </p>

                        {renderTestStatisticMatrix(test_statistic.variance_of_principal_components, 'Variance Of Principal Components')}
                        {renderTestStatisticMatrix(test_statistic.rounded_covariance, 'Covariance Matrix  of Principal Components:')}


                        <h4>Sorted Eigenvalues</h4>
                        <p>(
                            {test_statistic.sorted_eigenvalues
                                .map(value => (typeof value === 'number' ? value.toFixed(2) : value))
                                .join('   ,   ')})
                        </p>

                        <h3>Diagonal of Covariance Matrix</h3>
                        <p>(
                            {test_statistic.diagonal_of_covariance_matrix
                                .map(value => (typeof value === 'number' ? value.toFixed(2) : value))
                                .join('   ,    ')})
                        </p>

                        <h3>Off-diagonal Elements</h3>
                        <p>(
                            {test_statistic.off_diagonal_elements
                                .map(value => (typeof value === 'number' ? (Math.abs(value) < 1e-10 ? '0' : value.toFixed(2)) : value))
                                .join('   ,   ')})
                        </p>
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export default App;
