// // Font Generator - Client-Side JavaScript

// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('generator-form');
//   const fontInput = document.getElementById('font-input');
//   const resultsContainer = document.getElementById('results');

//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const fontName = fontInput.value.trim();
//     if (!fontName) {
//       displayError('Please enter a font name');
//       return;
//     }

//     // Show loading state
//     resultsContainer.innerHTML = '<div class="loading" data-testid="text-loading">Generating recommendations...</div>';
//     resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

//     try {
//       const response = await fetch(`/api/recommend?font=${encodeURIComponent(fontName)}`);
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch recommendations');
//       }

//       const data = await response.json();
//       displayResults(data);
//     } catch (error) {
//       displayError('Unable to generate recommendations. Please try again.');
//       console.error('Error:', error);
//     }
//   });

//   function displayResults(data) {
//     if (!data.recommendations || data.recommendations.length === 0) {
//       resultsContainer.innerHTML = `
//         <div class="results-header">
//           <h3 class="results-title">No Recommendations Found</h3>
//           <p class="results-subtitle">Try searching for a different font name</p>
//         </div>
//       `;
//       return;
//     }

//     const resultsHTML = `
//       <div class="results-header">
//         <h3 class="results-title" data-testid="text-results-title">Recommendations Based on "${data.basedOn}"</h3>
//         <p class="results-subtitle" data-testid="text-results-count">We found ${data.recommendations.length} perfect matches for you</p>
//       </div>
//       <div class="font-grid" data-testid="grid-recommendations">
//         ${data.recommendations.map((font, index) => createFontCard(font, index)).join('')}
//       </div>
//     `;

//     resultsContainer.innerHTML = resultsHTML;
//   }

//   function createFontCard(font, index) {
//     const pairsHTML = font.pairsWith && font.pairsWith.length > 0
//       ? `
//         <div class="font-pairs">
//           <div class="font-pairs-label">Pairs Well With</div>
//           <div class="font-pairs-list">${font.pairsWith.join(', ')}</div>
//         </div>
//       `
//       : '';

//     return `
//       <div class="font-card" data-testid="card-font-${index}">
//         <div class="font-name" style="font-family: '${font.name}', ${font.category === 'serif' ? 'serif' : 'sans-serif'};" data-testid="text-font-name-${index}">
//           ${font.name}
//         </div>
//         <span class="font-category" data-testid="text-font-category-${index}">${font.category}</span>
//         ${font.description ? `<p class="font-description" data-testid="text-font-description-${index}">${font.description}</p>` : ''}
//         ${pairsHTML}
//       </div>
//     `;
//   }

//   function displayError(message) {
//     resultsContainer.innerHTML = `
//       <div class="error" data-testid="text-error">
//         ${message}
//       </div>
//     `;
//   }
// });