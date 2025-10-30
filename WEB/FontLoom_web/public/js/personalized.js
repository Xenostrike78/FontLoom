function getFallbackFont(category) {
    switch (category?.toLowerCase()) {
      case "serif": return "serif";
      case "sans-serif": return "sans-serif";
      case "display": return "fantasy";         
      case "handwriting": return "cursive";
      case "cursive": return "cursive";
      case "monospace": return "monospace";
      case "system-ui": return "system-ui";
      default: return "sans-serif";
    }
  }
document.addEventListener('DOMContentLoaded', () => {
  let API_BASE_URL = null;

  fetch("/get-api-url")
    .then(res => res.json())
    .then(data => {
      API_BASE_URL = data.apiUrl;
      console.log("✅ API Base URL loaded:", API_BASE_URL);
      initPersonalized(API_BASE_URL);
    })
    .catch(err => console.error("❌ Error fetching API URL:", err));
  
  function initPersonalized(API_BASE_URL) {
      const fontSelectionGrid = document.getElementById('font-selection');
      const generateBtn = document.getElementById('generate-btn');
      const resultsContainer = document.getElementById('personalized-results');
      
      let likedFonts = [];

      const fontCards = fontSelectionGrid.querySelectorAll('.selectable-font-card');
      fontCards.forEach(card => {
        card.addEventListener('click', () => {
          toggleFontLike(card);
        });
      });

      // Generate button click handler
      generateBtn.addEventListener('click', async () => {
        if (likedFonts.length === 0) {
          displayMessage('Please select at least one font to generate personalized recommendations.');
          return;
        }

        // Show loading state
        resultsContainer.innerHTML = '<div class="loading" data-testid="text-loading">Generating your personalized recommendations...</div>';
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        try {
          const query = encodeURIComponent(likedFonts.join(','));
          console.log(query);
          
          const apiUrl = `${API_BASE_URL}/api/personalized?font_names=${query}`;
          console.log("SENDING REQUEST");
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error('Failed to fetch personalized recommendations');
          }

          const data = await response.json();
          displayResults(data);
        } catch (error) {
          displayError('Unable to generate personalized recommendations. Please try again.');
          console.error('Error:', error);
        }
      });

      function toggleFontLike(card) {
        const fontName = card.getAttribute('data-font');
        
        if (card.classList.contains('liked')) {
          // Unlike
          card.classList.remove('liked');
          likedFonts = likedFonts.filter(name => name !== fontName);
        } else {
          // Like
          card.classList.add('liked');
          likedFonts.push(fontName);
        }

        // Update button text to show count
        updateGenerateButton();
      }

      function updateGenerateButton() {
        if (likedFonts.length === 0) {
          generateBtn.textContent = 'Generate My Style';
        } else {
          generateBtn.textContent = `Generate My Style (${likedFonts.length} selected)`;
        }
      }

      function displayResults(data) {
        console.log(data);
        
        if (!data.suggestions || data.suggestions.length === 0) {
          resultsContainer.innerHTML = `
            <div class="results-header">
              <h3 class="results-title">No Suggestions Found</h3>
              <p class="results-subtitle">Try selecting different fonts</p>
            </div>
          `;
          return;
        }
        data.suggestions.forEach(font => loadFont(font.name));
        const resultsHTML = `
          <div class="results-header">
            <h3 class="results-title" data-testid="text-results-title">Your Personalized Recommendations</h3>
            <p class="results-subtitle" data-testid="text-results-subtitle">Based on your selection of ${data.based_on.length} font${data.based_on.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="suggestions-grid" data-testid="grid-suggestions">
            ${data.suggestions.map((font, index) => createSuggestionCard(font, index)).join('')}
          </div>
        `;

        resultsContainer.innerHTML = resultsHTML;
      }

      function createSuggestionCard(font, index) {
        const fallback = getFallbackFont(font.category);
        return `
          <div class="suggestion-card" data-testid="card-suggestion-${index}">
            <div class="suggestion-font-name" style="font-family: '${font.name}', ${fallback};" data-testid="text-suggestion-name-${index}">
              ${font.name}
            </div>
            <span class="suggestion-font-category" data-testid="text-suggestion-category-${index}">${font.category}</span>

          </div>
        `;
      }

      function loadFont(fontName) {
        const formattedName = fontName.replace(/ /g, '+');
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${formattedName}&display=swap`;
        link.rel = 'stylesheet';
        
        if (!document.querySelector(`link[href="${link.href}"]`)) {
          document.head.appendChild(link);
        }
      }


      function displayMessage(message) {
        resultsContainer.innerHTML = `
          <div class="instructions">
            <p class="instructions-text" data-testid="text-message">
              ${message}
            </p>
          </div>
        `;
      }

      function displayError(message) {
        resultsContainer.innerHTML = `
          <div class="error" data-testid="text-error">
            ${message}
          </div>
        `;
      }
  }
  
});
