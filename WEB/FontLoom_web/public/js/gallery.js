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
  const galleryContent = document.getElementById('gallery-content');
  const clusters = GALLERY_DATA || [];

  if (!clusters.length) {
    galleryContent.innerHTML = `<div class="error">No font collections available.</div>`;
    return;
  }

  // Extract unique categories for filter
  const categories = [...new Set(clusters.flatMap(c => c.fonts.map(f => f.category)))];

  // Create filter bar
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';
  filterBar.innerHTML = `
    <button class="filter-btn active" data-category="all">All</button>
    ${categories.map(cat => `<button class="filter-btn" data-category="${cat}">${cat}</button>`).join('')}
  `;
  galleryContent.before(filterBar);
  const filterButtons = filterBar.querySelectorAll('.filter-btn');

  // Function to render fonts
  function renderFonts(selectedCategory = 'all') {
    let fontsToShow;
    if (selectedCategory === 'all') {
      fontsToShow = clusters.flatMap(c => c.fonts).sort(() => Math.random() - 0.5);
    } else {
      fontsToShow = clusters.flatMap(c => c.fonts.filter(f => f.category === selectedCategory));
    }

    const galleryHTML = `
      <div class="cluster">
        <div class="cluster-fonts">
          ${fontsToShow.map((font, index) => `
            <div class="cluster-font-card" data-testid="card-font-${index}">
              <div class="cluster-font-name" 
                   style="font-family: '${font.name}', ${getFallbackFont(font.category)};" 
                   data-testid="text-font-name-${index}">
                ${font.name}
              </div>
              <div class="cluster-font-bottom">
                <span class="cluster-font-category" data-testid="text-font-category-${index}">
                  ${font.category}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    galleryContent.innerHTML = galleryHTML;
  }

  // Initial render (all fonts)
  renderFonts();

  // Filter button click handling
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFonts(btn.dataset.category);
    });
  });

  // Load Google Fonts dynamically
  const fontNames = [...new Set(clusters.flatMap(c => c.fonts.map(f => f.name)))];
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${fontNames.map(f => 'family=' + f.replace(/ /g, '+')).join('&')}&display=swap`;
  document.head.appendChild(link);
});
