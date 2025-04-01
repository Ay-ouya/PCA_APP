import React from 'react';
import Plot from 'react-plotly.js';

export function PairwiseComponentsPlot({ principalComponents, individueNames }) {
    if (!principalComponents || principalComponents.length === 0) return;

    const n_components = principalComponents[0].length;
    const pairs = [];

    for (let i = 0; i < n_components; i++) {
        for (let j = i + 1; j < n_components; j++) {
            pairs.push([i, j]);
        }
    }

    return (
        <div className='plot-cont'>
            {pairs.map(([x, y], index) => (
                <div className='plot-wrap' key={index}>
                    <center> <h4>U{x + 1} vs U{y + 1}</h4></center>
                    <Plot
                        data={[
                            {
                                x: principalComponents.map((point) => point[x]),
                                y: principalComponents.map((point) => point[y]),
                                text: individueNames, // Display individual names
                                mode: 'markers+text',
                                type: 'scatter',
                                marker: { size: 8, color: '#f9e6ad' },
                                textposition: 'top center',
                            }
                        ]}
                        layout={{
                            title: `U${x + 1} vs U${y + 1}`,
                            xaxis: { title: { text: `U${x + 1}` }, zeroline: true, zerolinewidth: 2,showgrid: true, gridcolor: '#e7cd7e', zerolinecolor: 'white', },
                            yaxis: { title: { text: `U${y + 1}` }, zeroline: true, zerolinewidth: 2, showgrid: true, gridcolor: '#e7cd7e', zerolinecolor: 'white', },
                            showlegend: false,
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#d7b137' },
                        }}
                        style={{ width: '100%', height:'max-content'}}
                    />
                </div>
            ))}
        </div>
    );
};


export function CorrelationCircle({ cor, variableNames }) {
    if (!cor || cor.length === 0) return;

    const n_components = cor[0].length;
    const pairs = [];

    for (let i = 0; i < n_components; i++) {
        for (let j = i + 1; j < n_components; j++) {
            pairs.push([i, j]);
        }
    }

    return (
        <div className='plot-cont'>
            {pairs.map(([x, y], index) => (
                <div className='plot-wrap' key={index}>
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
                                line: { color: '#de833b', width: 2 },
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
                                textfont: { color: '#de833b', size: 14 },
                                showlegend: false,
                            },
                        ]}
                        layout={{
                            title: `C${x + 1} vs C${y + 1}`,
                            xaxis: {
                                range: [-1.2, 1.2],
                                title: {text: `C${x + 1}`} ,
                                zeroline: true,
                                zerolinewidth: 2, 
                                zerolinecolor: "white",
                                showgrid: true,
                                gridcolor: '#e7cd7e',
                                scaleanchor: "y",  // Enforce equal scaling
                            },
                            yaxis: {
                                range: [-1.2, 1.2],
                                title: {text: `C${y + 1}`},
                                zeroline: true,
                                zerolinewidth: 2,
                                zerolinecolor: "white",
                                showgrid: true,
                                gridcolor: '#e7cd7e',
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
                                    line: { color: '#f6e2d5', width: 2 },
                                },
                                // Draw horizontal and vertical axis lines
                                {
                                    type: "line",
                                    x0: -1.2, x1: 1.2, y0: 0, y1: 0,
                                    line: { color: "white", width: 2 },
                                },
                                {
                                    type: "line",
                                    x0: 0, x1: 0, y0: -1.2, y1: 1.2,
                                    line: { color: "white", width: 2 },
                                }
                            ],
                            showlegend: true,
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#d7b137' },
                        }}
                        style={{ width: '100%', height: '500px' }}
                    />
                </div>
            ))}
        </div>
    );
};