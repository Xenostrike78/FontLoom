

document.addEventListener("DOMContentLoaded", () => {
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
      const lockButtons = document.querySelectorAll(".lock-btn");
      const generateButtons = document.querySelectorAll(".generate-btn");
      const generateAllBtn = document.querySelector(".generate-all-btn");
      const apiUrl = `${API_BASE_URL}/api/recommendation`
      
      let lockedFonts = {};

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


      const DEFAULT_FONTS = {
        heading: "Playfair Display",
        subheading: "Poppins",
        paragraph: "Dancing Script"
      };
      const DEFAULT_CATEGORY = {
        heading: "serif",
        subheading: "sans-serif",
        paragraph: "cursive"
      };

      // Toggle lock/unlock
      lockButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          const target = btn.dataset.target;
          const ta = document.querySelector(`textarea[data-target="${target}"]`);
          const fontName = getComputedStyle(ta).fontFamily.replace(/['"]/g, "").split(",")[0];

          if (btn.textContent === "🔓") {
            btn.textContent = "🔒";
            lockedFonts[target] = fontName;
            btn.closest(".style-box").querySelector(".generate-btn").classList.add("disabled-btn");
          } else {
            btn.textContent = "🔓";
            delete lockedFonts[target];
            btn.closest(".style-box").querySelector(".generate-btn").classList.remove("disabled-btn");
          }
        });
      });

      // Handle individual "Generate Style" buttons
      generateButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
          const target = btn.dataset.target;

          try {
              const getLiveFont = (selector, fallback) => {
                const el = document.querySelector(`textarea[data-target="${selector}"]`);
                if (!el) return fallback;
                const currentFont = el.style.fontFamily || window.getComputedStyle(el).fontFamily;
                return currentFont.replace(/['"]/g, '').split(',')[0].trim() || fallback;
              };

              const allFonts = [
                getLiveFont("heading", DEFAULT_FONTS.heading),
                getLiveFont("subheading", DEFAULT_FONTS.subheading),
                getLiveFont("parapgrah", DEFAULT_FONTS.paragraph)
              ];

            const query = encodeURIComponent(allFonts.join(","));
            const res = await fetch(`${apiUrl}?font_names=${query}`);
            const data = await res.json();        

            if (data.recommendations && data.recommendations.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.recommendations.length);
              const newFont = data.recommendations[randomIndex].name;
              const newCategory = data.recommendations[randomIndex].category;

              applySingleFont(target, newFont,newCategory);
              console.log(`Updated ${target} → ${newFont} | ${newCategory}`);
            } else {
              console.warn(`No recommendations found for ${target}`);
            }
          } catch (err) {
            console.error("Error fetching recommendation:", err);
          }
        });
      });

      
      // Handle "Generate All Styles" button
      generateAllBtn.addEventListener("click", async () => {
        const fontNames = Object.keys(lockedFonts).length
          ? Object.values(lockedFonts)
          : Object.values(DEFAULT_FONTS);

        const query = fontNames.join(",");

        try {
          const res = await fetch(`${apiUrl}?font_names=${encodeURIComponent(query)}`);
          const data = await res.json();
          console.log("All recommendations:", data);

          if (data.recommendations && data.recommendations.length > 0) {
            applyRecommendations(data.recommendations);
          }
        } catch (err) {
          console.error("Error fetching all recommendations:", err);
        }
      });


      // Update all sections with new fonts
      function applyRecommendations(recs) {
        const sections = ["heading", "subheading", "paragraph"];
        sections.forEach((key, i) => {
          const fontName = recs[i]?.name || DEFAULT_FONTS[key];
          const category = recs[i]?.category || DEFAULT_CATEGORY[key];
          applySingleFont(key, fontName,category);
        });
      }


      // Update one section’s font and display name
      function applySingleFont(sectionKey, fontName,category) {
        const ta = document.querySelector(`textarea[data-target="${sectionKey}"]`);
        if (!ta) return;
        const fallback = getFallbackFont(category);
        ta.style.fontFamily = `"${fontName}", ${fallback}`;
        const label = ta.closest(".style-box").querySelector(".current-font");
        if (label) label.textContent = `${fontName} - ${category}`;
      }


      // Handle live font size changes
      const sliders = document.querySelectorAll(".size-slider");
      sliders.forEach(slider => {
        const target = slider.dataset.target;
        const ta = document.querySelector(`textarea[data-target="${target}"]`);
        const valueLabel = slider.closest(".font-size-control").querySelector(".size-value");

        slider.addEventListener("input", () => {
          const newSize = `${slider.value}px`;
          ta.style.fontSize = newSize;
          valueLabel.textContent = newSize;
        });
      });
  }


});
