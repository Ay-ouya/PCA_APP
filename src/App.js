import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';
import './media768.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { PairwiseComponentsPlot, CorrelationCircle } from './plots.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend);

function App() {
    const [file, setFile] = useState(null);
    const [datasetUrl, setDatasetUrl] = useState('');
    const [criteria, setCriteria] = useState('quality');
    const [dataSource, setDataSource] = useState('file');
    const [manualData, setManualData] = useState({
        individue_names: [],
        variable_names: [],
        data: [],
    });
    const [numIndividuals, setNumIndividuals] = useState(0);
    const [numVariables, setNumVariables] = useState(0);
    const [pcaType, setPcaType] = useState('Normed_PCA');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false); // Added loading state
    const [result, setResult] = useState({
        input_matrix_X: [],
        correlation_matrix_R: [],
        Standerdize_Reduced_matrix: [],
        explained_variance: [],
        sorted_eigenvectors: [],
        cumulative_variance: [],
        n_component: 0,
        principal_eigen_vectors: [],
        principal_eigen_values: [],
        principal_components_C: [],
        correlation_matrix: [],
        variable_names: [],
        individue_names: [],
    });

    const [result2, setResult2] = useState({
        Inputed_Data: [],
        Centered_Matrix: [],
        covariance_matrix: [],
        metric: [],
        explained_variance: [],
        sorted_eigenvectors: [],
        cumulative_variance: [],
        n_component: 0,
        principal_eigen_vectors: [],
        principal_eigen_values: [],
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

    const pcaOptions = [
        { value: 'Normed_PCA', label: 'Normalized' },
        { value: 'Non_normed_PCA_homogeneous', label: 'Non-Normalized (Homogeneous)' },
        { value: 'Non_normed_PCA_heterogeneous', label: 'Non-Normalized (Heterogeneous)' },
    ];

    useEffect(() => {
        const equations = [
            { id: 'equation1', formula: 'Z = \\frac{X - \\mu}{\\sigma}' },
            { id: 'equation_1', formula: 'X\' = X - g' },
            { id: 'equation2', formula: 'R = \\frac{1}{N} Z^t Z' },
            { id: 'equation3', formula: 'R = M^\\frac{1}{2} V M^\\frac{1}{2}' },
            { id: 'equation_2', formula: 'V = \\frac{1}{N} X^t X' },
            { id: 'equation_3', formula: 'M = I' },
            { id: 'equation_4', formula: 'M = D_\\frac{1}{\\sigma^2}' },
            { id: 'equation4', formula: 'Det(R-\\lambda I)=0' },
            { id: 'equation_5', formula: 'Det(VM -\\lambda I)=0' },
            { id: 'equation5_6', formula: 'Q_j = \\frac{\\sum_{i=1}^{j} \\lambda_i}{\\sum_{i=1}^{p} \\lambda_i} \\geq 80\\%' },
            { id: 'equation6', formula: 'R U_k = \\lambda_k U_k' },
            { id: 'equation7', formula: 'C_k = Z U_k' },
            { id: 'equation8', formula: 'Cor(X^j , C_k) = \\sqrt{\\lambda_k}  U_k^j' },
            { id: 'equation_7', formula: 'V M U_k = \\lambda_k U_k' },
            { id: 'equation_8', formula: 'C_k = X M U_k' },
            { id: 'equation_9', formula: 'U_k = \\cos^2(\\theta_{ik}) = \\frac{(C_k^i)^2}{\\parallel X_i \\parallel_M^2 }' },
            { id: 'equation_10', formula: 'p_{ik} = \\frac{p_i (C_k^i)^2}{\\lambda_k}' },
            { id: 'equation_11', formula: 'Cor(X^i , C_k) = \\frac{\\frac{1}{N} (X^i)^t C_k}{\\sigma_{X^i} \\sqrt{\\lambda_k}}' },
            { id: 'equation9', formula: '\\lambda_k \\geq 1' },
        ];

        equations.forEach(({ id, formula }) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '';
                const htmlString = katex.renderToString(formula, {
                    throwOnError: false,
                    displayMode: false,
                });
                element.innerHTML = htmlString;
            }
        });

        const handleClickOutside = (event) => {
            const dropdown = document.querySelector('.custom-dropdown');
            if (dropdown && !dropdown.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUrlChange = (e) => {
        setDatasetUrl(e.target.value);
    };

    const handleDataSourceChange = (e) => {
        setDataSource(e.target.value);
    };

    const resetAll = () => {
        setFile(null);
        setDatasetUrl('');
        setDataSource('file');
        setManualData({
            individue_names: [],
            variable_names: [],
            data: [],
        });
        setNumIndividuals(0);
        setNumVariables(0);
        setResult({
            input_matrix_X: [],
            correlation_matrix_R: [],
            Standerdize_Reduced_matrix: [],
            explained_variance: [],
            sorted_eigenvectors: [],
            cumulative_variance: [],
            n_component: 0,
            principal_eigen_vectors: [],
            principal_eigen_values: [],
            principal_components_C: [],
            correlation_matrix: [],
            variable_names: [],
            individue_names: [],
        });
        setResult2({
            Inputed_Data: [],
            Centered_Matrix: [],
            covariance_matrix: [],
            metric: [],
            explained_variance: [],
            sorted_eigenvectors: [],
            cumulative_variance: [],
            n_component: 0,
            principal_eigen_vectors: [],
            principal_eigen_values: [],
            principal_components_C: [],
            correlation_matrix: [],
            inertia_part: [],
            contribution_matrix: [],
            variable_names: [],
            individue_names: [],
        });
        setTest_statistic({
            mean_of_principal_components: [],
            variance_of_principal_components: [],
            covariance_of_principal_components: [],
            rounded_covariance: [],
            sorted_eigenvalues: [],
            diagonal_of_covariance_matrix: [],
            off_diagonal_elements: [],
        });
    };

    const handlePcaTypeChange = (value) => {
        setPcaType(value);
        setIsDropdownOpen(false);
        resetAll();
    };

    const handleCriteriaChange = (e) => {
        setCriteria(e.target.value);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
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
            const rawUrl = datasetUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
            formData.append('datasetUrl', rawUrl);
        } else if (dataSource === 'manual') {
            formData.append('individue_names', JSON.stringify(manualData.individue_names));
            formData.append('variable_names', JSON.stringify(manualData.variable_names));
            formData.append('data', JSON.stringify(manualData.data));
        }
        formData.append('pcaType', pcaType);
        formData.append('dataSource', dataSource);

        if (pcaType === 'Normed_PCA') {
            formData.append('criteria', criteria);
        }

        setLoading(true); // Start loading
        try {
            const response = await axios.post('https://youyaa.pythonanywhere.com/run-pca', formData, {
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
            alert('Failed to run PCA: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
        } finally {
            setLoading(false); // End loading
        }
    };

    const testPropStatistic = async (C, sorted_eigenvalues) => {
        try {
            const response = await axios.post('https://youyaa.pythonanywhere.com/test-statistic', {
                principal_components_C: C,
                sorted_eigenvalues: sorted_eigenvalues,
            });
            setTest_statistic(response.data);
        } catch (error) {
            console.error('Error testing statistic:', error);
        }
    };

    const renderMatrix = (matrix, title) => {
        if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
            return null;
        }

        const matrixRows = matrix.map(row => {
            if (!Array.isArray(row)) return ''; // Handle non-array rows
            return row.map(value => Number(value).toFixed(2)).join(' & ');
        }).join(' \\\\ ');

        const latexString = `
            ${title ? title + ' = ' : ''} 
            \\begin{pmatrix}
                ${matrixRows}
            \\end{pmatrix}
        `;

        const htmlString = katex.renderToString(latexString, {
            throwOnError: false,
            displayMode: false
        });

        return (
            <div className='matrix-container'>
                <div
                    className='renderMatrix'
                    dangerouslySetInnerHTML={{ __html: htmlString }}
                />
            </div>
        );
    };

    return (
        <Container className="App">
            <header className="App-header">
                <h1>Principal Component Analysis (PCA)</h1>
                <Form.Group className="pca-type">
                    <div className='type-select'>
                        <Form.Label className='title'>Select PCA Type :</Form.Label>
                        <div className="custom-dropdown">
                            <div className="dropdown-toggle options" onClick={toggleDropdown}>
                                {pcaOptions.find(option => option.value === pcaType)?.label || 'Select PCA Type'}
                            </div>
                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    {pcaOptions.map(option => (
                                        <div
                                            key={option.value}
                                            className="dropdown-option"
                                            onClick={() => handlePcaTypeChange(option.value)}
                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {pcaType === 'Normed_PCA' && (
                        <Form.Group className="criteria-selection">
                            <Form.Label className='title'>Select Criteria:</Form.Label>
                            <div className="criteria-options">
                                <Form.Check
                                    type="radio"
                                    label="Quality"
                                    value="quality"
                                    checked={criteria === 'quality'}
                                    onChange={handleCriteriaChange}
                                    className="custom-check"
                                    id="quality-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="Kaiser Criterion"
                                    value="kaiser"
                                    checked={criteria === 'kaiser'}
                                    onChange={handleCriteriaChange}
                                    className="custom-check"
                                    id="kaiser-radio"
                                />
                            </div>
                        </Form.Group>
                    )}
                </Form.Group>
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
                <Form onSubmit={handleSubmit}>
                    {dataSource === 'file' && (
                        <Form.Group controlId="formFile" className="upload">
                            <Form.Label className="title" htmlFor="fileInput">Upload Dataset (CSV) :</Form.Label>
                            <label htmlFor="fileInput" className="custom-file-upload">
                                Choose File
                            </label>
                            <label className='fileName'>
                                {file ? file.name : 'No file chose.'}
                            </label>
                            <Form.Control id='fileInput' className='FILE' type="file" onChange={handleFileChange} accept='.csv' />
                        </Form.Group>
                    )}

                    {dataSource === 'url' && (
                        <Form.Group controlId="formUrl" className="upload">
                            <Form.Label className='title'>Dataset URL :</Form.Label>
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
                        <Form.Group className="initial-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th className='tb-cont'>Ind \ Var</th>
                                        {Array.from({ length: numVariables }, (_, j) => (
                                            <th key={j}>
                                                {manualData.variable_names[j] || `V${j + 1}`}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: numIndividuals }, (_, i) => (
                                        <tr key={i}>
                                            <td>
                                                {manualData.individue_names[i] || `I${i + 1}`}
                                            </td>
                                            {Array.from({ length: numVariables }, (_, j) => (
                                                <td key={j} className='input-numbers'>
                                                    <Form.Control
                                                        type="number"
                                                        value={manualData.data[i]?.[j] || ''}
                                                        placeholder={`${manualData.variable_names[j] || `Var ${j + 1},${i + 1}`}`}
                                                        onChange={(e) => {
                                                            const newData = manualData.data.map((row) => [...row]);
                                                            if (!newData[i]) newData[i] = [];
                                                            newData[i][j] = e.target.value === '' ? '' : parseFloat(e.target.value);
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
                    <div className="run-button-container">
                        <Button className="run-button" role="button" type="submit">
                            Run PCA
                        </Button>
                    </div>
                </Form>
            </header>
            <main className='main-content'>
                <div className='description'>
                    <p>
                        Principal component analysis (PCA) is a dimensionality
                        reduction and machine learning method used to simplify
                        a large data set into a smaller set while still maintaining
                        significant patterns and trends.
                    </p>
                    <p className='pca-types-names'>
                        The are two types which are:
                        <p className='normalized'> Normalized PCA </p>
                        and
                        <p className='nonN'> Non-Normalized PCA </p>
                        where the first one focuses on
                        <p className='normalized'>the correlation</p>
                        between features, and the second focuses on
                        <p className='nonN'>the covariance</p>.
                    </p>
                </div>
                <div className='calculated-result'>
                    {loading ? (
                        <p>Loading PCA results...</p>
                    ) : (
                        <>
                            <div className='inputed-matrix'>
                                {pcaType === 'Normed_PCA' && renderMatrix(result.input_matrix_X, 'A')}
                                {(pcaType === 'Non_normed_PCA_homogeneous' || pcaType === 'Non_normed_PCA_heterogeneous') && 
                                    renderMatrix(result2.Inputed_Data, 'A')}
                            </div>
                            {pcaType === 'Normed_PCA' && (
                                <div className='Steps-normed-pca'>
                                    <div className='normal-std'>
                                        <h3>1. Normalization and Standardization : <span className='math' id="equation1"></span></h3>
                                        {renderMatrix(result.Standerdize_Reduced_matrix, 'Z')}
                                    </div>
                                    <div className='corr-mat'>
                                        <h3>2. Calculating Correlation Matrix : <span className='math' id="equation2"></span> or <span className='math' id='equation3'></span></h3>
                                        {renderMatrix(result.correlation_matrix_R, 'R')}
                                    </div>
                                    <div className='eigen-val'>
                                        <h3>3. Finding Eigen Values and Sorting them : <span className='math' id="equation4"></span></h3>
                                        <div className='math'
                                            dangerouslySetInnerHTML={{
                                                __html: katex.renderToString(
                                                    Array.isArray(result.explained_variance) && result.explained_variance.length > 0
                                                        ? result.explained_variance
                                                            .map((value, index) => `\\lambda_${index + 1} = ${(typeof value === 'number' ? value.toFixed(2) : value)}`)
                                                            .join(', ')
                                                        : 'No eigenvalues available',
                                                    {
                                                        throwOnError: false,
                                                        displayMode: false,
                                                    }
                                                ),
                                            }}
                                        />
                                    </div>
                                    <div className='qual'>
                                        <h3>4. Principal Axes using {criteria === 'quality' && (<span>Quality of representation : <span className='math' id="equation5_6"></span></span>)} {criteria === 'kaiser' && (<span>Kaiser Criterion : <span className='math' id="equation9"></span></span>)}</h3>
                                        <div className='math'>
                                            {criteria === 'quality' && (<span
                                                dangerouslySetInnerHTML={{
                                                    __html: katex.renderToString(
                                                        Array.isArray(result.cumulative_variance) && result.cumulative_variance.length > 0
                                                            ? result.cumulative_variance
                                                                .map((value, index) => `Q_${index + 1} = ${(typeof value === 'number' ? value.toFixed(2) : value)}`)
                                                                .join(', ')
                                                            : 'No cumulative variance available',
                                                        {
                                                            throwOnError: false,
                                                            displayMode: false,
                                                        }
                                                    ),
                                                }}
                                            />)}
                                            {Array.isArray(result.cumulative_variance) && result.cumulative_variance.length > 0 && (
                                                <div style={{ 'fontFamily': 'Times New Roman' }}>
                                                    {` There ${result.n_component > 1 ? 'are' : 'is'} ${result.n_component} principal axe${result.n_component > 1 ? 's' : ''} relative to `}
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: katex.renderToString(
                                                                Array.isArray(result.principal_eigen_values) && result.principal_eigen_values.length > 0
                                                                    ? result.principal_eigen_values
                                                                        .map((value, index) => `\\lambda_${index + 1} = ${(typeof value === 'number' ? value.toFixed(2) : value)}`)
                                                                        .join(', ')
                                                                    : 'No principal eigenvalues available',
                                                                {
                                                                    throwOnError: false,
                                                                    displayMode: false,
                                                                }
                                                            ),
                                                        }}
                                                        style={{ fontSize: '12px' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className='eigen-vect'>
                                        <h3>5. Calculating Eigen Vectors : <span className='math' id="equation6"></span></h3>
                                        {renderMatrix(result.sorted_eigenvectors, 'U_k')}
                                    </div>
                                    <div className='prin-comp'>
                                        <h3>6. Calculating the Principal Components : <span className='math' id="equation7"></span></h3>
                                        {renderMatrix(result.principal_components_C, 'C_k')}
                                    </div>
                                    <div className='visual'>
                                        <h3>Visualization: <em>(Individuals Representation and Correlation Circle)</em></h3>
                                        <PairwiseComponentsPlot principalComponents={result.principal_components_C} individueNames={result.individue_names} />
                                        <h4>Calculating the Correlation: <span className='math' id='equation8'></span></h4>
                                        {renderMatrix(result.correlation_matrix, 'Cor(X^i , C_k)')}
                                        <CorrelationCircle cor={result.correlation_matrix} variableNames={result.variable_names} className='correlation-circle-container' />
                                    </div>
                                </div>
                            )}
                            {(pcaType === 'Non_normed_PCA_homogeneous' || pcaType === 'Non_normed_PCA_heterogeneous') && (
                                <div className='Steps-non-normed-pca'>
                                    <div className='normal-std'>
                                        <h3>1. Normalization : <span className='math' id="equation_1"></span></h3>
                                        {renderMatrix(result2.Centered_Matrix, 'X')}
                                    </div>
                                    <div className='var-cov-mat'>
                                        <h3>2. Calculating the Variance-Covariance Matrix : <span className='math' id="equation_2"></span></h3>
                                        {renderMatrix(result2.covariance_matrix, 'V')}
                                    </div>
                                    <div className='metric'>
                                        <h3>3. Determining the Metric : {pcaType === 'Non_normed_PCA_homogeneous' && (<span className='math' id="equation_3"></span>)}{pcaType === 'Non_normed_PCA_heterogeneous' && (<span className='math' id="equation_4"></span>)}</h3>
                                        {renderMatrix(result2.metric, 'M')}
                                    </div>
                                    <div className='eigen-val'>
                                        <h3>4. Calculating Eigen Values and sorting them : <span className='math' id="equation_5"></span></h3>
                                        <div className='math'
                                            dangerouslySetInnerHTML={{
                                                __html: katex.renderToString(
                                                    Array.isArray(result2.explained_variance) && result2.explained_variance.length > 0
                                                        ? result2.explained_variance
                                                            .map((value, index) => `\\lambda_${index + 1} = ${(typeof value === 'number' ? value.toFixed(2) : value)}`)
                                                            .join(', ')
                                                        : 'No eigenvalues available',
                                                    {
                                                        throwOnError: false,
                                                        displayMode: false,
                                                    }
                                                ),
                                            }}
                                        />
                                    </div>
                                    <div className='qual'>
                                        <h3>5. Calculating the Quality of representation : <span className='math' id="equation5_6"></span></h3>
                                        <div className='math'>
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: katex.renderToString(
                                                        Array.isArray(result2.cumulative_variance) && result2.cumulative_variance.length > 0
                                                            ? result2.cumulative_variance
                                                                .map((value, index) => `Q_${index + 1} = ${(typeof value === 'number' ? value.toFixed(2) : value)}`)
                                                                .join(', ')
                                                            : 'No cumulative variance available',
                                                        {
                                                            throwOnError: false,
                                                            displayMode: false,
                                                        }
                                                    ),
                                                }}
                                            />
                                            {Array.isArray(result2.cumulative_variance) && result2.cumulative_variance.length > 0 && (
                                                <div style={{ fontFamily: 'Times New Roman' }}>
                                                    {` So there ${result2.n_component > 1 ? 'are' : 'is'} ${result2.n_component} principal axe${result2.n_component > 1 ? 's' : ''} relative to `}
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: katex.renderToString(
                                                                Array.isArray(result2.principal_eigen_values) && result2.principal_eigen_values.length > 0
                                                                    ? result2.principal_eigen_values
                                                                        .map((value, index) => `\\lambda_${index + 1} = ${(typeof value === 'number' ? value.toFixed(2) : value)}`)
                                                                        .join(', ')
                                                                    : 'No principal eigenvalues available',
                                                                {
                                                                    throwOnError: false,
                                                                    displayMode: false,
                                                                }
                                                            ),
                                                        }}
                                                        style={{ fontSize: '12px' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className='eigen-vect'>
                                        <h3>6. Calculating Eigen Vectors : <span className='math' id="equation_7"></span></h3>
                                        {renderMatrix(result2.sorted_eigenvectors, 'U_k')}
                                    </div>
                                    <div className='prin-comp'>
                                        <h3>7. Calculating the Principal Components : <span className='math' id="equation_8"></span></h3>
                                        {renderMatrix(result2.principal_components_C, 'C_k')}
                                    </div>
                                    <div className='visual'>
                                        <h3>8. Individuals Representation :</h3>
                                        <PairwiseComponentsPlot principalComponents={result2.principal_components_C} individueNames={result2.individue_names} />
                                    </div>
                                    <div className='inert-cont'>
                                        <h3>9. Inertia Contribution of <span className='math'
                                            dangerouslySetInnerHTML={{
                                                __html: katex.renderToString('X_i', { throwOnError: false, displayMode: false }),
                                            }}
                                        /> : <span className='math' id="equation_9" /></h3>
                                        {renderMatrix(result2.inertia_part, '\\cos^2 (\\theta_{ik})')}
                                    </div>
                                    <div className='cont-relat'>
                                        <h3>10. Relative Contribution : <span className='math' id='equation_10'></span></h3>
                                        {renderMatrix(result2.contribution_matrix, 'p_{ik}')}
                                    </div>
                                    <div className='visual'>
                                        <h3>11. Correlation Circle: <span className='math' id='equation_11'></span></h3>
                                        {renderMatrix(result2.correlation_matrix, 'Cor(X^i , C_k)')}
                                        <CorrelationCircle cor={result2.correlation_matrix} variableNames={result2.variable_names} className='correlation-circle-container' />
                                    </div>
                                </div>
                            )}
                            {(Array.isArray(result.explained_variance) && result.explained_variance.length > 0) && (
                                <Row className="test">
                                    <Col>
                                        <Button className='test-statistic' onClick={() => testPropStatistic(result.principal_components_C, result.explained_variance)}>
                                            Test Statistic
                                        </Button>
                                    </Col>
                                </Row>
                            )}
                            {(Array.isArray(result2.explained_variance) && result2.explained_variance.length > 0) && (
                                <Row className="test">
                                    <Col>
                                        <Button className='test-statistic' onClick={() => testPropStatistic(result2.principal_components_C, result2.explained_variance)}>
                                            Test Statistic
                                        </Button>
                                    </Col>
                                </Row>
                            )}
                            {(Array.isArray(test_statistic.mean_of_principal_components) && test_statistic.mean_of_principal_components.length > 0) && (
                                <Row className="test-results">
                                    <h2>Statistic Result</h2>
                                    <div className='math'
                                        dangerouslySetInnerHTML={{
                                            __html: katex.renderToString(
                                                test_statistic.mean_of_principal_components
                                                    .map((value, index) => `Mean(C_${index + 1}) = ${(typeof value === 'number' ? (Math.abs(value) < 1e-10 ? '0' : value.toFixed(2)) : value)}`)
                                                    .join(', '),
                                                {
                                                    throwOnError: false,
                                                    displayMode: true,
                                                }
                                            ),
                                        }}
                                    />
                                    <div className='stat'>
                                        {renderMatrix(test_statistic.variance_of_principal_components, 'V(C_k)')}
                                        {renderMatrix(test_statistic.rounded_covariance, 'Cov(C_i, C_j)')}
                                    </div>
                                </Row>
                            )}
                        </>
                    )}
                </div>
            </main>
        </Container>
    );
}

export default App;
