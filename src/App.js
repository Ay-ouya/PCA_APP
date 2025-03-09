import React, { useState } from 'react';
import Plot from "react-plotly.js";
import { Container, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Scatter } from 'react-chartjs-2';
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
        sorted_eigenvectors:[],
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
        sorted_eigenvectors:[],
        cumulative_variance: [],
        n_component: 0,
        principal_components_C: [],
        correlation_matrix: [],
        inertia_part: [],
        contribution_matrix: [],
        variable_names: [],
        individue_names: [],
    });

    const [test_statistic,setTest_statistic] = useState({
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
            <div>
                <h3>{title}</h3>
                <div style={{ alignItems: 'left', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2em', lineHeight: `${matrix.length * 1.5}em` }}>[</span>
                    <div style={{ display: 'inline-block' }}>
                        {matrix.map((row, rowIndex) => (
                            <div key={rowIndex} style={{ justifyContent: 'center' }}>
                                {row.map((value, colIndex) => (
                                    <span key={colIndex} style={{ margin: '0 5px', minWidth: '30px', textAlign: 'center' }}>
                                        {value.toFixed(2)}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                    <span style={{ fontSize: '2em', lineHeight: `${matrix.length * 1.5}em` }}>]</span>
                </div>
            </div>
        );
    };
    const renderTestStatisticMatrix = (matrix, title, decimals = 2) => {
        if (!Array.isArray(matrix) || matrix.length === 0) {
            return <p>No data available for {title}</p>;
        }
    
        return (
            <div>
                <h3>{title}</h3>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2em', lineHeight: `${matrix.length * 1.5}em` }}>[</span>
                    <div style={{ display: 'inline-block' }}>
                        {matrix.map((row, rowIndex) => (
                            <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center' }}>
                                {Array.isArray(row) ? (
                                    row.map((value, colIndex) => (
                                        <span key={colIndex} style={{ margin: '0 5px', minWidth: '50px', textAlign: 'center' }}>
                                            {typeof value === 'number' ? (Math.abs(value) < 1e-10 ? '0' : value.toFixed(decimals)) : value}
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ margin: '0 5px', minWidth: '50px', textAlign: 'center' }}>
                                        {typeof row === 'number' ? (Math.abs(row) < 1e-10 ? '0.00' : row.toFixed(decimals)) : row}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <span style={{ fontSize: '2em', lineHeight: `${matrix.length * 1.5}em` }}>]</span>
                </div>
            </div>
        );
    };

    const PairwiseComponentsPlot = ({ principalComponents, individueNames }) => {
        if (!principalComponents || principalComponents.length === 0) {
            return <p>No data available</p>;
        }
    
        const n_components = principalComponents[0].length; 
        const pairs = []; 
    
        for (let i = 0; i < n_components; i++) {
            for (let j = i + 1; j < n_components; j++) {
                pairs.push([i, j]);
            }
        }
    
        return (
            <Row>
                {pairs.map(([x, y], index) => (
                    <Col key={index} md={6}>
                        <h4>U{x + 1} vs U{y + 1}</h4>
                        <Scatter
                            data={{
                                datasets: [
                                    {
                                        label: 'Pairwise PCA Components',
                                        data: principalComponents.map((point, idx) => ({
                                            x: point[x],
                                            y: point[y],
                                            label: individueNames[idx], 
                                        })),
                                        backgroundColor: 'blue',
                                        pointRadius: 5,
                                        pointHoverRadius: 7,
                                    },
                                ],
                            }}
                            options={{
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => {
                                                return `${individueNames[context.dataIndex]}: (${context.raw.x.toFixed(2)}, ${context.raw.y.toFixed(2)})`;
                                            },
                                        },
                                    },
                                    datalabels: {
                                        // Configure the datalabels plugin
                                        color: 'black', // Label color
                                        anchor: 'center', // Position of the label relative to the point
                                        align: 'top', // Alignment of the label
                                        formatter: (value, context) => {
                                            return individueNames[context.dataIndex]; // Display individual names
                                        },
                                    },
                                },
                                scales: {
                                    x: {
                                        title: { display: true, text: `U${x + 1}` },
                                        grid: {
                                            drawBorder: true,
                                            color: (context) => (context.tick.value === 0 ? 'black' : '#e5e5e5'),
                                        },
                                    },
                                    y: {
                                        title: { display: true, text: `U${y + 1}` },
                                        grid: {
                                            drawBorder: true,
                                            color: (context) => (context.tick.value === 0 ? 'black' : '#e5e5e5'),
                                        },
                                    },
                                },
                            }}
                        />
                    </Col>
                ))}
            </Row>
        );
    };

    const CorrelationCircle = ({ cor, variableNames }) => {
        if (!cor || cor.length === 0) return <p>No correlation data available</p>;
    
        const n_components = cor[0].length; // Number of components
        const pairs = []; // Array to store all pairwise combinations
    
        // Generate all pairwise combinations
        for (let i = 0; i < n_components; i++) {
            for (let j = i + 1; j < n_components; j++) {
                pairs.push([i, j]);
            }
        }
    
        return (
            <Row>
                {pairs.map(([x, y], index) => (
                    <Col key={index} md={6}>
                        <h4>Correlation Circle: C{x + 1} vs C{y + 1}</h4>
                        <Plot
                            data={[
                                // Draw arrows
                                ...cor.map((d, i) => ({
                                    x: [0, d[x]],
                                    y: [0, d[y]],
                                    mode: 'lines+markers',
                                    type: 'scatter',
                                    marker: { size: 8, color: 'red' },
                                    line: { color: 'red', width: 2 },
                                    name: variableNames ? variableNames[i] : `Var ${i + 1}`,
                                })),
                                // Add text labels at the end of arrows
                                {
                                    x: cor.map((d) => d[x] * 1.1), // Offset labels slightly outward
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
                                title: `Correlation Circle: C${x + 1} vs C${y + 1}`,
                                xaxis: { range: [-1.5, 1.5], title: `C${x + 1}`, zeroline: true, showgrid: false },
                                yaxis: { range: [-1.5, 1.5], title: `C${y + 1}`, zeroline: true, showgrid: false },
                                shapes: [
                                    {
                                        type: 'circle',
                                        xref: 'x',
                                        yref: 'y',
                                        x0: -1,
                                        y0: -1,
                                        x1: 1,
                                        y1: 1,
                                        line: { color: 'blue' },
                                    },
                                ],
                                showlegend: true,
                            }}
                            style={{ width: '100%', height: '500px' }}
                        />
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <Container className="mt-5">
            <h1>Principal Component Analysis (PCA)</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Select Data Source</Form.Label>
                    <Form.Check
                        type="radio"
                        label="Upload File"
                        value="file"
                        checked={dataSource === 'file'}
                        onChange={handleDataSourceChange}
                    />
                    <Form.Check
                        type="radio"
                        label="Provide URL"
                        value="url"
                        checked={dataSource === 'url'}
                        onChange={handleDataSourceChange}
                    />
                    <Form.Check
                        type="radio"
                        label="Enter Data Manually"
                        value="manual"
                        checked={dataSource === 'manual'}
                        onChange={handleDataSourceChange}
                    />
                </Form.Group>
    
                
                {dataSource === 'file' && (
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Upload Dataset (CSV)</Form.Label>
                        <Form.Control type="file" onChange={handleFileChange} />
                    </Form.Group>
                )}
    
                {dataSource === 'url' && (
                    <Form.Group controlId="formUrl" className="mb-3">
                        <Form.Label>Dataset URL</Form.Label>
                        <Form.Control type="text" placeholder="Enter dataset URL" onChange={handleUrlChange} />
                    </Form.Group>
                )}
    
                {dataSource === 'manual' && (
                    <Form.Group className="mb-3">
                        <Form.Label>Number of Individuals</Form.Label>
                        <Form.Control
                            type="number"
                            value={numIndividuals}
                            onChange={(e) => setNumIndividuals(parseInt(e.target.value))}
                        />
                        <Form.Label>Number of Variables</Form.Label>
                        <Form.Control
                            type="number"
                            value={numVariables}
                            onChange={(e) => setNumVariables(parseInt(e.target.value))}
                        />
                    </Form.Group>
                )}
    
    {dataSource === 'manual' && numIndividuals > 0 && numVariables > 0 && (
        <Form.Group className="mb-3">
            
        
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
    
               
                <Form.Group className="mb-3">
                    <Form.Label>Select PCA Type</Form.Label>
                    <Form.Select value={pcaType} onChange={handlePcaTypeChange}>
                        <option value="Normed_PCA">Normed PCA</option>
                        <option value="Non_normed_PCA_homogeneous">Non-normed PCA (Homogeneous)</option>
                        <option value="Non_normed_PCA_heterogeneous">Non-normed PCA (Heterogeneous)</option>
                    </Form.Select>
                </Form.Group>
    
                <Button class="button-85" role="button" type="submit">
                    Run PCA
                </Button>
            </Form>
            {(result.explained_variance && result.explained_variance.length > 0) && (
    <Row className="mt-5">
        <Col>
            <h2>Results</h2>
            {renderMatrix(result.input_matrix_X, 'Input Matrix (X)')}
            {renderMatrix(result.Standerdize_Reduced_matrix, 'Standerdized and Reduced Matrix (Z)')}
            {renderMatrix(result.correlation_matrix_R, 'Correlation Matrix (R)')}
            <h3>Sorted Eigenvalues (λ) :</h3>
            <p>[
                {result.explained_variance
                    .map(value => (typeof value === 'number' ? value.toFixed(2) : value))
                    .join('   ,   ')}]
            </p>
            {renderMatrix(result.sorted_eigenvectors, 'Sorted Eigenvectors (Uk)')}
            <h3>Number of Principal Components : {result.n_component} </h3>
            <h3> The cumulative variance (Q) is :</h3>
            <p>[
                {result.cumulative_variance
                    .map(value => (typeof value === 'number' ? value.toFixed(2) : value))
                    .join('   ,   ')}]
            </p>
            {renderMatrix(result.principal_components_C, 'Principal Components (C)')}
            <h3>Visualization of Individuals</h3>
            <PairwiseComponentsPlot principalComponents={result.principal_components_C} individueNames={result.individue_names} />
            <h3>Visualization of Variables (Correlation Circle)</h3>
            <CorrelationCircle cor={result.correlation_matrix} variableNames={result.variable_names} />
            
            <Button onClick={() => testPropStatistic(result.principal_components_C, result.explained_variance)}>
                    Test Statistic
                </Button>
        </Col>
    </Row>
)}

{(result2.explained_variance && result2.explained_variance.length > 0) && (
    <Row className="mt-5">
        <Col>
            <h2>Results (Non-normed PCA )</h2>
            {renderMatrix(result2.Inputed_Data, 'Imputed Matrix ')}
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
    <Row className="mt-5">
        <Col>
            <h2>Test Statistic Results</h2>
            <h3>Mean of Principal Components</h3>
            <p>[
                {test_statistic.mean_of_principal_components
                    .map(value => (typeof value === 'number' ? (Math.abs(value) < 1e-10 ? '0' :value.toFixed(2)) : value))
                    .join('  ,   ')}]
            </p>
        
            {renderTestStatisticMatrix(test_statistic.variance_of_principal_components,'Variance Of Principal Components')}

            {renderTestStatisticMatrix(test_statistic.rounded_covariance, 'Covariance Matrix  of Principal Components:')}

            
            <h3>Sorted Eigenvalues</h3>
            <p>[
                {test_statistic.sorted_eigenvalues
                    .map(value => (typeof value === 'number' ? value.toFixed(2) : value))
                    .join('   ,   ')}]
            </p>

            <h3>Diagonal of Covariance Matrix</h3>
            <p>[
                {test_statistic.diagonal_of_covariance_matrix
                    .map(value => (typeof value === 'number' ? value.toFixed(2) : value))
                    .join('   ,    ')}]
            </p>

            <h3>Off-diagonal Elements</h3>
            <p>[
                {test_statistic.off_diagonal_elements
                    .map(value => (typeof value === 'number' ? (Math.abs(value) < 1e-10 ? '0' : value.toFixed(2) ) : value))
                    .join('   ,   ')}]
            </p>
        </Col>
    </Row>
)}
        </Container>
    );
}

export default App;