import React from 'react';
import Plot from 'react-plotly.js';

// Utility function to generate pairs of components
const generateComponentPairs = (nComponents) => {
  const pairs = [];
  for (let i = 0; i < nComponents; i++) {
    for (let j = i + 1; j < nComponents; j++) {
      pairs.push([i, j]);
    }
  }
  return pairs;
};

// Pairwise Components Plot Component
export function PairwiseComponentsPlot({ principalComponents, individueNames }) {
  if (!principalComponents || principalComponents.length === 0) return null;

  const nComponents = principalComponents[0].length;
  const pairs = generateComponentPairs(nComponents);

  return (
    <div className="plot-cont">
      {pairs.map(([x, y], index) => (
        <div className="plot-wrap" key={`pairwise-${x}-${y}`}>
          <center>
            <h4>U{x + 1} vs U{y + 1}</h4>
          </center>
          <Plot
            data={[
              {
                x: principalComponents.map((point) => point[x]),
                y: principalComponents.map((point) => point[y]),
                text: individueNames,
                mode: 'markers+text',
                type: 'scatter',
                marker: {
                  size: 10,
                  color: '#60A5FA', // Soft blue for markers
                  opacity: 0.8,
                  line: { color: '#1E293B', width: 1 }, // Dark slate outline
                },
                textposition: 'top center',
                textfont: { color: '#1E293B' }, // Dark slate for text
                hoverinfo: 'text',
                hovertemplate: '%{text}<br>(%{x:.2f}, %{y:.2f})<extra></extra>',
              },
            ]}
            layout={{
              title: {
                text: `U${x + 1} vs U${y + 1}`,
                font: { color: '#1E293B', size: 16 }, // Dark slate for title
              },
              xaxis: {
                title: { text: `U${x + 1}`, font: { color: '#1E293B' } },
                zeroline: true,
                zerolinewidth: 2,
                zerolinecolor: '#1E293B', // Dark slate for zeroline
                showgrid: true,
                gridcolor: '#58DAC6', // Muted teal for grid
                tickfont: { color: '#1E293B' },
              },
              yaxis: {
                title: { text: `U${y + 1}`, font: { color: '#1E293B' } },
                zeroline: true,
                zerolinewidth: 2,
                zerolinecolor: '#1E293B', // Dark slate for zeroline
                showgrid: true,
                gridcolor: '#58DAC6', // Muted teal for grid
                tickfont: { color: '#1E293B' },
              },
              showlegend: false,
              paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
              plot_bgcolor: 'rgba(0,0,0,0)', // Transparent plot background
              font: { color: '#1E293B' }, // Dark slate for all text
              margin: { t: 50, b: 50, l: 50, r: 50 },
              hovermode: 'closest',
            }}
            style={{ width: '100%', height: 'max-content' }}
            config={{ responsive: true }}
          />
        </div>
      ))}
    </div>
  );
}

// Correlation Circle Component
export function CorrelationCircle({ cor, variableNames }) {
  if (!cor || cor.length === 0) return null;

  const nComponents = cor[0].length;
  const pairs = generateComponentPairs(nComponents);

  return (
    <div className="plot-cont">
      {pairs.map(([x, y], index) => (
        <div className="plot-wrap" key={`correlation-${x}-${y}`}>
          <center>
            <h4>Correlation Circle: C{x + 1} vs C{y + 1}</h4>
          </center>
          <Plot
            data={[
              // Correlation vectors (arrows)
              ...cor.map((d, i) => ({
                x: [0, d[x]],
                y: [0, d[y]],
                mode: 'lines+markers',
                type: 'scatter',
                marker: {
                  size: 8,
                  symbol: 'arrow-bar-up', // Arrow marker
                  angleref: 'previous', // Aligns arrow with line direction
                  color: '#FF8787', // Soft coral for markers
                },
                line: { color: '#FF8787', width: 2 }, // Soft coral for lines
                text: ['', variableNames ? variableNames[i] : `Var ${i + 1}`],
                textposition: 'top center',
                hovertemplate: '(%{x:.4f}, %{y:.4f})<extra></extra>',
                name: variableNames ? variableNames[i] : `Var ${i + 1}`,
              })),
              // Text labels near vector tips
              {
                x: cor.map((d) => d[x] * 1.1),
                y: cor.map((d) => d[y] * 1.1),
                text: variableNames || cor.map((_, i) => `Var ${i + 1}`),
                mode: 'text',
                type: 'scatter',
                textposition: 'top center',
                textfont: { color: '#FF8787', size: 14 }, // Soft coral for labels
                showlegend: false,
              },
            ]}
            layout={{
              title: {
                text: `C${x + 1} vs C${y + 1}`,
                font: { color: '#1E293B', size: 16 }, // Dark slate for title
              },
              xaxis: {
                range: [-1.2, 1.2],
                title: { text: `C${x + 1}`, font: { color: '#1E293B' } },
                zeroline: true,
                zerolinewidth: 2,
                zerolinecolor: '#1E293B', // Dark slate for zeroline
                showgrid: true,
                gridcolor: '#58DAC6', // Muted teal for grid
                scaleanchor: 'y', // Enforce equal scaling
                tickfont: { color: '#1E293B' },
              },
              yaxis: {
                range: [-1.2, 1.2],
                title: { text: `C${y + 1}`, font: { color: '#1E293B' } },
                zeroline: true,
                zerolinewidth: 2,
                zerolinecolor: '#1E293B', // Dark slate for zeroline
                showgrid: true,
                gridcolor: '#58DAC6', // Muted teal for grid
                tickfont: { color: '#1E293B' },
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
                  line: { color: '#000000', width: 2 }, // Black for the unit circle
                },
                // Draw horizontal and vertical axis lines
                {
                  type: 'line',
                  x0: -1.2,
                  x1: 1.2,
                  y0: 0,
                  y1: 0,
                  line: { color: '#1E293B', width: 2 }, // Dark slate for axis line
                },
                {
                  type: 'line',
                  x0: 0,
                  x1: 0,
                  y0: -1.2,
                  y1: 1.2,
                  line: { color: '#1E293B', width: 2 }, // Dark slate for axis line
                },
              ],
              showlegend: true,
              paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
              plot_bgcolor: 'rgba(0,0,0,0)', // Transparent plot background
              font: { color: '#1E293B' }, // Dark slate for all text
              margin: { t: 50, b: 50, l: 50, r: 50 },
              hovermode: 'closest',
            }}
            style={{ width: '100%', height: '500px' }}
            config={{ responsive: true }}
          />
        </div>
      ))}
    </div>
  );
}
